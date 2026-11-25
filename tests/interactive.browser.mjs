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
    '<!doctype html><html lang="en"><head><title>Alpina test</title></head><body><div id="app"></div></body></html>',
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

  await button('Open window').focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Local settings' })
  await dialog.waitFor({ state: 'visible' })
  assert.ok(
    await dialog.evaluate(
      (node) => node.matches(':modal') && node.contains(document.activeElement),
    ),
  )
  await button('Done').focus()
  await page.keyboard.press('Tab')
  assert.ok(
    await dialog.evaluate(
      (node) => node.contains(document.activeElement) || document.activeElement === document.body,
    ),
  )
  if (await page.evaluate(() => document.activeElement === document.body))
    await page.keyboard.press('Tab')
  await focusIs(button('Close window'))
  await button('Local actions').focus()
  await page.keyboard.press('ArrowDown')
  await focusIs(item('Open'))
  await page.keyboard.press('Escape')
  await focusIs(button('Local actions'))
  assert.ok(await dialog.isVisible())
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  await focusIs(button('Open window'))
  await button('Open window').click()
  await dialog.waitFor({ state: 'visible' })
  await page.mouse.click(2, 2)
  await dialog.waitFor({ state: 'hidden' })

  await button('Open panel').click()
  const sheet = page.getByRole('dialog', { name: 'Panel' })
  await sheet.waitFor({ state: 'visible' })
  const bounds = await sheet.boundingBox()
  assert.ok(bounds && Math.abs(bounds.x) < 2 && Math.abs(bounds.height - 844) < 2)
  await button('Apply').click()
  await sheet.waitFor({ state: 'hidden' })
  await focusIs(button('Open panel'))

  await tab('Italian').focus()
  await page.keyboard.press('ArrowRight')
  await focusIs(tab('German'))
  assert.equal(await tab('German').getAttribute('aria-selected'), 'true')
  assert.ok(await page.getByRole('tabpanel', { name: 'German' }).isVisible())
  await page.keyboard.press('Home')
  await focusIs(tab('Italian'))
  await page.keyboard.press('ArrowLeft')
  await focusIs(tab('German'))

  await button('First section').focus()
  await page.keyboard.press('Space')
  assert.ok(await page.getByRole('region', { name: 'First section' }).isVisible())
  await page.keyboard.press('ArrowDown')
  await focusIs(button('Second section'))
  await page.keyboard.press('Enter')
  assert.ok(await page.getByRole('region', { name: 'Second section' }).isVisible())
  assert.equal(await button('First section').getAttribute('aria-expanded'), 'false')
  await page.keyboard.press('Space')
  assert.equal(await button('Second section').getAttribute('aria-expanded'), 'false')

  await button('Actions').focus()
  await page.keyboard.press('ArrowUp')
  await focusIs(item('Save'))
  const menuBounds = await page.getByRole('menu').boundingBox()
  assert.ok(menuBounds && menuBounds.x >= 0 && menuBounds.x + menuBounds.width <= 390)
  await page.keyboard.press('Home')
  await focusIs(item('Open'))
  await page.keyboard.press('e')
  await focusIs(item('Edit'))
  await page.keyboard.press('Enter')
  assert.ok(await page.getByRole('menu').isVisible())
  assert.equal(await page.locator('[data-choice]').textContent(), '')
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  assert.equal(await page.locator('[data-choice]').textContent(), 'save')
  await focusIs(button('Actions'))
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Tab')
  await focusIs(button('Next control'))
  assert.equal(await page.getByRole('menu').count(), 0)
  await button('Actions').focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Shift+Tab')
  await focusIs(button('Second section'))
  await button('Actions').click()
  await button('Next control').click()
  assert.equal(await page.getByRole('menu').count(), 0)

  await button('Help').focus()
  await page.getByRole('tooltip').waitFor({ state: 'visible' })
  assert.ok((await button('Help').getAttribute('aria-describedby')).startsWith('context '))
  await page.keyboard.press('Escape')
  await page.getByRole('tooltip').waitFor({ state: 'hidden' })
  await focusIs(button('Help'))
  await button('Save preferences').click()
  assert.equal(await page.locator('[role="status"]').textContent(), 'Preferences saved')
  await page.keyboard.press('Tab')
  await focusIs(button('Dismiss notification'))
  await page.keyboard.press('Enter')
  await focusIs(button('Save preferences'))
  assert.equal(await page.locator('[role="status"]').textContent(), '')

  const invoices = page.getByRole('table', { name: 'Invoices', exact: true })
  const rowIds = (table) => table.locator('tbody tr > td:first-child').allTextContents()
  assert.ok(await invoices.evaluate((node) => node.matches('.al-table')))
  assert.deepEqual(await rowIds(invoices), ['B', 'A', 'C'])
  assert.equal(await invoices.locator('[aria-sort]').count(), 0)
  assert.equal(await invoices.getByRole('button', { name: 'Note' }).count(), 0)
  const amount = invoices.getByRole('button', { name: 'Amount' })
  const amountHeader = invoices.getByRole('columnheader', { name: 'Amount' })
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
  await invoices.getByRole('button', { name: 'Reference' }).click()
  assert.equal(await amountHeader.getAttribute('aria-sort'), null)
  assert.equal(await invoices.locator('th[aria-sort="ascending"]').count(), 1)
  assert.deepEqual(await rowIds(invoices), ['A', 'B', 'C'])

  const controlled = page.getByRole('table', { name: 'Controlled invoices' })
  await controlled.getByRole('button', { name: 'Amount' }).click()
  assert.equal(await controlled.locator('[aria-sort]').count(), 0)
  assert.deepEqual(await rowIds(controlled), ['B', 'A', 'C'])
  await button('Apply sort').click()
  assert.equal(
    await controlled.getByRole('columnheader', { name: 'Amount' }).getAttribute('aria-sort'),
    'ascending',
  )
  assert.deepEqual(await rowIds(controlled), ['A', 'B', 'C'])
  const empty = page
    .getByRole('table', { name: 'Archive' })
    .getByRole('cell', { name: "The archive is empty" })
  assert.equal(await empty.getAttribute('colspan'), '3')
  await page.setViewportSize({ width: 360, height: 640 })
  await button('Queue confirmations').click()
  await page.evaluate(() => window.scrollTo(0, 0))
  const confirmation = page.locator('.al-toaster')
  await confirmation.getByRole('status').getByText('Request saved').waitFor()
  const box = await confirmation.boundingBox()
  assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 360 && box.y + box.height <= 640)
  assert.equal(await confirmation.getByText('Receipt ready').count(), 0)
  await button('Dismiss confirmation').click()
  await confirmation.getByRole('status').getByText('Receipt ready').waitFor()
  await button('Dismiss confirmation').click()
  await confirmation.getByRole('status').waitFor({ state: 'detached' })
  assert.deepEqual(errors, [])
  console.log(
    '✓ Dialog, Sheet, Tabs, Accordion, DropdownMenu, Tooltip, Toast and DataTable in Chromium',
  )
} finally {
  await browser.close()
}
