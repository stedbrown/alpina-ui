import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { chromium } from 'playwright-core'
import { Card, Grid, GridItem, Typography } from 'alpina-ui'

const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')
const render = (props, ...items) => renderToStaticMarkup(h(Grid, props, ...items))
const card = (field, title) => h(GridItem, { field, subgrid: 'rows', asChild: true },
  h(Card, { as: 'article' },
    h(Typography, { variant: 'label' }, field),
    h(Typography, { as: 'h2', variant: 'heading' }, title),
    h(Typography, null, 'Schedule')))
const item = (field, text) => h(GridItem, { field }, text)
for (const [fields, problem] of [
  [['one two', 'one'], /equally wide/],
  [['one two', 'one one'], /rectangle/],
  [['two;unsafe'], /field names/],
]) assert.throws(() => render({ fields }), problem)
assert.throws(() => render({ rows: 0 }), /positive/)
assert.throws(() => render({ rows: 1, fields: ['one', 'two'] }), /must match/)
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const compare = (actual, expected) => assert.ok(Math.abs(actual - expected) < .15, actual + ' vs ' + expected)
  for (const [fields, span] of [['thirds', 4], ['five-seven', 5]]) {
    const markup = render({ fields, rows: 3, guides: true }, card('lead', 'Press'), card('detail', 'An illustrated catalogue of Swiss printing and graphic design'))
    await page.setContent('<style>' + css + '</style><main>' + markup + '</main>')
    for (const width of [320, 768, 1280]) {
      await page.locator('main').evaluate((el, width) => { el.style.width = width + 'px' }, width)
      const grid = page.locator('.al-grid')
      const a = page.locator('article[data-field=lead]'), b = page.locator('article[data-field=detail]')
      const first = await a.boundingBox(), second = await b.boundingBox()
      assert.equal(await grid.locator('.al-grid-guides i:visible').count(), width < 576 ? 4 : 12)
      if (width < 576) {
        compare(first.x, second.x)
        assert.ok(second.y >= first.y + first.height)
      } else {
        const cssom = await grid.evaluate(el => {
          const s = getComputedStyle(el)
          return { columns: s.gridTemplateColumns.split(' ').map(parseFloat),
            rows: s.gridTemplateRows.split(' ').map(parseFloat), h: parseFloat(s.columnGap), v: parseFloat(s.rowGap) }
        })
        assert.equal(cssom.columns.length, 12)
        assert.equal(cssom.rows.length, 3)
        compare(cssom.h, cssom.v)
        compare(first.width, cssom.columns.slice(0, span).reduce((a, b) => a + b, 0) + (span - 1) * cssom.h)
        compare(second.x - first.x - first.width, cssom.h)
        compare(cssom.rows[0], cssom.rows[2])
        assert.match(await a.evaluate(el => getComputedStyle(el).gridTemplateRows), /^subgrid/)
        for (let i = 0; i < 3; i++)
          compare((await a.locator(':scope > *').nth(i).boundingBox()).y, (await b.locator(':scope > *').nth(i).boundingBox()).y)
      }
    }
  }
  const matrix = render({ fields: ['date title title', 'date where .'], guides: true },
    item('date', '12.03'), item('title', 'Press day'), item('where', 'Basel'))
  await page.setContent('<style>' + css + '</style><main style="width:700px">' + matrix + '</main>')
  const date = await page.locator('[data-field=date]').boundingBox()
  const title = await page.locator('[data-field=title]').boundingBox()
  const venue = await page.locator('[data-field=where]').boundingBox()
  assert.equal(await page.locator('.al-grid-guides i:visible').count(), 3)
  compare(date.y, title.y)
  compare(venue.x, title.x)
  compare(date.height, venue.y - title.y + venue.height)
  assert.ok(venue.width < title.width)
  const rows = render({ rows: 3 }, h(GridItem, { row: 2, rowSpan: 2, subgrid: 'both', medium: 4, large: 4 }, h('span', null, 'Two rows')))
  await page.setContent('<style>' + css + '</style>' + rows)
  const cell = await page.locator('.al-grid-item').evaluate(el => {
    const s = getComputedStyle(el)
    return [s.gridRowStart, s.gridRowEnd, s.gridTemplateColumns, s.gridTemplateRows]
  })
  assert.deepEqual(cell.slice(0, 2), ['2', 'span 2'])
  assert.ok(cell.slice(2).every(value => value.startsWith('subgrid')))
  const nested = render({}, h(GridItem, {
    start: { small: 2, medium: 2, large: 3 }, small: 3, medium: 7, large: 10, row: 2, rowSpan: 2,
  }, h(Grid, null, ...['First', 'Second'].map(label =>
    h(GridItem, { key: label, small: 2, medium: 4, large: 6 }, label)))))
  await page.setContent('<style>' + css + '</style><main>' + nested + '</main>')
  for (const width of [320, 800, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const cells = page.locator('.al-grid-item .al-grid-item')
    const first = await cells.first().boundingBox()
    const second = await cells.last().boundingBox()
    compare(first.y, second.y)
    assert.ok(second.x >= first.x + first.width, 'Nested grid items occupy adjacent columns at ' + width)
    assert.equal(await cells.first().evaluate(el => getComputedStyle(el).gridRowStart), 'auto')
  }
  console.log('Verified named fields, both asymmetrical splits, equal gutters, shared tracks and container reflow.')
} finally {
  await browser.close()
}
