import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const bundle = await build({
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  entryPoints: ['tests/primitive-usability-fixture.tsx'],
  outfile: 'fixture.js', bundle: true, write: false, jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
})
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executablePath ? { executablePath } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 900 }, hasTouch: true })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.setContent('<!doctype html><html lang="en"><body data-al-page><div id="app"></div></body></html>')
  await page.addStyleTag({ content: bundle.outputFiles.find((file) => file.path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find((file) => file.path.endsWith('.js')).text })

  const grid = page.locator('.al-grid').first()
  const box = await grid.boundingBox()
  assert.equal(box.width, 1600)
  assert.equal(box.x, 160)
  assert.equal(await grid.evaluate((el) => getComputedStyle(el).alignItems), 'center')
  const frame = page.locator('.al-stack[data-surface="ink"]')
  assert.equal(await frame.evaluate((el) => getComputedStyle(el).paddingTop), '16px')
  assert.equal(await frame.evaluate((el) => getComputedStyle(el).colorScheme), 'dark')
  const reference = page.getByRole('textbox', { name: 'Reference' })
  assert.equal(await reference.getAttribute('aria-describedby'), 'reference-error reference-hint terms')
  assert.equal(await reference.evaluate((el) => getComputedStyle(el).borderRightWidth), '3px')
  assert.ok(await reference.evaluate((el) => document.getElementById('reference-error').nextElementSibling === el))
  const french = page.getByRole('radio', { name: 'French' })
  await french.check()
  assert.equal(await page.evaluate(() => new FormData(document.querySelector('#reservation')).get('language')), 'fr')
  const mixed = page.getByRole('checkbox', { name: 'Partial' })
  assert.ok(await mixed.evaluate((el) => el.indeterminate))
  await mixed.press('Space')
  assert.equal(await mixed.evaluate((el) => el.indeterminate), false)
  const notes = page.getByRole('textbox', { name: 'Notes' })
  const initialHeight = (await notes.boundingBox()).height
  assert.ok(initialHeight >= 160)
  await notes.fill(Array(10).fill('A line of type').join('\n'))
  assert.ok((await notes.boundingBox()).height > initialHeight)
  assert.ok(await page.getByRole('heading', { level: 2, name: 'Revision' }).isVisible())
  assert.ok(await page.getByRole('heading', { level: 3, name: 'No results' }).isVisible())
  assert.equal(await page.getByAltText('Proof', { exact: true }).evaluate((el) => getComputedStyle(el).objectFit), 'contain')
  assert.equal((await page.getByRole('img', { name: 'A\u0308nne Keller' }).textContent()).normalize(), 'ÄK')
  assert.equal(await page.getByRole('link', { name: 'Seite 2' }).getAttribute('aria-current'), 'page')
  assert.ok(await page.getByRole('button', { name: 'Saving' }).isDisabled())
  const amounts = page.getByRole('region', { name: 'Amounts' })
  assert.equal(await amounts.evaluate((el) => document.getElementById(el.getAttribute('aria-describedby')).textContent),
    'Use the buttons in the column headings to sort the rows.')
  await amounts.getByRole('button', { name: 'Amount due' }).press('Enter')
  assert.deepEqual(await amounts.getByRole('cell').allTextContents(), ['1', '3'])
  assert.equal(await page.getByRole('progressbar', { name: 'Printing' }).evaluate((el) => el.value), 100)
  assert.equal(await page.getByText('שלום').evaluate((el) => getComputedStyle(el).direction), 'rtl')
  assert.ok(await page.getByRole('status').getByText('Loading a proof').isVisible())
  assert.equal(await page.locator('.al-skeleton').evaluate((el) => getComputedStyle(el).animationIterationCount), '2')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(await page.locator('.al-spinner').evaluate((el) => getComputedStyle(el, '::before').animationName), 'none')
  assert.equal(await page.locator('.al-skeleton').evaluate((el) => getComputedStyle(el).animationName), 'none')

  for (const width of [768, 576, 390, 320]) {
    await page.setViewportSize({ width, height: 700 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow at ' + width)
  }
  const lineItems = page.getByRole('table', { name: 'Line items' })
  assert.equal(await lineItems.locator('p').evaluate((el) => getComputedStyle(el).textAlign), 'start')
  assert.equal(await lineItems.locator('data').evaluate((el) => {
    const range = document.createRange()
    range.selectNodeContents(el.querySelector('bdi') ?? el)
    return range.getClientRects().length
  }), 1)
  const toggleIndex = page.getByRole('button', { name: 'Browse components' })
  await toggleIndex.press('Enter')
  const link = page.getByRole('navigation', { name: 'Sections' }).getByRole('link')
  assert.ok((await link.boundingBox()).height >= 44)
  await reference.focus()
  await reference.press('Escape')
  assert.ok(await link.isVisible())
  await link.press('Escape')
  assert.ok(await toggleIndex.evaluate((el) => document.activeElement === el))
  assert.equal(await toggleIndex.getAttribute('aria-expanded'), 'false')

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Clipboard unavailable')) } })
    document.execCommand = () => false
  })
  await page.getByRole('button', { name: 'Copy', exact: true }).press('Enter')
  const snippet = page.getByRole('region', { name: 'Install' })
  await page.waitForFunction(() => document.activeElement?.tagName === 'PRE')
  assert.ok(await snippet.evaluate((el) => document.activeElement === el))
  assert.equal(await page.evaluate(() => window.getSelection().toString()), 'npm install sample')
  assert.deepEqual(errors, [])
  console.log('Primitive UX passed for form recovery, detached submission, layout, targets, sorting, motion and clipboard fallback.')
} finally {
  await browser.close()
}
