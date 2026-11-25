import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const bundle = await build({
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  entryPoints: ['tests/swiss-inputs-fixture.tsx'], outfile: 'fixture.js', bundle: true,
  write: false, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
})
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })

try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setContent('<!doctype html><html lang="en"><body><main id="app"></main></body></html>')
  await page.addStyleTag({ content: bundle.outputFiles.find(f => f.path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find(f => f.path.endsWith('.js')).text })
  const iban = page.getByRole('textbox', { name: 'IBAN' })
  const ahv = page.getByRole('textbox', { name: 'AHV' })
  const phone = page.getByRole('textbox', { name: 'Phone' })
  const state = field => field.evaluate(el => ({
    valid: el.checkValidity(), custom: el.validity.customError,
    missing: el.validity.valueMissing, message: el.validationMessage,
  }))
  const data = () => page.locator('form').evaluate(form => Object.fromEntries(new FormData(form)))
  async function edit(field, value) {
    await field.fill(value)
    await field.press('Tab')
  }

  assert.equal(await iban.inputValue(), 'CH93 0076 2011 6238 5295 7')
  assert.equal(await phone.inputValue(), '+41 79 123 45 67')
  assert.ok((await state(iban)).valid)
  assert.ok((await state(ahv)).valid)
  assert.match(await iban.getAttribute('class'), /\baccount-field\b/)
  await page.getByRole('button', { name: 'Focus account' }).click()
  assert.ok(await iban.evaluate(el => document.activeElement === el))
  await iban.fill('CH93007620')
  assert.equal(await iban.inputValue(), 'CH93007620')
  await iban.press('Tab')
  assert.deepEqual(await state(iban), { valid: false, custom: true, missing: false, message: 'Check the account number.' })
  await edit(iban, 'CH9300762011623852958')
  assert.equal(await iban.inputValue(), 'CH9300762011623852958')
  assert.equal((await state(iban)).valid, false)
  await edit(iban, 'li21088100002324013aa')
  assert.equal(await iban.inputValue(), 'LI21 0881 0000 2324 013A A')
  assert.ok((await state(iban)).valid)
  await edit(iban, '')
  assert.ok((await state(iban)).missing)
  assert.equal((await state(iban)).custom, false)

  await edit(ahv, '7561234567897')
  assert.equal(await ahv.inputValue(), '756.1234.5678.97')
  assert.ok((await state(ahv)).valid)
  await edit(ahv, '756.1234.5678.98')
  assert.deepEqual(await state(ahv), { valid: false, custom: true, missing: false, message: 'Check the insurance number.' })
  await page.getByRole('button', { name: 'Reset form' }).click()
  assert.equal(await iban.inputValue(), 'CH93 0076 2011 6238 5295 7')
  assert.equal(await ahv.inputValue(), '')
  assert.ok((await state(ahv)).valid)
  assert.ok((await state(iban)).valid)

  await phone.fill('+41791234567')
  const events = await page.locator('#events').innerText()
  assert.ok(Number(events) > 0)
  await phone.press('Tab')
  assert.equal(await page.locator('#events').innerText(), events)
  assert.equal(await phone.inputValue(), '+41 79 123 45 67')
  assert.deepEqual(await data(), { account: 'CH93 0076 2011 6238 5295 7', insurance: '', phone: '+41 79 123 45 67' })
  await edit(phone, '+41 79 12')
  assert.equal(await phone.inputValue(), '+41 79 12')
  assert.ok((await state(phone)).custom)
  await page.getByRole('button', { name: 'Load saved phone' }).click()
  assert.equal(await phone.inputValue(), '+41 44 123 45 67')
  assert.ok((await state(phone)).valid)
  await page.getByRole('button', { name: 'Clear saved phone' }).click()
  assert.equal(await phone.inputValue(), '')
  assert.ok((await state(phone)).valid)
  assert.deepEqual(errors, [])
  console.log('Swiss identifier inputs passed formatting, validity, native form, controlled value, blur and reset checks.')
} finally {
  await browser.close()
}
