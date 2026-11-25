import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { ahvSchema } from 'alpina-ui/swiss/schemas'
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
  const uid = page.getByRole('textbox', { name: 'Business identifier' })
  const state = field => field.evaluate(el => ({
    valid: el.checkValidity(), custom: el.validity.customError,
    missing: el.validity.valueMissing, message: el.validationMessage,
  }))
  const data = () => page.locator('form').evaluate(form => Object.fromEntries(new FormData(form)))
  const reported = async key => JSON.parse(await page.locator('#values').innerText())[key]
  async function edit(field, value) {
    await field.fill(value)
    await field.press('Tab')
  }
  assert.equal(await uid.inputValue(), 'CHE-109.322.551')
  await edit(uid, 'CHE-109.322.552')
  assert.equal((await state(uid)).message, 'Check the business identifier.')
  await edit(uid, 'che109322551')
  assert.equal(await uid.inputValue(), 'CHE-109.322.551')
  assert.ok((await state(uid)).valid)
  assert.deepEqual(await reported('uid'), { value: 'CHE-109.322.551', normalized: 'CHE-109.322.551', valid: true })

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
  assert.deepEqual(await reported('iban'), { value: 'CH9300762011623852958', normalized: null, valid: false })
  assert.equal((await state(iban)).valid, false)
  await edit(iban, 'li21088100002324013aa')
  assert.deepEqual(await reported('iban'), { value: 'LI21 0881 0000 2324 013A A', normalized: 'LI21088100002324013AA', valid: true })
  assert.equal(await iban.inputValue(), 'LI21 0881 0000 2324 013A A')
  assert.ok((await state(iban)).valid)
  await edit(iban, '')
  assert.deepEqual(await reported('iban'), { value: '', normalized: null, valid: false })
  assert.ok((await state(iban)).missing)
  assert.equal((await state(iban)).message, 'Complete this field.')

  await edit(ahv, '7561234567897')
  assert.equal(await ahv.inputValue(), '756.1234.5678.97')
  assert.deepEqual(await reported('ahv'), { value: '756.1234.5678.97', normalized: '756.1234.5678.97', valid: true })
  assert.ok((await state(ahv)).valid)
  await edit(ahv, '756.1234.5678.98')
  assert.deepEqual(await state(ahv), { valid: false, custom: true, missing: false, message: 'Check the insurance number.' })
  await page.getByRole('button', { name: 'Reset form' }).click()
  assert.equal(await iban.inputValue(), 'CH93 0076 2011 6238 5295 7')
  assert.equal(await ahv.inputValue(), '')
  assert.ok((await state(ahv)).valid)
  assert.ok((await state(iban)).valid)

  await phone.fill('0791234567')
  assert.deepEqual(await reported('phone'), { value: '0791234567', normalized: '+41791234567', valid: true })
  const events = await page.locator('#events').innerText()
  assert.ok(Number(events) > 0)
  await phone.press('Tab')
  assert.equal(await page.locator('#events').innerText(), events)
  assert.equal(await phone.inputValue(), '+41 79 123 45 67')
  assert.deepEqual(await reported('phone'), { value: '+41 79 123 45 67', normalized: '+41791234567', valid: true })
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
  const language = page.getByRole('combobox', { name: 'Language' })
  const localizedPostal = page.getByRole('textbox', { name: 'Postal code' })
  const insurance = page.getByRole('textbox', { name: 'Social insurance number' })
  await language.selectOption('rm-CH')
  assert.equal((await state(insurance)).message, 'Empleni quest champ.')
  await edit(insurance, '7560')
  await edit(localizedPostal, '12')
  assert.match((await state(insurance)).message, /numer AVS valaivel/)
  assert.equal((await state(localizedPostal)).message, 'Endatai in numer postal da quatter cifras.')
  await language.selectOption('de-CH')
  assert.equal(await insurance.inputValue(), '7560')
  assert.match((await state(insurance)).message, /AHV-Nummer/)
  assert.match((await state(localizedPostal)).message, /Postleitzahl/)
  await edit(insurance, '756.1234.5678.90')
  for (const tag of ['de-CH', 'fr-CH', 'it-CH', 'rm-CH']) {
    await language.selectOption(tag)
    assert.equal((await state(insurance)).message, ahvSchema(tag)['~standard'].validate('756.1234.5678.90').issues[0].message)
  }
  await edit(insurance, '756.1234.5678.97')
  assert.ok((await state(insurance)).valid)
  await edit(localizedPostal, '7500')
  assert.deepEqual(await reported('postal'), { value: '7500', normalized: '7500', valid: true })
  assert.ok((await state(localizedPostal)).valid)
  assert.deepEqual(errors, [])
  console.log('Swiss identifier inputs passed formatting, validity, native form, controlled value, blur and reset checks.')
} finally {
  await browser.close()
}
