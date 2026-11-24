import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const project = new URL('../', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('package.json', project)))
const registry = JSON.parse(await readFile(new URL('registry.json', project)))
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const launch = executable
  ? { executablePath: executable }
  : existsSync(chromium.executablePath())
    ? {}
    : { channel: 'chrome' }
const browser = await chromium.launch(launch)
try {
  const context = await browser.newContext({ offline: true, viewport: { width: 1440, height: 940 } })
  const page = await context.newPage()
  const site = new URL('site/index.html', project).href
  const main = page.getByRole('main')
  const view = (name) => main.getByRole('button', { name, exact: true })
  await page.goto(site + '#swiss-address-form')
  const recipient = main.getByRole('textbox').first()
  await recipient.fill('Studio tipografico')
  const width = main.getByLabel('Larghezza', { exact: true })
  await width.selectOption('320')
  assert.equal(Math.round((await main.locator('.preview-object').boundingBox()).width), 320)
  await view('Codice').click()
  await view('API').click()
  await main.getByRole('heading', { name: 'Riferimento API' }).waitFor()
  assert.equal(new URL(page.url()).hash, '#swiss-address-form/api')
  assert.ok(await main.getByRole('rowheader', { name: /onSave/ }).isVisible())
  await page.goBack()
  await main.getByText('Esempio.tsx', { exact: true }).waitFor()
  await page.goForward()
  await view('Anteprima').click()
  assert.equal(await recipient.inputValue(), 'Studio tipografico')
  assert.equal(await width.inputValue(), '320')
  assert.equal(
    await page.evaluate(() => JSON.stringify(localStorage).includes('Studio tipografico')),
    false,
  )
  await page.setViewportSize({ width: 320, height: 740 })
  await width.selectOption('768')
  assert.ok((await main.locator('.preview-object').boundingBox()).width <= 320)
  for (const entry of registry.items) {
    await page.goto(site + '#' + entry.name + '/api')
    await page.waitForFunction(
      (id) =>
        document.querySelector('#index-list a[aria-current=page]')?.getAttribute('href') === '#' + id,
      entry.name,
    )
    await main.getByRole('heading', { name: 'Riferimento API' }).waitFor()
    assert.equal(await view('API').getAttribute('aria-pressed'), 'true', entry.name)
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      entry.name + ' API overflow',
    )
  }
  await page.goto(site + '#dialog/codice')
  await view('Anteprima').click()
  await main.locator('.preview-object [aria-haspopup="dialog"]').click()
  await page.locator('dialog[open]').waitFor()
  await page.goBack()
  await main.getByText('Esempio.tsx', { exact: true }).waitFor()
  await page.waitForFunction(() => !document.querySelector('dialog[open]'))
  await page.goto(site + '#guide/start')
  const download = main.getByRole('link', { name: 'Scarica Alpina UI ' + manifest.version })
  const waiting = page.waitForEvent('download')
  await download.click()
  const result = await waiting
  const archiveName = 'alpina-ui-' + manifest.version + '.tgz'
  assert.equal(result.suggestedFilename(), archiveName)
  assert.deepEqual(
    await readFile(await result.path()),
    await readFile(new URL('site/' + archiveName, project)),
  )
  console.log(
    '78 schede API verificate a 320 px, campione preservato tra le viste, cronologia e download offline verificati.',
  )
} finally {
  await browser.close()
}