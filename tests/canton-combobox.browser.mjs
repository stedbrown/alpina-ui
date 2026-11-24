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
  outfile: 'combobox-test.js',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  stdin: {
    loader: 'tsx',
    resolveDir: root,
    contents: `
      import { useState } from 'react'
      import { createRoot } from 'react-dom/client'
      import { CantonCombobox } from './src/swiss/canton-combobox.js'
      import { LocaleSelect } from './src/swiss/locale-select.js'
      import './src/theme.css'
      function Fixture() {
        const [locale, setLocale] = useState('it-CH')
        const [code, setCode] = useState('GR')
        const [disabled, setDisabled] = useState(false)
        return <main style={{width:'min(100%, 350px)'}}>
          <LocaleSelect aria-label="Lingua" value={locale} onLocaleChange={setLocale} />
          <form aria-label="Domicilio" onSubmit={e => e.preventDefault()}>
            <CantonCombobox locale={locale} name="home" defaultValue="TI" required description="Sede" />
            <button type="reset">Reset</button>
          </form>
          <CantonCombobox label="Controllato" locale={locale} disabled={disabled} value={code} onCantonChange={setCode}/>
          <output id="chosen">{code}</output>
          <button onClick={() => setCode('ZH')}>Zurigo</button>
          <button onClick={() => setDisabled(!disabled)}>Disabilita</button>
        </main>
      }
      createRoot(document.getElementById('app')).render(<Fixture />)
    `,
  },
})
const exe = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  exe
    ? { executablePath: exe }
    : existsSync(chromium.executablePath())
      ? {}
      : { channel: 'chrome' },
)
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 550 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.setContent(
    '<!doctype html><html lang="it"><head><title>Cantoni</title></head><body><div id="app"></div></body></html>',
  )
  await page.addStyleTag({
    content: bundle.outputFiles.find(({ path }) => path.endsWith('.css')).text,
  })
  await page.addScriptTag({
    content: bundle.outputFiles.find(({ path }) => path.endsWith('.js')).text,
  })
  const form = page.getByRole('form')
  const combo = form.getByRole('combobox')
  const controlled = page.getByRole('combobox', { name: 'Controllato' })
  const submitted = () => form.evaluate((node) => new FormData(node).get('home'))
  assert.equal(await combo.inputValue(), 'Ticino (TI)')
  await combo.click()
  assert.equal(await page.getByRole('listbox').getByRole('option').count(), 26)
  const size = await page.locator('.al-canton-popup').boundingBox()
  const option = page.getByRole('listbox').getByRole('option').first()
  assert.deepEqual(
    await option.evaluate((el) => {
      const row = getComputedStyle(el)
      const code = getComputedStyle(el.querySelector('.al-canton-code'))
      return [row.fontSize, row.lineHeight, code.fontSize, code.lineHeight]
    }),
    ['16px', '24px', '12px', '16px'],
  )
  const anchor = await combo.boundingBox()
  assert.ok(size && anchor && size.height <= 289 && Math.abs(size.width - anchor.width) < 2)
  await combo.press('Escape')
  for (const [text, result] of [
    ['GR', 'Grigioni'],
    ['graubunden', 'Grigioni'],
    ['Grisons', 'Grigioni'],
    ['Grischun', 'Grigioni'],
    ['geneve', 'Ginevra'],
    ['Basel Stadt', 'Basilea Città'],
  ]) {
    await combo.fill(text)
    const active = await combo.getAttribute('aria-activedescendant')
    assert.ok(
      await page.evaluate(
        ({ id, name }) => document.getElementById(id)?.textContent.includes(name),
        { id: active, name: result },
      ),
    )
    await combo.press('Escape')
    assert.equal(await combo.inputValue(), 'Ticino (TI)')
  }
  await combo.fill('zqxx')
  await page.getByRole('status').filter({ hasText: 'Nessun cantone trovato.' }).waitFor()
  assert.equal(await combo.getAttribute('aria-activedescendant'), null)
  await combo.press('Tab')
  assert.equal(await combo.inputValue(), 'Ticino (TI)')
  assert.equal(await page.getByRole('listbox').count(), 0)
  await combo.fill('Geneve')
  await combo.press('Enter')
  assert.equal(await submitted(), 'GE')
  await page.getByLabel('Lingua').selectOption('rm-CH')
  assert.equal(await combo.inputValue(), 'Genevra (GE)')
  await combo.fill('Basel')
  await page.getByRole('option', { name: /Basilea-Champagna/ }).click()
  assert.equal(await submitted(), 'BL')
  await combo.focus()
  await combo.press('ArrowUp')
  let activeId = await combo.getAttribute('aria-activedescendant')
  assert.ok(activeId.endsWith('-JU'))
  assert.ok(await page.getByRole('listbox').evaluate((el) => el.scrollTop > 0))
  assert.ok(await combo.evaluate((input) => input === document.activeElement))
  await combo.press('ArrowDown')
  activeId = await combo.getAttribute('aria-activedescendant')
  assert.ok(activeId.endsWith('-ZH'))
  await combo.press('Escape')
  await form.getByRole('button', { name: 'Stizzar la selecziun' }).click()
  assert.equal(await submitted(), '')
  await combo.fill('GE')
  assert.equal(await combo.evaluate((input) => input.checkValidity()), false)
  await combo.press('Escape')
  await form.getByRole('button', { name: 'Reset' }).click()
  assert.equal(await submitted(), 'TI')
  assert.equal(await combo.inputValue(), 'Tessin (TI)')
  await controlled.fill('Parigi')
  await page.getByRole('combobox', { name: 'Lingua' }).focus()
  assert.equal(await controlled.inputValue(), 'Grischun (GR)')
  await page.getByRole('button', { name: 'Zurigo' }).click()
  assert.equal(await controlled.inputValue(), 'Turitg (ZH)')
  await controlled.fill('Ticino')
  await controlled.press('Enter')
  assert.equal(await page.locator('#chosen').textContent(), 'TI')
  await page.getByRole('button', { name: 'Disabilita' }).click()
  assert.ok(await controlled.isDisabled())
  assert.deepEqual(errors, [])
  console.log(
    'CantonCombobox passed search in four languages, keyboard input, focus, controlled values and FormData checks.',
  )
} finally {
  await browser.close()
}
