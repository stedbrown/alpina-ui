import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const root = fileURLToPath(new URL('../', import.meta.url))
const bundle = await build({
  absWorkingDir: root,
  entryPoints: ['tests/elements-v3-fixture.tsx'],
  outfile: 'elements.js',
  bundle: true,
  write: false,
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
})
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const options = executable
  ? { executablePath: executable }
  : existsSync(chromium.executablePath())
    ? {}
    : { channel: 'chrome' }
const browser = await chromium.launch({ headless: true, ...options })
try {
  const page = await browser.newPage({ viewport: { width: 1152, height: 820 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.setContent('<html lang="it"><body><div id="app"></div></body></html>')
  await page.addStyleTag({ content: bundle.outputFiles.find((f) => f.path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find((f) => f.path.endsWith('.js')).text })
  const chart = page.getByRole('figure', { name: 'Inventario' })
  const summary = chart.getByText('Tabella dei dati')
  await summary.focus()
  await page.keyboard.press('Enter')
  assert.equal(await chart.getByRole('row').count(), 4)
  assert.equal(await chart.getByRole('cell', { name: '-10', exact: true }).count(), 1)
  assert.equal(await chart.getByText('Assente').count(), 0)
  const bars = await chart
    .locator('.al-chart-track i')
    .evaluateAll((elements) => elements.map((el) => el.getBoundingClientRect().width))
  assert.ok(bars[0] > 0 && Math.abs(bars[1] / bars[0] - 2) < 0.02 && bars[2] === 0)
  assert.equal(await page.getByText('Nessun dato').count(), 1)
  const cost = page.getByRole('textbox', { name: 'Costo' })
  assert.equal(await cost.getAttribute('aria-describedby'), 'costo-error')
  assert.equal(await cost.getAttribute('inputmode'), 'decimal')
  const all = page.getByRole('checkbox', { name: 'Tutti' })
  assert.equal(await all.evaluate((el) => el.indeterminate), true)
  await all.focus()
  await page.keyboard.press('Space')
  assert.equal(await all.evaluate((el) => el.indeterminate), false)
  const partial = page.getByRole('checkbox', { name: 'Selezione parziale' })
  await partial.click()
  assert.equal(await partial.evaluate((el) => el.indeterminate), true)
  const setting = page.getByRole('switch', { name: 'Prestito' })
  assert.equal(await page.getByText('Sospeso', { exact: true }).isVisible(), true)
  await setting.click()
  assert.equal(await page.getByText('Attivo', { exact: true }).isVisible(), true)
  assert.equal(
    await page
      .getByRole('columnheader', { name: 'Totale' })
      .evaluate((el) => getComputedStyle(el).textAlign),
    'end',
  )
  const toggle = page.getByRole('button', { name: 'Guida' })
  await toggle.focus()
  await page.keyboard.press('Space')
  assert.equal(await toggle.getAttribute('aria-pressed'), 'true')
  assert.equal(await page.locator('#events').innerText(), '1')
  const locked = page.getByRole('button', { name: 'Controllato' })
  await locked.click()
  assert.equal(await locked.getAttribute('aria-pressed'), 'false')
  await page.getByText('Condizioni', { exact: true }).focus()
  await page.keyboard.press('Enter')
  assert.equal(await page.getByText('Restituzione in sede').isVisible(), true)
  const slider = page.getByRole('slider', { name: 'Corpo' })
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  assert.equal(await slider.inputValue(), '18')
  assert.equal(await page.getByRole('img', { name: 'Ada Keller' }).innerText(), 'AK')
  const scroll = page.getByRole('region', { name: 'Indice' })
  await scroll.focus()
  await page.keyboard.press('End')
  await page.waitForFunction(() => document.querySelector('.al-scroll-area').scrollTop > 0)
  assert.equal(
    await page.locator('.al-grid-item').evaluate((el) => getComputedStyle(el).gridColumnStart),
    '9',
  )
  const contrastResults = []
  for (const theme of ['light', 'dark']) {
    const ratios = await page.evaluate((theme) => {
      document.querySelector('main').dataset.alTheme = theme
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      function rgb(cssColor) {
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillStyle = cssColor
        ctx.fillRect(0, 0, 1, 1)
        return [...ctx.getImageData(0, 0, 1, 1).data]
      }
      function luminance(color) {
        const linear = color
          .slice(0, 3)
          .map((v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
      }
      function background(node) {
        for (let el = node; el; el = el.parentElement) {
          const color = rgb(getComputedStyle(el).backgroundColor)
          if (color[3] === 255) return color
        }
        throw Error('Opaque test backdrop missing')
      }
      const ratios = []
      for (const el of document.querySelectorAll(
        '.al-badge,.al-alert,.al-button,.al-toggle,.al-field-hint,.al-field-label,.al-field-error,.al-chart-value,.al-input,.al-marker',
      )) {
        const fg = luminance(rgb(getComputedStyle(el).color))
        const bg = luminance(background(el))
        ratios.push([
          el.className + ' ' + (el.dataset.tone || el.dataset.variant || ''),
          (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05),
        ])
      }
      for (const el of document.querySelectorAll(
        '.al-input,.al-toggle,.al-marker-symbol,.al-alert-sign',
      )) {
        const fg = luminance(
          rgb(
            el.matches('.al-input,.al-toggle')
              ? getComputedStyle(el).borderColor
              : getComputedStyle(el).color,
          ),
        )
        const bg = luminance(background(el.parentElement))
        ratios.push(['graphic ' + el.className, (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)])
      }
      return ratios
    }, theme)
    for (const [label, ratio] of ratios)
      assert.ok(
        ratio >= (label.startsWith('graphic ') ? 3 : 4.5),
        theme + ' ' + label + ' contrast ' + ratio,
      )
    contrastResults.push(theme + ' ' + Math.min(...ratios.map((entry) => entry[1])).toFixed(2))
  }
  console.log('Contrasto minimo osservato nei campioni: ' + contrastResults.join(', '))
  await page.emulateMedia({ forcedColors: 'active' })
  await toggle.focus()
  assert.equal(await toggle.evaluate((el) => getComputedStyle(el).borderBottomWidth), '3px')
  await page.emulateMedia({ forcedColors: 'none' })
  await page.setViewportSize({ width: 320, height: 640 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  assert.equal(
    await page.locator('.al-grid-item').evaluate((el) => getComputedStyle(el).gridColumnStart),
    'auto',
  )
  assert.deepEqual(errors, [])
  console.log('Componenti 0.3 verificati con tastiera, dati con segno, campi nativi e colori forzati.')
} finally {
  await browser.close()
}
