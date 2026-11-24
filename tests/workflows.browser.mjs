import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const project = fileURLToPath(new URL('../', import.meta.url))
const { outputFiles } = await build({
  absWorkingDir: project,
  entryPoints: ['tests/workflows-fixture.tsx'],
  outfile: 'fixture.js', bundle: true, write: false,
  define: { 'process.env.NODE_ENV': '"development"' },
})
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const launch = executable ? { executablePath: executable } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' }
const browser = await chromium.launch({ headless: true, ...launch })
try {
  const page = await browser.newPage({ timezoneId: 'Pacific/Honolulu' })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.setContent('<!doctype html><html lang="en"><head><title>Test</title></head><body><div id="app"></div></body></html>')
  await page.addStyleTag({ content: outputFiles.find((file) => file.path.endsWith('.css')).text })
  await page.addScriptTag({ content: outputFiles.find((file) => file.path.endsWith('.js')).text })
  const button = (name) => page.getByRole('button', { name, exact: true })
  const cursor = () => page.locator(':focus').getAttribute('data-day')
  const calendar = page.locator('section.al-calendar').first()
  const day = (date) => calendar.locator('[data-day="' + date + '"]')
  await day('2024-02-29').focus()
  await page.keyboard.press('ArrowRight')
  assert.equal(await cursor(), '2024-03-01')
  await page.keyboard.press('Home')
  assert.equal(await cursor(), '2024-02-26')
  await page.keyboard.press('End')
  assert.equal(await cursor(), '2024-03-03')
  await page.keyboard.press('ArrowUp')
  assert.equal(await cursor(), '2024-02-25')
  await page.keyboard.press('PageUp')
  await page.keyboard.press('PageUp')
  assert.equal(await cursor(), '2024-01-10')
  assert.equal(await button('Mese precedente').isDisabled(), true)
  await page.keyboard.press('Shift+PageDown')
  assert.equal(await cursor(), '2025-01-10')
  await page.keyboard.press('Enter')
  assert.equal(await day('2025-01-10').locator('..').getAttribute('aria-selected'), 'true')
  for (const [locale, monday] of [['de-CH','Montag'],['fr-CH','lundi'],['rm-CH','glindesdi'],['it-CH','lunedì']]) {
    await page.getByRole('combobox', { name:'Language' }).selectOption(locale)
    assert.equal(await calendar.getByRole('columnheader').first().getAttribute('aria-label'), monday)
  }
  await page.getByRole('button', { name: /^Collection/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ state: 'visible' })
  assert.equal(await cursor(), '2024-02-29')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await dialog.waitFor({ state: 'hidden' })
  assert.equal(await page.locator('input[name=day]').inputValue(), '2024-03-01')
  assert.equal(await page.getByRole('button', { name: /^Collection/ }).evaluate((node) => node === document.activeElement), true)

  const paste = async (field, value) => field.evaluate((input, value) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text', value)
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
  }, value)
  const otp = page.getByRole('textbox', { name: 'Code' })
  const controlled = page.getByRole('textbox', { name: 'Controlled' })
  await otp.evaluate((el) => el.select())
  await paste(otp, '０１-23 45')
  assert.equal(await otp.inputValue(), '012345')
  assert.equal(await otp.evaluate((field) => field.checkValidity()), true)
  await controlled.focus()
  await paste(controlled, '00 89')
  assert.equal(await controlled.inputValue(), '0089')
  await controlled.press('End')
  await controlled.pressSequentially('x12')
  assert.equal(await controlled.inputValue(), '008912')
  const form = page.getByRole('form', { name: 'Data' })
  const payload = () => form.evaluate((node) => Array.from(new FormData(node).entries()))
  await page.getByRole('listbox', { name: 'Paper' }).selectOption(['A3', 'A4'])
  await button('Text').click()
  assert.deepEqual(await payload(), [['day', '2024-03-01'],['otp','012345'],['paper','A3'],['paper','A4'],['channel','a'],['channel','b']])
  await button('Reset').click()
  assert.deepEqual(await payload(), [['day','2024-02-29'],['otp','0123'],['paper','A4'],['channel','a']])
  assert.equal(await button('Next').isDisabled(), true)
  await page.getByRole('radio', { name: 'Smooth' }).check()
  await button('Next').click()
  await button('Back').click()
  assert.equal(await page.getByRole('radio', { name: 'Smooth' }).isChecked(), true)
  await button('Next').click()
  await page.getByRole('radio', { name: 'Standard' }).check()
  await button('Submit').click()
  assert.deepEqual(JSON.parse(await page.locator('#response').textContent()), { paper: 'b', size: 'std' })
  await page.locator('summary').click()
  assert.equal(await page.getByText('Batch 12').isVisible(), true)
  const log = page.getByRole('log', { name: 'Messages' })
  await log.evaluate((node) => { node.scrollTop = 0 })
  await button('Jump to the latest message').waitFor()
  await button('Add message').click()
  assert.equal(await log.evaluate((node) => node.scrollTop), 0)
  await button('Jump to the latest message').click()
  assert.ok(await log.evaluate((node) => Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop) < 2))
  assert.deepEqual(errors, [])
  console.log('Civil dates, four Swiss languages, focus, paste handling, forms and logs passed.')
} finally { await browser.close() }
