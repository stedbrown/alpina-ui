import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const site = new URL('../site/', import.meta.url)
const origin = 'https://alpina.test'
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executable ? { executablePath: executable } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)

async function homepage(javaScriptEnabled, viewport, beforeModule) {
  const page = await browser.newPage({ javaScriptEnabled, viewport })
  await page.route(origin + '/**', async route => {
    const { pathname } = new URL(route.request().url())
    if (beforeModule && /^\/assets\/showcase-[\w-]+\.js$/.test(pathname)) await beforeModule()
    const file = pathname === '/' ? 'index.html' : pathname.slice(1)
    return route.fulfill({ path: fileURLToPath(new URL(file, site)) })
  })
  await page.goto(origin, { waitUntil: beforeModule ? 'commit' : 'load' })
  return page
}

// Delay the actual external module until the browser has laid out the complete page.
async function verifyInitialGeometry(viewport) {
  let release
  let requested
  const gate = new Promise(resolve => { release = resolve })
  const entered = new Promise(resolve => { requested = resolve })
  const page = await homepage(true, viewport, async () => { requested(); await gate })
  function measure() {
    const selectors = [
      '#type-specimen', '#type-specimen [role="tablist"]', '#type-specimen [role="tabpanel"]:not([hidden]) time',
      '#poster-estimate', '#poster-copies', '#poster-estimate [data-estimate-total]',
      '#press-log', '#press-week', '#press-log [data-print-weeks]', '#press-log [data-print-weeks] figure:not([hidden])',
      '#press-log .al-card-footer',
    ]
    return selectors.map(selector => {
      const box = document.querySelector(selector)?.getBoundingClientRect()
      if (!box?.width || !box?.height) throw Error('Missing initial showcase element: ' + selector)
      return [selector, box.x, box.y, box.width, box.height]
    })
  }
  try {
    await entered
    await page.locator('#press-log .al-card-footer').waitFor()
    await page.waitForFunction(() => document.querySelector('link[rel="stylesheet"][href*="/fonts-"]').sheet)
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const first = await page.evaluate(measure)
    release()
    await page.waitForLoadState('load')
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    assert.deepEqual(await page.evaluate(measure), first, 'Loading showcase handlers moved the layout at ' + viewport.width + ' px')
  } finally {
    release()
    await page.close()
  }
}

