import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PNG } from 'pngjs'
import { BarChart, LineChart } from 'alpina-ui'
import { launchBrowser } from './launch-browser.mjs'

const series = [
  { name: '2026', data: [{ label: 'January', value: 100 }, { label: 'February', value: -100 }, { label: 'March', value: 8 }] },
  { name: 'Budget', data: [{ label: 'January', value: 70 }, { label: 'February', value: 75 }, { label: 'March', value: 80 }] },
  { name: '2025', data: [{ label: 'January', value: 62 }, { label: 'February', value: 50 }, { label: 'March', value: 32 }] },
]
const css = await readFile(new URL(import.meta.resolve('alpina-ui/styles.css')), 'utf8')
// The horizontal first segment and the isolated May observation have bare paper
// behind them. This lets a translucent system Highlight be measured once,
// just as it is in the key, without compositing the point over its own line.
const levels = [50, 25, -50]
const lines = series.map(({ name }, i) => ({ name, data: [
  { label: 'January', value: levels[i] }, { label: 'February', value: levels[i] },
  { label: 'March', value: [-100, 100, 0][i] }, { label: 'April', value: NaN },
  { label: 'May', value: [10, 30, 60][i] }, { label: 'June', value: NaN },
] }))
const content = renderToStaticMarkup(h('main', null, h(BarChart, { title: 'Revenue', series }), h(LineChart, { title: 'Bookings', series: lines })))
function transitions(png) {
  const { data, width, height } = PNG.sync.read(png)
  const mid = Math.floor(height / 2) * width * 4
  let changes = 0
  for (let x = 3; x < width - 3; x++) {
    const at = mid + x * 4
    if ([0, 1, 2].some(channel => Math.abs(data[at + channel] - data[at - 4 + channel]) > 80)) changes++
  }
  return changes
}
function pixel(bytes, left) {
  const { width, height, data } = PNG.sync.read(bytes)
  const x = left ? 1 : Math.floor(width / 2)
  const offset = 4 * (Math.floor(height / 2) * width + x)
  return data.subarray(offset, offset + 3).toString('hex')
}
for (const [theme, forcedColors] of [['light', 'none'], ['dark', 'none'], ['light', 'active'], ['dark', 'active']]) {
  const browser = await launchBrowser(forcedColors === 'active' ? theme : undefined)
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 800 }, colorScheme: theme, forcedColors })
    await page.setContent('<!doctype html><html lang="en" data-al-theme="' + theme + '"><style>' + css + '</style>' + content + '</html>')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 360)
    const colors = selector => page.locator(selector).evaluateAll(nodes => nodes.map(node => getComputedStyle(node).stroke))
    assert.deepEqual(await colors('.al-series-legend[data-kind="lines"] line'), await colors('.al-series-line-group path'))
    const trace = page.locator('.al-series-trace')
    const image = PNG.sync.read(await trace.screenshot({ scale: 'css' }))
    const fills = []
    for (const index of [0, 1, 2]) {
      const tag = '[data-series="' + index + '"]'
      const barKey = page.locator('.al-series-legend[data-kind="bars"] ' + tag + ' rect')
      const positive = page.locator('.al-series-group').first().locator(tag + ' rect')
      const paint = mark => mark.evaluate(el => [getComputedStyle(el).fill, getComputedStyle(el).stroke])
      assert.deepEqual(await paint(positive), await paint(barKey), 'Bar fill and outline must match its legend')
      const keyPixel = pixel(await barKey.screenshot())
      assert.equal(pixel(await positive.screenshot()), keyPixel, theme + ' ' + forcedColors + ' painted bar does not match its key')
      fills.push(keyPixel)
      const lineKey = page.locator('.al-series-legend[data-kind="lines"] ' + tag + ' svg')
      const markers = page.locator('.al-series-line-group' + tag + ' circle')
      const keyInk = pixel(await lineKey.screenshot(), true)
      assert.equal(await markers.last().evaluate(el => getComputedStyle(el).fill),
        await lineKey.locator('line').evaluate(el => getComputedStyle(el).stroke))
      assert.equal(pixel(await markers.last().screenshot()), keyInk, theme + ' ' + forcedColors + ' isolated point must match its key')
      const cy = Number(await markers.first().getAttribute('cy'))
      // A 2 px stroke contains a fully covered pixel row. Sample a stretch of
      // the first segment so the gaps in a dashed line stay meaningful.
      const row = Math.floor(cy)
      let matches = 0
      for (let x = 6; x < image.width / 5 - 6; x++) {
        const offset = 4 * (row * image.width + x)
        if (image.data.subarray(offset, offset + 3).toString('hex') === keyInk) matches++
      }
      assert.ok(matches >= 3, theme + ' ' + forcedColors + ' plotted stroke must paint its legend ink')
    }
    assert.notEqual(fills[0], fills[1], 'Accent series and ink series must remain distinct')
    const origins = await page.locator('.al-series-group .al-value-bar > line').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x))
    assert.ok(Math.max(...origins) - Math.min(...origins) <= 1, 'All grouped bars must share a zero line')
    const marks = page.locator('.al-series-group [data-series="0"] rect')
    assert.ok(transitions(await marks.nth(1).screenshot()) > 4, 'Losses must paint a hatch in ' + theme + ' ' + forcedColors)
    assert.equal(transitions(await marks.first().screenshot()), 0)
  } finally { await browser.close() }
}
console.log('Verified grouped baselines, series keys and painted losses in standard and high-contrast palettes.')
