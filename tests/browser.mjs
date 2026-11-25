import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright-core'
import ts from 'typescript'

const root = new URL('../', import.meta.url)
const registry = JSON.parse(await readFile(new URL('registry.json', root), 'utf8'))
const examples = new Map()
for (const file of await readdir(new URL('catalog/', root))) {
  if (!file.endsWith('.tsx')) continue
  const name = 'catalog/' + file
  const source = ts.createSourceFile(
    name,
    await readFile(new URL(name, root), 'utf8'),
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TSX,
  )
  for (const stmt of source.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name?.text.endsWith('Example') &&
        stmt.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      assert.ok(!examples.has(stmt.name.text), 'Duplicate catalog example: ' + stmt.name.text)
      examples.set(stmt.name.text, stmt.getText(source))
    }
  }
}
const url = new URL('site/catalog.html', root).href
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const launch = executable
  ? { executablePath: executable }
  : existsSync(chromium.executablePath())
    ? {}
    : { channel: 'chrome' }
const screenshotDir = process.env.ALPINA_SCREENSHOTS
if (screenshotDir) await mkdir(screenshotDir, { recursive: true })
const browser = await chromium.launch(launch)
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 940 },
    offline: true,
  })
  const page = await context.newPage()
  page.setDefaultTimeout(8000)
  const errors = []
  page.on('pageerror', (err) => errors.push(err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  const main = page.getByRole('main')
  const search = page.getByRole('searchbox', { name: 'Search components' })
  const openIndex = page.getByRole('button', { name: 'Browse components' })
  const theme = page.locator('[data-site-appearance]')
  const view = (label) => main.getByRole('button', { name: label, exact: true })
  const fits = async (label) =>
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label)
  const shot = async (name) => {
    if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, name + '.png') })
  }
  await page.goto(url)
  await main.getByRole('heading', { name: 'Alpina UI', level: 1 }).waitFor()
  await page.evaluate(() => document.fonts.ready)
  const width = main.getByLabel('Width', { exact: true })
  const gridButton = main.getByRole('button', { name: 'Show grid' })
  const guideLayer = main.locator('.al-grid-guides')
  const metrics = main.locator('.sp-measures dd')
  assert.equal(await gridButton.getAttribute('aria-pressed'), 'false')
  assert.equal(await guideLayer.count(), 0)
  assert.ok(registry.items.some(item => item.name === 'grid-overlay'))
  assert.equal(await page.locator('#index-list a').count(), registry.items.length)

  for (const screen of [1440, 768, 390]) {
    await page.setViewportSize({ width: screen, height: screen === 390 ? 844 : 940 })
    await fits('Specimen ' + screen)
    await shot('catalog-' + screen)
  }
  await gridButton.click()
  assert.equal(await gridButton.getAttribute('aria-pressed'), 'true')
  for (const [size, columns, margin, gutter, titleSize] of [
    [320, 4, 16, 12, 48],
    [640, 8, 24, 16, 48],
    [960, 12, 32, 24, 64],
  ]) {
    await width.selectOption(String(size))
    await page.waitForFunction(
      (px) => document.querySelector('.sp-measures dd')?.textContent === px + ' px',
      size,
    )
    assert.deepEqual(await metrics.allTextContents(), [
      size + ' px',
      String(columns),
      margin + ' px',
      gutter + ' px',
      '4 px',
      titleSize + ' / ' + titleSize + ' px',
    ])
    assert.equal(await guideLayer.locator('i:visible').count(), columns)
    assert.equal(
      await main.locator('.sp-poster-title').evaluate((el) => getComputedStyle(el).fontSize),
      titleSize + 'px',
    )
    await fits('Specimen ' + size + ' at viewport 390')
  }
  const specimen = main.getByRole('region', {
    name: 'Sample program for the design talks',
  })
  assert.ok(await specimen.evaluate((el) => el.scrollWidth > el.clientWidth && el.tabIndex === 0))
  await shot('catalog-grid-mobile')
  await width.selectOption('auto')
  await gridButton.click()
  assert.equal(await guideLayer.count(), 0)

  await openIndex.click()
  await search.fill('zzzaaa')
  await page.getByText('No matching components.').waitFor()
  for (const [words, href] of [
    ['canton filter', '#canton-select'],
    ['toolbar', '#stack'],
    ['search contacts', '#input'],
  ]) {
    await search.fill(words)
    await page.locator('#index-list a[href="' + href + '"]').waitFor()
  }
  await search.fill('CantonCombobox')
  assert.equal(await page.locator('#index-list a').count(), 1)
  await search.press('Enter')
  await main.getByRole('heading', { name: 'Canton search', level: 1 }).waitFor()
  assert.equal(await openIndex.getAttribute('aria-expanded'), 'false')
  assert.ok(await main.evaluate((el) => el === document.activeElement))
  await page.keyboard.press('Control+k')
  await search.waitFor()
  await search.press('Escape')
  assert.ok(await openIndex.evaluate((el) => el === document.activeElement))

  await theme.click()
  assert.equal(await page.locator('html').getAttribute('data-al-theme'), 'light')
  await theme.click()
  assert.equal(await page.locator('html').getAttribute('data-al-theme'), 'dark')
  await shot('catalog-dark-mobile')
  await page.reload()
  assert.match(await theme.innerText(), /Dark theme/)
  await theme.click()
  await page.setViewportSize({ width: 1440, height: 940 })

  await page
    .getByRole('navigation', { name: 'Library', exact: true })
    .getByRole('link', { name: 'Client address book' })
    .click()
  const clients = main.getByRole('list', { name: 'Clients' })
  const table = main.getByRole('table', { name: 'Orders for clients in the address book' })
  const total = table.getByRole('button', { name: 'Total' })
  const values = () =>
    table.locator('tbody data').evaluateAll((nodes) => nodes.map((el) => Number(el.value)))
  await clients.waitFor()
  assert.equal(await clients.getByRole('button').count(), 4)
  await total.click()
  assert.deepEqual(await values(), [96.5, 420, 875, 1280.5])
  await total.click()
  assert.deepEqual(await values(), [1280.5, 875, 420, 96.5])
  const filter = main.locator('#client-canton-filter')
  assert.equal(await main.getByRole('combobox', { name: 'Cantone', exact: true }).getAttribute('id'), 'client-canton-filter')
  await filter.fill('Zug')
  await filter.press('Enter')
  await main.getByText('No clients in this canton.').waitFor()
  await main.getByText('No orders for this canton.').waitFor()
  await main.getByRole('button', { name: 'Clear filter' }).click()
  await filter.fill('Genf')
  await filter.press('Enter')
  assert.equal(await clients.getByRole('button').count(), 1)
  await main.getByRole('button', { name: 'Français' }).click()
  assert.equal(await main.getByRole('combobox', { name: 'Canton', exact: true }).getAttribute('id'), 'client-canton-filter')
  await main.getByRole('button', { name: 'Edit address' }).click()
  const editor = page.getByRole('dialog').getByRole('form', { name: 'Adresse postale' })
  await editor.getByLabel('Destinataire').fill('Test studio')
  await editor.getByLabel('Canton', { exact: true }).selectOption('TI')
  await editor.getByLabel('Rue et numéro').fill('Rue Exemple 1')
  await editor.getByLabel('NPA', { exact: true }).fill('6900')
  await editor.getByLabel('Localité').fill('Lugano')
  await editor.getByRole('button', { name: 'Enregistrer l’adresse' }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  assert.equal(await filter.inputValue(), '')
  assert.equal(await clients.getByRole('button').count(), 4)
  assert.match(await main.locator('address').innerText(), /Test studio[\s\S]*6900 Lugano/)
  assert.ok(await table.getByRole('cell', { name: 'Test studio' }).isVisible())
  assert.equal(
    await page.evaluate(() => JSON.stringify(localStorage).includes('Test studio')),
    false,
  )
  await page.reload()
  await main.getByRole('heading', { name: 'Client address book', level: 1 }).waitFor()
  assert.match(await main.locator('address').innerText(), /Bureau Arve/)

  // Check the rendered copy against the actual file, allowing platform line endings.
  const normalize = (text) => text.replace(/\r\n/g, '\n')
  const inspected = new Set()
  for (const item of registry.items) {
    await page.goto(url + '#' + item.name)
    await page.waitForFunction(
      (name) =>
        document.querySelector('#index-list a[aria-current]')?.getAttribute('href') === '#' + name,
      item.name,
    )
    const preview = main.getByRole('region', { name: 'Interactive preview' })
    assert.ok(await preview.locator('.preview-object > *').count(), item.name)
    assert.equal(await view('Preview').getAttribute('aria-pressed'), 'true')
    await view('Code').click()
    const code = main.locator('.snippet code').first()
    const demoName = (await main.locator('.component-path').textContent()) + 'Example'
    const demoCode = await code.textContent()
    assert.ok(examples.has(demoName), demoName)
    assert.ok(
      normalize(demoCode).endsWith(normalize(examples.get(demoName))),
      item.name + ' demo source',
    )
    await view('Source').click()
    const select = main.getByLabel('Distributed files')
    assert.equal(await select.inputValue(), item.entry)
    const distributed = [...item.files, 'ALPINA-LICENSE.txt'].sort()
    assert.deepEqual((await select.locator('option').allTextContents()).sort(), distributed)
    for (const file of distributed) {
      if (inspected.has(file) && file !== item.entry) continue
      await select.selectOption(file)
      const original = await readFile(new URL(file === 'ALPINA-LICENSE.txt' ? 'LICENSE' : 'src/' + file, root), 'utf8')
      assert.ok(
        normalize(await code.textContent()) === normalize(original),
        item.name + ' → ' + file + ' differs from source',
      )
      inspected.add(file)
    }
    await view('Preview').click()
    assert.ok(await preview.isVisible(), item.name)
  }

  await page.goto(url + '#overview')
  await main.getByRole('link', { name: 'Design guide' }).click()
  const guide = main.locator('.guide-content')
  await guide.getByRole('heading', { level: 1 }).waitFor()
  assert.match(await guide.innerText(), /Hofmann/)
  assert.match(await guide.innerText(), /Müller-Brockmann/)
  assert.ok((await guide.getByRole('table').count()) >= 2)
  assert.ok((await guide.locator('a[href^="https://"]').count()) >= 3)
  await page.goBack()
  await main.getByRole('heading', { name: 'Alpina UI', level: 1 }).waitFor()
  await page.goForward()
  await guide.getByRole('heading', { level: 1 }).waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  for (const name of [
    'start',
    'core',
    'interactive',
    'swiss',
    'qr-bill',
    'validation',
    'api-stability',
    'design',
    'research',
    'portal',
    'elements',
    'actions',
    'workflows',
    'coverage',
    'migrate-1-0',
    'migration',
    'cli',
    'release',
    'directory',
  ]) {
    const source = await readFile(
      new URL(
        'docs/' + (['elements', 'actions', 'workflows'].includes(name) ? name + '-v3' : name) + '.md',
        root,
      ),
      'utf8',
    )
    const h1 = /^# (.+)$/m.exec(normalize(source))[1]
    await main.locator('.guide-nav a[href="#guide/' + name + '"]').click()
    await guide.getByRole('heading', { level: 1, name: h1 }).waitFor()
    assert.equal(
      await main.locator('.guide-nav [aria-current="page"]').getAttribute('href'),
      '#guide/' + name,
    )
    assert.ok((await guide.innerText()).length > 400)
    if (name === 'migration') {
      assert.equal(await guide.getByRole('link', { name: 'DataTable', exact: true }).getAttribute('href'), '#data-table')
      assert.equal(await guide.locator('table a[href^="#"]').count(), 66)
    }
    await fits('Guide ' + name)
  }
  assert.deepEqual(errors, [])
  console.log(
    'Offline catalog passed: ' + registry.items.length + ' previews, ' +
      inspected.size +
      ' source files, 19 guides, the 4/8/12-column specimen and the address book.',
  )
} finally {
  await browser.close()
}
