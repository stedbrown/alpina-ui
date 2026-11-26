import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const root = fileURLToPath(new URL('../', import.meta.url))
const bundle = await build({
  absWorkingDir: root,
  bundle: true,
  write: false,
  outfile: 'locality-test.js',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  stdin: {
    loader: 'tsx',
    resolveDir: root,
    contents: `
      import { useState } from 'react'
      import { createRoot } from 'react-dom/client'
      import { SwissLocalityCombobox } from './src/swiss/swiss-locality-combobox.js'
      import './src/theme.css'
      const lugano = { postalCode: '6900', locality: 'Lugano', municipality: 'Lugano', bfsNumber: 5192, canton: 'TI' }
      function Fixture() {
        const [place, setPlace] = useState(null)
        const [disabled, setDisabled] = useState(false)
        return <main style={{width:'min(100%, 350px)'}}>
          <form aria-label="Domicilio" onSubmit={e => e.preventDefault()}>
            <SwissLocalityCombobox name="home" defaultValue={lugano} required description="Luogo di residenza" />
            <button type="reset">Reset</button>
          </form>
          <SwissLocalityCombobox label="Ort" locale="de-CH" canton="ZH" disabled={disabled} value={place} onLocalityChange={setPlace} />
          <output id="chosen">{place ? place.municipality + ' ' + place.bfsNumber : 'none'}</output>
          <button onClick={() => setDisabled(!disabled)}>Disabilita</button>
        </main>
      }
      createRoot(document.getElementById('app')).render(<Fixture />)
    `,
  },
})
const exe = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  exe ? { executablePath: exe } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 640 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.setContent(
    '<!doctype html><html lang="it"><head><title>Località</title></head><body><div id="app"></div></body></html>',
  )
  await page.addStyleTag({ content: bundle.outputFiles.find(({ path }) => path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find(({ path }) => path.endsWith('.js')).text })
  const form = page.getByRole('form')
  const combo = form.getByRole('combobox', { name: 'Località' })
  const submitted = () => form.evaluate((node) => Object.fromEntries(new FormData(node)))
  const lugano = { 'home.postalCode': '6900', 'home.locality': 'Lugano', 'home.municipality': 'Lugano', 'home.bfsNumber': '5192', 'home.canton': 'TI' }
  const options = () => page.getByRole('listbox').getByRole('option').allInnerTexts()

  // The committed value, the default placeholder and the submitted fields.
  assert.equal(await combo.inputValue(), '6900 Lugano')
  assert.equal(await combo.getAttribute('placeholder'), 'NPA o località')
  assert.deepEqual(await submitted(), lugano)
  assert.equal(await combo.getAttribute('aria-expanded'), 'false')

  // A locality in a larger municipality names that municipality, and the first suggestion is active.
  await combo.fill('vigan')
  await page.getByRole('option', { name: /Viganello/ }).waitFor()
  assert.deepEqual(await options(), ['6962 Viganello\nComune Lugano · TI'])
  assert.equal(await combo.getAttribute('aria-expanded'), 'true')
  const active = await combo.getAttribute('aria-activedescendant')
  assert.match(active, /-0$/)
  await combo.press('Enter')
  assert.equal(await combo.inputValue(), '6962 Viganello')
  assert.deepEqual(await submitted(), { ...lugano, 'home.postalCode': '6962', 'home.locality': 'Viganello' })

  // A shared postcode lists each locality and municipality. The keyboard moves the active suggestion.
  await combo.fill('6900')
  await page.getByRole('option', { name: /Massagno/ }).waitFor()
  assert.deepEqual(await options(), [
    '6900 Lugano\nComune Lugano · TI', '6900 Massagno\nComune Massagno · TI',
    '6900 Paradiso\nComune Paradiso · TI', '6900 Paradiso\nComune Lugano · TI'])
  const popup = await page.locator('.al-locality-popup').boundingBox()
  const anchor = await combo.boundingBox()
  assert.ok(popup && anchor && Math.abs(popup.width - anchor.width) < 2 && popup.y >= anchor.y + anchor.height - 1)
  await combo.press('ArrowUp')
  assert.match(await combo.getAttribute('aria-activedescendant'), /-3$/)
  await combo.press('ArrowDown')
  await combo.press('ArrowDown')
  assert.match(await combo.getAttribute('aria-activedescendant'), /-1$/)
  await combo.press('Enter')
  assert.equal((await submitted())['home.municipality'], 'Massagno')

  // Escape and Tab keep the committed locality. An empty search is announced.
  await combo.fill('zqxx')
  await page.getByRole('status').filter({ hasText: 'Nessuna località trovata.' }).waitFor()
  assert.equal(await combo.getAttribute('aria-activedescendant'), null)
  await combo.press('Escape')
  assert.equal(await combo.inputValue(), '6900 Massagno')
  await combo.fill('Zuerich')
  await page.getByRole('option').first().waitFor()
  await combo.press('Tab')
  assert.equal(await combo.inputValue(), '6900 Massagno')
  assert.equal(await page.getByRole('listbox').count(), 0)

  // A pointer choice, clearing, required validation and form reset.
  await combo.fill('geneve')
  await page.getByRole('option', { name: /^1201 Genève/ }).click()
  assert.equal((await submitted())['home.canton'], 'GE')
  assert.ok(await combo.evaluate((input) => input === document.activeElement))
  await form.getByRole('button', { name: 'Cancella la scelta' }).click()
  assert.equal((await submitted())['home.postalCode'], '')
  assert.equal(await combo.evaluate((input) => input.validationMessage), 'Scegli una località.')
  await form.getByRole('button', { name: 'Reset' }).click()
  await page.waitForFunction(() => document.querySelector('input[role=combobox]').value === '6900 Lugano')
  assert.deepEqual(await submitted(), lugano)

  // A controlled German field restricted to one canton.
  const controlled = page.getByRole('combobox', { name: 'Ort' })
  assert.equal(await controlled.getAttribute('placeholder'), 'PLZ oder Ort')
  await controlled.fill('winterth')
  await page.getByRole('option').first().waitFor()
  assert.ok((await options()).every((text) => text.endsWith('· ZH')))
  assert.match((await options())[0], /^8400 Winterthur\nGemeinde Winterthur · ZH$/)
  await controlled.press('Enter')
  assert.equal(await page.locator('#chosen').textContent(), 'Winterthur 230')
  await controlled.fill('lugano')
  await page.getByRole('status').filter({ hasText: 'Kein Ort gefunden.' }).waitFor()
  await controlled.press('Escape')
  assert.equal(await controlled.inputValue(), '8400 Winterthur')
  await page.getByRole('button', { name: 'Disabilita' }).click()
  assert.ok(await controlled.isDisabled())

  // A late answer for an older query never replaces the latest suggestions.
  await combo.fill('')
  await combo.pressSequentially('8001', { delay: 0 })
  await page.waitForFunction(() => document.querySelectorAll('[role=option]').length > 0 &&
    [...document.querySelectorAll('[role=option]')].every(option => option.textContent.startsWith('8001')))
  await combo.press('Escape')
  assert.deepEqual(errors, [])
  console.log('SwissLocalityCombobox passed postcode, name and municipality search, keyboard, pointer, canton, FormData and reset checks.')
} finally {
  await browser.close()
}
