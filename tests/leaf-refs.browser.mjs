import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const bundle = await build({
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  entryPoints: ['tests/leaf-refs-fixture.tsx'], bundle: true, write: false,
  jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
})
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executablePath ? { executablePath } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)
try {
  const page = await browser.newPage()
  await page.setContent('<main id="app"></main>')
  await page.addScriptTag({ content: bundle.outputFiles[0].text })
  await page.getByRole('table', { name: 'Payments' }).waitFor()
  const actual = await page.evaluate(() => Object.fromEntries(
    Object.entries(window.leafReferences).map(([name, { current }]) => [
      name, current?.classList.contains('consumer') && current.tagName.toLowerCase(),
    ]),
  ))
  assert.deepEqual(actual, {
    grid: 'main', column: 'div', card: 'article', header: 'div', title: 'h3',
    field: 'div', input: 'input', label: 'label', prose: 'article', keyboard: 'kbd', type: 'span',
    table: 'table', body: 'tbody', row: 'tr', cell: 'td', amount: 'data', date: 'time', records: 'div',
  })
  assert.ok(await page.getByRole('heading', { name: 'Invoice' }).evaluate(el => el.classList.contains('al-card-title')))
  await page.evaluate(() => window.leafReferences.input.current.focus())
  assert.ok(await page.getByRole('textbox', { name: 'Reference' }).evaluate(el => el === document.activeElement))
  await page.evaluate(() => window.unmountLeaves())
  assert.ok(await page.evaluate(() => Object.values(window.leafReferences).every(ref => ref.current === null)))
  console.log('Native and polymorphic leaves preserve their DOM refs and consumer classes through unmount.')
} finally {
  await browser.close()
}
