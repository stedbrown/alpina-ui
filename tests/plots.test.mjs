import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BarChart, LineChart, Sparkline, ChartTable, Chart, TableCell, Typography } from 'alpina-ui'

const series = [BarChart, LineChart, Sparkline, ChartTable]
const html = (component, props = {}) => renderToStaticMarkup(createElement(component, {
  title: 'Orders', description: 'Weekly change in supplied copies', data: [], ...props,
}))
test('SVG figures expose descriptions, real row and column headers, and localized value labels', () => {
  for (const component of series) {
    const markup = html(component, { data: [{ label: 'May', value: -8 }, { label: 'June', value: 12 }],
      formatValue: n => n + ' copies', categoryLabel: 'Month', valueLabel: 'Change' })
    assert.match(markup, /<svg/)
    assert.match(markup, /<figure[^>]+aria-describedby=/)
    assert.match(markup, /<th scope="col">Month<\/th>/)
    assert.match(markup, /<th scope="row">May<\/th>/)
    assert.match(markup, /<td>−8 copies<\/td>/)
    assert.equal(markup.includes('<details'), component !== ChartTable)
  }
})
test('empty, loading, singleton, signed and large finite series have bounded geometry', () => {
  for (const component of series) {
    assert.match(html(component, { data: [{ label: 'Missing', value: NaN }] }), /No observations/)
    assert.match(html(component, { loading: true, loadingLabel: 'Waiting' }), /role="status">Waiting/)
    for (const values of [[0], [9], [-4, -4], [-Number.MAX_VALUE, Number.MAX_VALUE]]) {
      const markup = html(component, { data: values.map((value, i) => ({ label: String(i), value })) })
      assert.doesNotMatch(markup, /NaN|Infinity|undefined/)
      assert.match(markup, /<svg/)
    }
  }
})

test('negative display values use U+2212 across plots and cells, preserving identifiers and dates', () => {
  for (const component of [...series, Chart]) {
    const markup = html(component, { data: [{ label: 'AP-104', value: -32 }] })
    assert.match(markup, />−32</)
    assert.match(markup, />AP-104</)
    assert.doesNotMatch(markup, />-32</)
  }
  for (const [value, expected] of [[-32n, '−32'], ['CHF -1.25', 'CHF −1.25'], ['2026-11-25', '2026-11-25']]) {
    for (const component of [Typography, TableCell]) {
      const markup = renderToStaticMarkup(createElement(component, { numeric: true }, value))
      assert.ok(markup.includes('>' + expected + '<'))
    }
  }
})

test('named comparisons align series by category and preserve missing readings in lines and tables', () => {
  const groups = [
    { name: 'Actual', data: [{ label: 'Jan', value: 4 }, { label: 'Feb', value: 8 }, { label: 'Mar', value: 2 }] },
    { name: 'Budget', data: [{ label: 'Mar', value: -1 }, { label: 'Jan', value: 3 }] },
  ]
  for (const chart of [BarChart, LineChart]) {
    const markup = html(chart, { series: groups })
    assert.match(markup, /class="al-series-legend"/)
    assert.match(markup, /<th scope="col">Actual<\/th><th scope="col">Budget<\/th>/)
    assert.match(markup, /<th scope="row">Feb<\/th><td>8<\/td><td>—<\/td>/)
    assert.match(markup, /<th scope="row">Mar<\/th><td>2<\/td><td>−1<\/td>/)
    if (chart === BarChart) assert.equal((markup.match(/class="al-value-bar"/g) ?? []).length, 5)
    else assert.match(markup, /<path d="M0 [\d.]+ M100 [\d.]+ "/)
    assert.match(html(chart, { series: [] }), /No observations/)
  }
})

test('negative bars have an independent hatch, and line axes label an intermediate category', () => {
  const data = ['Jan', 'Feb', 'Mar'].map((label, i) => ({ label, value: i - 1 }))
  const bars = html(BarChart, { data })
  assert.equal((bars.match(/<pattern /g) ?? []).length, 1)
  assert.match(bars, /<rect fill="url\(#.+?\)"/)
  for (const props of [{ data }, { series: [{ name: 'Budget', data }] }]) {
    const line = html(LineChart, props)
    assert.match(line, /class="al-series-middle"[^>]*>Feb</)
    assert.match(line, /class="al-series-guides"[\s\S]*?stroke-dasharray="2 4"/)
  }
})
