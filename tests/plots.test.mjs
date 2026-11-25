import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BarChart, LineChart, Sparkline, ChartTable } from 'alpina-ui'

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
    assert.match(markup, /<td>-8 copies<\/td>/)
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
