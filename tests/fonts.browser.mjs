import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CurrencyCHF, SwissDate, Table, TableBody, TableRow, TableCell } from 'alpina-ui'

const css = import.meta.resolve('alpina-ui/fonts.css')
const base = 'https://alpina.test'
const markup = renderToStaticMarkup(h('section', { 'data-al-theme': 'dark' },
  h('p', { id: 'languages' }, 'Città, Grüezi, œuvre, bainvgnü'),
  h(CurrencyCHF, { amount: 111 }), h(SwissDate, { value: '2028-12-01' }),
  h(Table, null, h(TableBody, null, h(TableRow, null, h(TableCell, { numeric: true }, '111'))))))
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage()
  const requested = []
  await page.route('**/*', async route => {
    const { origin, pathname } = new URL(route.request().url())
    assert.equal(origin, base)
    if (pathname === '/') {
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body:
        '<link rel="stylesheet" href="/styles.css"><body data-al-page>' + markup + '</body>' })
    }
    if (pathname === '/styles.css' || pathname === '/fonts.css') {
      const file = import.meta.resolve('alpina-ui' + pathname)
      return route.fulfill({ contentType: 'text/css', body: await readFile(new URL(file)) })
    }
    assert.match(pathname, /^\/fonts\/inter-latin(?:-ext)?-standard-normal\.woff2$/)
    requested.push(pathname)
    return route.fulfill({ contentType: 'font/woff2', body: await readFile(new URL('.' + pathname, css)) })
  })
  await page.goto(base)
  assert.deepEqual(requested, [])
  await page.addStyleTag({ url: base + '/fonts.css' })
  await page.evaluate(() => document.fonts.ready)
  assert.deepEqual(requested, ['/fonts/inter-latin-standard-normal.woff2'])
  assert.match(await page.locator('td').evaluate(el => getComputedStyle(el).fontFamily), /Inter Variable/)
  for (const el of await page.locator('data, time, td').all())
    assert.match(await el.evaluate(node => getComputedStyle(node).fontVariantNumeric), /tabular-nums/)
  const widths = await page.locator('td span').evaluate(el => ['111', '888'].map(digits => {
    el.textContent = digits
    return el.getBoundingClientRect().width
  }))
  assert.equal(widths[0], widths[1])
  await page.evaluate(async () => {
    document.querySelector('#languages').append(' Ÿ ẞ')
    await document.fonts.load('650 18px "Inter Variable"', 'Ÿẞ')
  })
  assert.ok(requested.includes('/fonts/inter-latin-ext-standard-normal.woff2'))

  const opticalWidths = await page.evaluate(() => {
    const sample = document.createElement('span')
    sample.textContent = 'Affiches publiques · Zürich'
    sample.style.font = '650 72px "Inter Variable"'
    sample.style.alignSelf = 'flex-start'
    document.body.append(sample)
    return [14, 32].map(size => {
      sample.style.fontVariationSettings = '"opsz" ' + size
      return sample.getBoundingClientRect().width
    })
  })
  assert.notEqual(opticalWidths[0], opticalWidths[1], 'the shipped font must contain distinct text and display cuts')

  // Report the face Chromium actually used to paint each sample glyph.
  const devtools = await page.context().newCDPSession(page)
  await devtools.send('DOM.enable')
  await devtools.send('CSS.enable')
  const { root } = await devtools.send('DOM.getDocument')
  const { nodeId } = await devtools.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#languages' })
  const { fonts } = await devtools.send('CSS.getPlatformFontsForNode', { nodeId })
  assert.ok(fonts.length > 0 && fonts.every(font => font.isCustomFont && font.familyName.includes('Inter')))
  console.log('Optional Inter loads local Latin subsets on demand and renders Swiss text with aligned digits.')
} finally {
  await browser.close()
}
