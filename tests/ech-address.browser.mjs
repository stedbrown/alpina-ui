import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const fixture = await build({ bundle: true, write: false, outfile: 'fixture.js', jsx: 'automatic',
  stdin: { loader: 'tsx', resolveDir: process.cwd(), contents: `
    import { createRoot } from 'react-dom/client'
    import { SwissAddressForm, toEchMailAddress } from 'alpina-ui'
    createRoot(document.getElementById('root')).render(<SwissAddressForm format="ech-person" locale="de-CH"
      initialValue={{recipient:'Graf', street:'Aarweg', locality:'Bern', postalCode:'0999', canton:'BE'}}
      onSave={address => { window.saved = toEchMailAddress(address, 'ech-person') }} />)
  ` } })
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage()
  await page.setContent('<!doctype html><div id="root"></div>')
  await page.addScriptTag({ content: fixture.outputFiles[0].text })
  const form = page.getByRole('form', { name: 'Postadresse' })
  const save = form.getByRole('button', { name: 'Adresse speichern' })
  const line = form.getByLabel('Adresszusatz 1 (optional)')
  await line.fill('é'.repeat(151))
  await save.click()
  assert.ok(await line.evaluate(el => el === document.activeElement))
  assert.equal(await line.getAttribute('aria-invalid'), 'true')
  await form.getByRole('link', { name: 'PLZ' }).click()
  const code = form.getByLabel('PLZ', { exact: true })
  assert.ok(await code.evaluate(el => el === document.activeElement))
  await code.fill('3001')
  const supplementary = '𐐀'.repeat(150)
  await line.fill(supplementary)
  await form.getByLabel('Vorname (optional)').fill('Ida')
  await form.getByLabel('Hausnummer (optional)').fill('8a')
  await save.click()
  await form.getByText('Adresse gespeichert.').waitFor()
  const saved = await page.evaluate(() => window.saved)
  assert.deepEqual(saved.person, { firstName: 'Ida', lastName: 'Graf' })
  assert.equal(saved.addressInformation.addressLine1, supplementary)
  assert.equal(saved.addressInformation.houseNumber, '8a')
  assert.equal(saved.addressInformation.swissZipCode, 3001)
  console.log('eCH address correction, supplementary lines and structured delivery submission passed.')
} finally { await browser.close() }
