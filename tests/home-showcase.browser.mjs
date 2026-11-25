import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
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

// Visitors can reach native controls before the deferred React chunk arrives.
async function verifyEarlyEdits() {
  const html = await readFile(new URL('index.html', site), 'utf8')
  const entry = html.match(/src="(\/assets\/showcase-[^"]+)"/)[1]
  const script = await readFile(new URL('.' + entry, site), 'utf8')
  const deferred = script.match(/import\("\.\/(sample-[^"]+)"/)[1]
  const page = await browser.newPage()
  let release
  const gate = new Promise(resolve => { release = resolve })
  await page.route(origin + '/**', async route => {
    const { pathname } = new URL(route.request().url())
    if (pathname.endsWith('/' + deferred)) await gate
    return route.fulfill({ path: fileURLToPath(new URL(pathname === '/' ? 'index.html' : pathname.slice(1), site)) })
  })
  try {
    await page.goto(origin)
    await page.getByRole('slider', { name: 'Type size' }).press('End')
    await page.getByRole('slider', { name: 'Preview zoom' }).press('End')
    await page.getByRole('switch', { name: 'Simulate forced colors' }).press('Space')
    await page.getByRole('switch', { name: 'Add a second ink' }).press('Space')
    await page.getByRole('slider', { name: 'Edition size' }).press('End')
    await page.getByRole('button', { name: 'Add to queue' }).click()
    release()
    await page.waitForFunction(() => getComputedStyle(document.getElementById('type-proof')).fontSize === '192px')
    await page.waitForFunction(() => document.querySelector('#access-proof .al-grid-proof').dataset.palette === 'system')
    assert.equal(await page.locator('output[for="proof-zoom"]').textContent(), '400%')
    const sheet = page.getByRole('button', { name: 'Poster edition 04' })
    await sheet.click()
    const ticket = page.getByRole('dialog', { name: 'Poster edition 04' })
    assert.match(await ticket.innerText(), /250 copies/)
    assert.match(await ticket.innerText(), /Black and red/)
    assert.match(await ticket.innerText(), /CHF\s*424\.00/)
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
  await verifyEarlyEdits()
  for (const viewport of [{ width: 390, height: 844 }, { width: 1350, height: 940 }]) await verifyInitialGeometry(viewport)
  const page = await homepage(true)
  const cover = page.locator('main [data-entrance="sequence"]')
  assert.equal(await cover.count(), 1)
  const animation = () => cover.locator('.al-grid-item').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).animationName))
  await page.emulateMedia({reducedMotion:'no-preference'})
  assert.ok((await animation()).every(name => name === 'al-grid-entry'))
  await page.emulateMedia({reducedMotion:'reduce'})
  assert.ok((await animation()).every(name => name === 'none'))
  const grid = page.getByRole('switch', {name:'Show grid'})
  assert.ok(await page.locator('#programme-guides').isVisible())
  await grid.press('Space')
  assert.ok(await page.locator('#programme-guides').isHidden())
  const size = page.getByRole('slider', { name: 'Type size' })
  const spacing = page.getByRole('slider', { name: 'Letter spacing' })
  const type = page.locator('#type-proof')
  await size.scrollIntoViewIfNeeded()
  assert.equal(await type.evaluate(node => getComputedStyle(node).fontSize), '144px')
  await size.press('End')
  await page.waitForFunction(() => getComputedStyle(document.getElementById('type-proof')).fontSize === '192px')
  await spacing.press('End')
  await page.waitForFunction(() => document.querySelector('output[for="proof-spacing"]').textContent === '0.080 em')
  assert.equal(await type.evaluate(node => parseFloat(getComputedStyle(node).letterSpacing)), 15.36)
  assert.equal(await page.locator('output[for="proof-scale"]').textContent(), '192 px')
  await page.setViewportSize({ width: 320, height: 900 })
  assert.ok(await type.evaluate(node => node.scrollWidth <= node.clientWidth + 1), 'Extreme type settings fit the mobile sheet')
  await page.setViewportSize({ width: 1280, height: 900 })
  const sheets = page.locator('#appearance-proof [data-appearance-sheet]')
  const colors = () => sheets.evaluateAll(nodes => nodes.map(node => {
    const style = getComputedStyle(node)
    return [style.backgroundColor, style.color]
  }))
  const paper = ['rgb(255, 255, 255)', 'rgb(0, 0, 0)']
  const inkColors = [...paper].reverse()
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme })
    assert.deepEqual(await colors(), [paper, inkColors])
    const swap = page.getByRole('switch', {name:'Swap proofs'})
    await swap.press('Space')
    assert.deepEqual(await colors(), [inkColors, paper])
    assert.deepEqual(await sheets.locator('[data-proof-name]').allTextContents(), ['Ink', 'Paper'])
    await swap.press('Space')
  }
  const access = page.locator('#access-proof')
  const zoom = access.getByRole('slider', { name: 'Preview zoom' })
  const contrast = access.getByRole('switch', { name: 'Simulate forced colors' })
  const name = access.getByRole('textbox', { name: 'Name' })
  const hold = access.getByRole('button', { name: 'Hold' })
  await zoom.scrollIntoViewIfNeeded()
  await zoom.press('Tab')
  assert.ok(await contrast.evaluate(node => node === document.activeElement))
  await page.keyboard.press('Tab')
  assert.ok(await name.evaluate(node => node.matches(':focus-visible') && parseFloat(getComputedStyle(node).outlineWidth) >= 2))
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  assert.ok(await name.evaluate(node => node === document.activeElement))
  assert.equal(await name.getAttribute('aria-invalid'), 'true')
  await name.fill('Anne')
  await name.press('Enter')
  await access.getByRole('status').filter({ hasText: 'Held' }).waitFor()
  const accent = await hold.evaluate(node => getComputedStyle(node).backgroundColor)
  await contrast.press('Space')
  assert.notEqual(await hold.evaluate(node => getComputedStyle(node).backgroundColor), accent)
  assert.ok(await access.getByRole('status').filter({ hasText: 'Held' }).isVisible())
  await page.setViewportSize({ width: 768, height: 900 })
  const initialHeight = (await name.boundingBox()).height
  assert.ok(Math.abs((await hold.boundingBox()).y + (await hold.boundingBox()).height - (await name.boundingBox()).y - initialHeight) <= 1)
  await zoom.press('End')
  await page.waitForFunction(() => document.querySelector('#proof-zoom').getAttribute('aria-valuetext') === '400%')
  assert.equal((await name.boundingBox()).height, 4 * initialHeight)
  assert.ok((await hold.boundingBox()).y >= (await name.boundingBox()).y + 4 * initialHeight, 'The same form reflows vertically at 400%')
  await page.setViewportSize({ width: 320, height: 900 })
  const proof = access.getByRole('region', { name: 'Reading desk reservation' })
  assert.ok(await proof.evaluate(node => node.scrollWidth <= node.clientWidth + 1), 'The 400% proof also fits a phone')
  await zoom.press('Home')
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', {name:'Studio programme', exact: true}).click()
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
  assert.match(await estimate.locator('[data-estimate-total]').innerText(), /CHF\s*174\.00/)
  await ink.press('Space')
  assert.ok(await ink.isChecked())
  assert.match(await estimate.locator('[data-estimate-total]').innerText(), /CHF\s*224\.00/)

  await estimate.getByRole('button', { name: 'Add to queue' }).press('Enter')
  const notice = page.getByRole('status').filter({ hasText: 'Poster edition 04 added to the queue.' })
  await notice.waitFor()
  await page.getByRole('button', { name: 'Dismiss print notification' }).press('Enter')
  await notice.waitFor({ state: 'hidden' })
  const created = queue.getByRole('row').filter({ hasText: 'Poster edition 04' })
  assert.match(await created.innerText(), /125/)
  await created.getByRole('button', { name: 'Poster edition 04' }).click()
  const sheet = page.getByRole('dialog', { name: 'Poster edition 04' })
  assert.match(await sheet.innerText(), /Black and red/)
  assert.match(await sheet.innerText(), /CHF\s*224\.00/)
  await sheet.getByRole('button', { name: 'Close job sheet' }).press('Enter')
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

  for (const width of [320, 768, 1440, 2560]) {
    await page.setViewportSize({width, height:900})
    if (width >= 1440) {
      const quote = await estimate.boundingBox()
      const chart = await log.boundingBox()
      assert.equal(quote.y, chart.y, 'Print estimate and press log share a desktop row')
      assert.ok(chart.x >= quote.x + quote.width, 'The press log starts in the next grid field')
    }
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({colorScheme, reducedMotion:'reduce'})
      const layout = await page.evaluate(() => {
        const title = document.querySelector('h1')
        const section = title.closest('section')
        const aligned = [...section.querySelectorAll('h1, p, a')].every(el => {
          const rect = el.getBoundingClientRect()
          return rect.left >= 0 && rect.right <= innerWidth + 1
        })
        const lines = [...title.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => {
          const range = new Range(); range.selectNodeContents(n)
          return [...range.getClientRects()].filter(r => r.width).length
        })
        const intro = section.querySelector('#cover-intro').firstChild
        const broken = [...intro.textContent.matchAll(/[A-Za-z]+/g)].filter(match => {
          const range = new Range()
          range.setStart(intro, match.index)
          range.setEnd(intro, match.index + match[0].length)
          return new Set([...range.getClientRects()].map(rect => rect.top)).size > 1
        }).map(match => match[0])
        return { aligned, lines, broken, width: document.documentElement.scrollWidth, field: getComputedStyle(section).backgroundColor }
      })
      assert.equal(layout.width, width, colorScheme + ' at ' + width)
      assert.ok(layout.aligned)
      assert.deepEqual(layout.broken, [], 'The hero introduction keeps words whole at ' + width)
      assert.deepEqual(layout.lines, [1,1], 'Both cover lines fit at ' + width)
      assert.equal(layout.field, 'rgb(235, 0, 0)', 'Brand field in ' + colorScheme)
    }
  }
  const staticPage = await homepage(false)
  const staticQueue = staticPage.getByRole('table', {name:'Print queue'})
  assert.equal(await staticQueue.getByRole('button').count(), 0)
  await staticPage.getByText('Studio programme', {exact:true}).filter({ visible: true }).press('Enter')
  assert.ok(await staticPage.getByText('150 copies', {exact:true}).filter({visible:true}).isVisible())
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
