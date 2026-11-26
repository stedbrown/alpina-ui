import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const root = fileURLToPath(new URL('../', import.meta.url))
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, outfile: 'calendar-caption.js', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  stdin: { loader: 'tsx', resolveDir: root, contents: `
    import { useState } from 'react'
    import { createRoot } from 'react-dom/client'
    import { Calendar } from './src/swiss/calendar.js'
    import './src/theme.css'
    function Fixture() {
      const [day, setDay] = useState('2026-01-31')
      return <main>
        <Calendar value={day} onValueChange={setDay} />
        <output id="day">{day}</output>
        <Calendar locale="de-CH" defaultMonth="2026-03" min="2026-02-10" max="2027-05-01" />
        <Calendar locale="fr-CH" captionLayout="label" defaultMonth="2026-09" />
      </main>
    }
    createRoot(document.getElementById('app')).render(<Fixture />)` },
})
const exe = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(exe ? { executablePath: exe } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 360, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setContent('<!doctype html><html lang="it"><head><title>Calendario</title></head><body><div id="app"></div></body></html>')
  await page.addStyleTag({ content: bundle.outputFiles.find(({ path }) => path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find(({ path }) => path.endsWith('.js')).text })
  const [italian, german, french] = await page.locator('.al-calendar').all()
  const year = italian.getByRole('combobox', { name: 'Anno' })
  const month = italian.getByRole('combobox', { name: 'Mese' })

  // The month name stays the accessible name of the grid while the menus show it visually.
  assert.equal(await italian.getByRole('grid').getAttribute('aria-labelledby'), await italian.locator('strong').getAttribute('id'))
  assert.equal(await italian.locator('strong').textContent(), 'gennaio 2026')
  assert.equal(await month.inputValue(), '1')
  const today = Number(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Zurich', year: 'numeric' }).format(new Date()))
  const years = (await year.locator('option').allTextContents()).map(Number)
  assert.equal(years[0], today + 20)
  assert.equal(years.at(-1), today - 100)

  // Jumping keeps the day of the month where it exists, without selecting it.
  await year.selectOption('1984')
  await month.selectOption({ label: 'febbraio' })
  assert.equal(await italian.locator('strong').textContent(), 'febbraio 1984')
  assert.equal(await italian.locator('[tabindex="0"]').getAttribute('data-day'), '1984-02-29')
  assert.equal(await page.locator('#day').textContent(), '2026-01-31')
  await italian.locator('[data-day="1984-02-14"]').click()
  assert.equal(await page.locator('#day').textContent(), '1984-02-14')
  // The previous-month button and the menus stay in step.
  await italian.getByRole('button', { name: 'Mese precedente' }).click()
  assert.equal(await month.inputValue(), '1')
  assert.equal(await year.inputValue(), '1984')

  // Bounds limit the years and disable unreachable months.
  const germanYear = german.getByRole('combobox', { name: 'Jahr' })
  assert.deepEqual(await germanYear.locator('option').allTextContents(), ['2027', '2026'])
  assert.deepEqual(await german.getByRole('combobox', { name: 'Monat' }).locator('option:disabled').allTextContents(), ['Januar'])
  await germanYear.selectOption('2027')
  assert.equal(await german.locator('strong').textContent(), 'März 2027')
  assert.deepEqual((await german.getByRole('combobox', { name: 'Monat' }).locator('option:disabled').allTextContents()).length, 7)

  // The label layout keeps the visible month heading.
  assert.equal(await french.getByRole('combobox').count(), 0)
  assert.ok(await french.locator('strong').isVisible())
  assert.deepEqual(errors, [])
  console.log('Calendar month and year menus passed jump, bounds, selection and label layout checks.')
} finally {
  await browser.close()
}
