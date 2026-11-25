import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'
const project = fileURLToPath(new URL('../', import.meta.url))
const bundle = await build({
  absWorkingDir: project,
  entryPoints: ['tests/actions-v3-fixture.tsx'],
  outfile: 'fixture.js',
  bundle: true,
  write: false,
})
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch({
  headless: true,
  ...(executable
    ? { executablePath: executable }
    : existsSync(chromium.executablePath())
      ? {}
      : { channel: 'chrome' }),
})
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.setContent(
    '<!doctype html><html lang="en"><head><title>Alpina UI</title></head><body><div id="app"></div></body></html>',
  )
  await page.addStyleTag({ content: bundle.outputFiles.find((f) => f.path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find((f) => f.path.endsWith('.js')).text })
  const el = (role, name) => page.getByRole(role, { name, exact: true })
  const active = async (locator) => {
    await locator.waitFor({ state: 'visible' })
    const handle = await locator.elementHandle()
    await page.waitForFunction((node) => node === document.activeElement, handle, { timeout: 2000 })
  }
  const combo = el('combobox', 'Format')
  await combo.focus()
  await combo.press('ArrowDown')
  await combo.press('Enter')
  assert.equal(await combo.inputValue(), 'A3')
  assert.equal(
    await page.locator('form').evaluate((form) => new FormData(form).get('format')),
    'a3',
  )
  await combo.fill('zz')
  await el('status', '').filter({ hasText: 'No matching sizes' }).waitFor()
  await combo.press('Escape')
  assert.equal(await combo.inputValue(), 'A3')
  await combo.press('Alt+ArrowDown')
  assert.equal(await combo.getAttribute('aria-expanded'), 'true')
  await combo.press('Alt+ArrowUp')
  assert.equal(await combo.getAttribute('aria-expanded'), 'false')
  await el('button', 'Clear format').click()
  await active(combo)
  assert.equal(await combo.inputValue(), '')
  await page.locator('form').evaluate((form) => form.reportValidity())
  await page.getByText('Choose an option.', { exact: true }).waitFor()
  await el('button', 'Reset').click()
  assert.equal(await combo.inputValue(), 'A4')
  await el('button', 'Search').click()
  const cmd = el('combobox', 'Find an action')
  await active(cmd)
  await cmd.fill('run')
  await cmd.press('Enter')
  await active(el('button', 'Search'))
  assert.equal(await page.locator('output').textContent(), 's')
  await el('button', 'Remove').click()
  await active(el('button', 'Cancel'))
  await page.mouse.click(1, 1)
  assert.ok(await el('alertdialog', 'Remove item?').isVisible())
  await el('button', 'Confirm').click()
  await active(el('button', 'Remove'))
  assert.equal(await page.locator('output').textContent(), 'confirmed')
  await el('button', 'Next').click()
  assert.ok(await el('group', 'Second').isVisible())
  await el('region', 'Proofs').focus()
  await page.keyboard.press('ArrowRight')
  assert.ok(await el('group', 'First').isVisible())
  const context = el('group', 'Actions area')
  await context.focus()
  await context.press('Shift+F10')
  await active(el('menuitem', 'Cover'))
  await page.keyboard.press('p')
  await active(el('menuitem', 'Print'))
  await page.keyboard.press('Escape')
  await active(context)
  await context.click({ button: 'right' })
  await el('menuitem', 'Cover').click()
  assert.equal(await page.locator('output').textContent(), 'c')
  await el('menuitem', 'File').focus()
  await page.keyboard.press('ArrowDown')
  await active(el('menuitem', 'Cover'))
  await page.keyboard.press('ArrowRight')
  await active(el('menuitem', 'Zoom in'))
  await page.keyboard.press('Enter')
  await active(el('menuitem', 'View'))
  assert.equal(await page.locator('output').textContent(), 'zoom')
  await el('button', 'Show panel').click()
  const drawer = el('dialog', 'Settings'),
    box = await drawer.boundingBox(),
    grip = await page.locator('.al-drawer-grip').boundingBox()
  assert.ok(box && Math.abs(box.y + box.height - 844) < 2)
  await page.mouse.move(grip.x + 20, grip.y + 10)
  await page.mouse.down()
  await page.mouse.move(grip.x + 20, grip.y + 110, { steps: 5 })
  await page.mouse.up()
  await drawer.waitFor({ state: 'hidden' })
  await active(el('button', 'Show panel'))
  const hover = el('button', 'Leading')
  await hover.focus()
  await el('region', 'Definition').waitFor({ state: 'visible' })
  await hover.press('Tab')
  await active(el('link', 'Glossary'))
  await page.keyboard.press('Escape')
  await active(hover)
  await el('region', 'Definition').waitFor({ state: 'hidden' })
  const trigger = el('button', 'Show options'),
    pop = el('dialog', 'Quick actions')
  await trigger.click()
  await active(pop)
  await page.keyboard.press('Tab')
  await active(el('button', 'Close options'))
  await page.keyboard.press('Tab')
  await active(el('button', 'Go'))
  await page.keyboard.press('Escape')
  await active(trigger)
  await trigger.click()
  await el('button', 'Reset').click()
  await active(el('button', 'Reset'))
  await pop.waitFor({ state: 'hidden' })
  const separator = el('separator', 'Index')
  await separator.focus()
  await separator.press('ArrowRight')
  assert.equal(await separator.getAttribute('aria-valuenow'), '42')
  await separator.press('Enter')
  assert.equal(await separator.getAttribute('aria-valuenow'), '10')
  await separator.press('Enter')
  assert.equal(await separator.getAttribute('aria-valuenow'), '42')
  const divider = await separator.boundingBox()
  await page.mouse.move(divider.x + divider.width / 2, divider.y + 10)
  await page.mouse.down()
  await page.mouse.move(divider.x + 52, divider.y + 10, { steps: 4 })
  await page.mouse.up()
  assert.ok(Number(await separator.getAttribute('aria-valuenow')) > 45)
  await page.locator('.al-resizable').evaluate((el) => (el.dir = 'rtl'))
  await separator.press('Home')
  await separator.press('ArrowLeft')
  assert.equal(await separator.getAttribute('aria-valuenow'), '12')
  await el('tab', 'Design').focus()
  await page.keyboard.press('ArrowRight')
  await active(el('tab', 'Production'))
  assert.equal(await el('tab', 'Design').getAttribute('aria-selected'), 'true')
  await page.keyboard.press('Space')
  assert.equal(await el('tab', 'Production').getAttribute('aria-selected'), 'true')
  assert.deepEqual(errors, [])
  console.log(
    '✓ Ten interactive components passed focus restoration, validation, keyboard and pointer checks in Chromium',
  )
} finally {
  await browser.close()
}