async function checkSecondWeek(chart) {
  await chart.getByText('View hours as a table', { exact: true }).press('Enter')
  const table = chart.getByRole('table', { name: 'Hours on press' })
  assert.deepEqual(await table.getByRole('cell').allTextContents(), ['6', '5', '8', '7', '4'])
}

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1350, height: 940 }]) await verifyInitialGeometry(viewport)
  const page = await homepage(true)
  const grid = page.getByRole('switch', {name:'Show grid'})
  assert.ok(await page.locator('#programme-guides').isVisible())
  await grid.press('Space')
  assert.ok(await page.locator('#programme-guides').isHidden())
  await page.getByLabel('Type scale').selectOption('display')
  const type = page.locator('#type-proof')
  const beforeSpacing = await type.evaluate(el => getComputedStyle(el).letterSpacing)
  await page.getByLabel('Letter spacing').selectOption('normal')
  assert.notEqual(await type.evaluate(el => getComputedStyle(el).letterSpacing), beforeSpacing)
  assert.equal(await type.getAttribute('data-role'), 'display')
  const appearance = page.locator('#appearance-proof')
  const initialInk = await appearance.evaluate(el => getComputedStyle(el).color)
  await page.getByRole('switch', {name:'Dark preview'}).press('Space')
  assert.notEqual(await appearance.evaluate(el => getComputedStyle(el).color), initialInk)
  const proofs = page.getByRole('tablist', {name:'Accessibility proofs'})
  await proofs.getByRole('tab', {name:'Keyboard'}).press('ArrowRight')
  assert.equal(await proofs.getByRole('tab', {name:'Zoom'}).getAttribute('aria-selected'), 'true')
  await page.getByRole('button', {name:'View job sheet'}).click()
  await page.getByRole('dialog', {name:'Studio programme'}).waitFor()
  await page.keyboard.press('Escape')
  const queue = page.getByRole('table', {name:'Print queue'})
  await queue.getByRole('button', {name:'Copies'}).click()
  await page.waitForFunction(() => document.querySelector('[data-landing-island="queue"] th[aria-sort]'))
  assert.match(await queue.locator('tbody tr').first().innerText(), /Exhibition label/)
  const install = page.locator('[data-landing-island="install"]')
  assert.match(await install.locator('code').textContent(), /npm install https:\/\/.+\.tgz$/)
  await install.getByRole('button', {name:'Copy'}).click()
  await install.getByRole('status').filter({hasText:/Copied|Text selected/}).waitFor()
  const estimate = page.getByRole('region', { name: 'Poster estimate' })
  const slider = estimate.getByRole('slider', { name: 'Edition size' })
  const ink = estimate.getByRole('switch', { name: 'Add a second ink' })
  await slider.press('ArrowRight')
  assert.equal(await slider.getAttribute('aria-valuetext'), '125 copies')
  assert.match(await estimate.getByRole('status').innerText(), /CHF\s*174\.00/)
  await ink.press('Space')
  assert.ok(await ink.isChecked())
  assert.match(await estimate.getByRole('status').innerText(), /CHF\s*224\.00/)

  const log = page.getByRole('region', { name: 'Press log' })
  await log.getByRole('combobox', { name: 'Reporting week' }).press('Space')
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await checkSecondWeek(log.getByRole('figure', { name: 'Hours on press' }))
  const invoice = page.getByRole('region', { name: 'Invoice AP-104' })
  await invoice.getByRole('tab', { name: 'German' }).press('ArrowRight')
  assert.ok(await invoice.getByRole('tabpanel').getByText('Montant total').isVisible())

  await page.evaluate(() => document.fonts.ready)
  for (const width of [320, 360, 640, 768, 800, 960, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const name of ['German', 'French', 'Italian', 'Romansh']) {
      await invoice.getByRole('tab', { name }).click()
      const problems = await invoice.getByRole('tabpanel').locator('bdi').evaluateAll(values => values.filter(value => {
        const range = document.createRange()
        range.selectNodeContents(value)
        const runs = [...range.getClientRects()].filter(r => r.width)
        const parent = value.closest('[data-numeric]').getBoundingClientRect()
        return runs.some(r => r.top !== runs[0].top || r.left < parent.left - 1 || r.right > parent.right + 1)
      }).map(value => value.textContent))
      assert.deepEqual(problems, [], name + ' invoice at ' + width + ' px')
    }
  }

  const staticPage = await homepage(false)
  const staticEstimate = staticPage.getByRole('region', { name: 'Poster estimate' })
  assert.ok(await staticEstimate.getByText('100 copies · Black ink').isVisible())
  assert.match(await staticEstimate.getByRole('status').innerText(), /CHF\s*144\.00/)
  assert.equal(await staticEstimate.getByRole('slider').count(), 0)

  const staticLog = staticPage.getByRole('region', { name: 'Press log' })
  await staticLog.locator('[data-showcase-fallback]').getByText('22–26 March 2027', { exact: true }).press('Enter')
  await checkSecondWeek(staticLog.getByRole('figure', { name: 'Hours on press' }))
  const staticInvoice = staticPage.getByRole('region', { name: 'Invoice AP-104' })
  await staticInvoice.locator('[data-showcase-fallback]').getByText('Italian', { exact: true }).press('Enter')
  assert.ok(await staticInvoice.locator('[data-showcase-fallback]').getByText('Totale fattura').isVisible())
  console.log('Homepage showcase geometry stayed fixed before and after the module loaded. Keyboard and no-script examples passed.')
} finally {
  await browser.close()
}
