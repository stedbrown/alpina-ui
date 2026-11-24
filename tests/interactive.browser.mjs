import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const project = fileURLToPath(new URL('../', import.meta.url))
const result = await build({
  absWorkingDir: project,
  entryPoints: ['tests/interactive-fixture.tsx'],
  outfile: 'fixture.js',
  bundle: true,
  write: false,
  define: { 'process.env.NODE_ENV': '"development"' },
})
const javascript = result.outputFiles.find((file) => file.path.endsWith('.js')).text
const css = result.outputFiles.find((file) => file.path.endsWith('.css')).text
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const settings = executable
  ? { executablePath: executable }
  : existsSync(chromium.executablePath())
    ? {}
    : { channel: 'chrome' }
const browser = await chromium.launch({ headless: true, ...settings })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.setContent(
    '<!doctype html><html lang="it-CH"><head><title>Test Alpina</title></head><body><div id="app"></div></body></html>',
  )
  await page.addStyleTag({ content: css })
  await page.addScriptTag({ content: javascript })
  const button = (name) => page.getByRole('button', { name, exact: true })
  const tab = (name) => page.getByRole('tab', { name, exact: true })
  const item = (name) => page.getByRole('menuitem', { name, exact: true })
  const focusIs = async (target) => {
    await target.waitFor({ state: 'attached' })
    assert.ok(
      await target.evaluate((element) => element === document.activeElement),
      'unexpected keyboard focus',
    )
  }

  await button('Apri finestra').focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Impostazioni locali' })
  await dialog.waitFor({ state: 'visible' })
  assert.ok(
    await dialog.evaluate(
      (node) => node.matches(':modal') && node.contains(document.activeElement),
    ),
  )
  await button('Fine').focus()
  await page.keyboard.press('Tab')
  assert.ok(
    await dialog.evaluate(
      (node) => node.contains(document.activeElement) || document.activeElement === document.body,
    ),
  )
  if (await page.evaluate(() => document.activeElement === document.body))
    await page.keyboard.press('Tab')
  await focusIs(button('Chiudi finestra'))
  await button('Azioni locali').focus()
  await page.keyboard.press('ArrowDown')
  await focusIs(item('Apri'))
  await page.keyboard.press('Escape')
  await focusIs(button('Azioni locali'))
  assert.ok(await dialog.isVisible())
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  await focusIs(button('Apri finestra'))
  await button('Apri finestra').click()
  await dialog.waitFor({ state: 'visible' })
  await page.mouse.click(2, 2)
  await dialog.waitFor({ state: 'hidden' })

  await button('Apri pannello').click()
  const sheet = page.getByRole('dialog', { name: 'Pannello' })
  await sheet.waitFor({ state: 'visible' })
  const bounds = await sheet.boundingBox()
  assert.ok(bounds && Math.abs(bounds.x) < 2 && Math.abs(bounds.height - 844) < 2)
  await button('Applica').click()
  await sheet.waitFor({ state: 'hidden' })
  await focusIs(button('Apri pannello'))

  await tab('Italiano').focus()
  await page.keyboard.press('ArrowRight')
  await focusIs(tab('Tedesco'))
  assert.equal(await tab('Tedesco').getAttribute('aria-selected'), 'true')
  assert.ok(await page.getByRole('tabpanel', { name: 'Tedesco' }).isVisible())
  await page.keyboard.press('Home')
  await focusIs(tab('Italiano'))
  await page.keyboard.press('ArrowLeft')
  await focusIs(tab('Tedesco'))

  await button('Prima sezione').focus()
  await page.keyboard.press('Space')
  assert.ok(await page.getByRole('region', { name: 'Prima sezione' }).isVisible())
  await page.keyboard.press('ArrowDown')
  await focusIs(button('Seconda sezione'))
  await page.keyboard.press('Enter')
  assert.ok(await page.getByRole('region', { name: 'Seconda sezione' }).isVisible())
  assert.equal(await button('Prima sezione').getAttribute('aria-expanded'), 'false')
  await page.keyboard.press('Space')
  assert.equal(await button('Seconda sezione').getAttribute('aria-expanded'), 'false')

  await button('Azioni').focus()
  await page.keyboard.press('ArrowUp')
  await focusIs(item('Salva'))
  const menuBounds = await page.getByRole('menu').boundingBox()
  assert.ok(menuBounds && menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= 390)
  await page.keyboard.press('Home')
  await focusIs(item('Apri'))
  await page.keyboard.press('m')
  await focusIs(item('Modifica'))
  await page.keyboard.press('Enter')
  assert.ok(await page.getByRole('menu').isVisible())
  assert.equal(await page.locator('[data-choice]').textContent(), '')
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  assert.equal(await page.locator('[data-choice]').textContent(), 'save')
  await focusIs(button('Azioni'))
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Tab')
  await focusIs(button('Seguito'))
  assert.equal(await page.getByRole('menu').count(), 0)
  await button('Azioni').focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Shift+Tab')
  await focusIs(button('Seconda sezione'))
  await button('Azioni').click()
  await button('Seguito').click()
  assert.equal(await page.getByRole('menu').count(), 0)

  await button('Aiuto').focus()
  await page.getByRole('tooltip').waitFor({ state: 'visible' })
  assert.ok((await button('Aiuto').getAttribute('aria-describedby')).startsWith('context '))
  await page.keyboard.press('Escape')
  await page.getByRole('tooltip').waitFor({ state: 'hidden' })
  await focusIs(button('Aiuto'))
  await button('Salva preferenze').click()
  assert.equal(await page.locator('[role="status"]').textContent(), 'Preferenze salvate')
  await page.keyboard.press('Tab')
  await focusIs(button('Chiudi avviso'))
  await page.keyboard.press('Enter')
  await focusIs(button('Salva preferenze'))
  assert.equal(await page.locator('[role="status"]').textContent(), '')

  const invoices = page.getByRole('table', { name: 'Fatture', exact: true })
  const rowIds = (table) => table.locator('tbody tr > td:first-child').allTextContents()
  assert.ok(await invoices.evaluate((node) => node.matches('.al-table')))
  assert.deepEqual(await rowIds(invoices), ['B', 'A', 'C'])
  assert.equal(await invoices.locator('[aria-sort]').count(), 0)
  assert.equal(await invoices.getByRole('button', { name: 'Nota' }).count(), 0)
  const amount = invoices.getByRole('button', { name: 'Importo' })
  const amountHeader = invoices.getByRole('columnheader', { name: 'Importo' })
  await amount.focus()
  await page.keyboard.press('Enter')
  await focusIs(amount)
  assert.equal(await amountHeader.getAttribute('aria-sort'), 'ascending')
  assert.deepEqual(await rowIds(invoices), ['A', 'B', 'C'])
  assert.equal(await amountHeader.evaluate((el) => getComputedStyle(el).textAlign), 'end')
  assert.deepEqual(
    await amountHeader.evaluate((el) => [
      getComputedStyle(el).fontSize,
      getComputedStyle(el).lineHeight,
    ]),
    ['14px', '20px'],
  )
  assert.deepEqual(
    await invoices
      .locator('tbody td')
      .first()
      .evaluate((el) => [getComputedStyle(el).fontSize, getComputedStyle(el).lineHeight]),
    ['16px', '24px'],
  )
  assert.equal(await amount.evaluate((el) => getComputedStyle(el).outlineStyle), 'solid')
  await page.keyboard.press('Space')
  assert.equal(await amountHeader.getAttribute('aria-sort'), 'descending')
  assert.deepEqual(await rowIds(invoices), ['B', 'C', 'A'])
  await invoices.getByRole('button', { name: 'Riferimento' }).click()
  assert.equal(await amountHeader.getAttribute('aria-sort'), null)
  assert.equal(await invoices.locator('th[aria-sort="ascending"]').count(), 1)
  assert.deepEqual(await rowIds(invoices), ['A', 'B', 'C'])

  const controlled = page.getByRole('table', { name: 'Fatture controllate' })
  await controlled.getByRole('button', { name: 'Importo' }).click()
  assert.equal(await controlled.locator('[aria-sort]').count(), 0)
  assert.deepEqual(await rowIds(controlled), ['B', 'A', 'C'])
  await button('Applica ordinamento').click()
  assert.equal(
    await controlled.getByRole('columnheader', { name: 'Importo' }).getAttribute('aria-sort'),
    'ascending',
  )
  assert.deepEqual(await rowIds(controlled), ['A', 'B', 'C'])
  const empty = page
    .getByRole('table', { name: 'Archivio' })
    .getByRole('cell', { name: "L'archivio è vuoto" })
  assert.equal(await empty.getAttribute('colspan'), '3')
  assert.deepEqual(errors, [])
  console.log(
    '✓ Dialog, Sheet, Tabs, Accordion, DropdownMenu, Tooltip, Toast e DataTable in Chromium',
  )
} finally {
  await browser.close()
}
