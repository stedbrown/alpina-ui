import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DataTable, TableAmount } from 'alpina-ui'

const rows = [
  { id: 'A', group: 'Office', amount: 'CHF 1’040.20', date: '31.01.2026' },
  { id: 'B', group: 'Office', amount: '(40,10 CHF)', date: '2025-12-05' },
  { id: 'C', group: 'Office', amount: '−0.10', date: '1.2.2026' },
  { id: 'D', group: 'Print', amount: '0.005', date: '2026-06-01' },
  { id: 'E', group: 'Print', amount: null, date: null },
]
const columns = [
  { id: 'id', header: 'Line', cell: row => row.id },
  { id: 'date', header: 'Date', format: 'swiss-date', value: row => row.date },
  { id: 'amount', header: 'Balance', format: 'chf', value: row => row.amount, aggregate: 'sum' },
]
function ledger(props = {}) {
  return renderToStaticMarkup(h(DataTable, { rows, columns, locale: 'de-CH', caption: 'Accounts', empty: 'Empty',
    rowKey: row => row.id, negativeStyle: 'parentheses', totalLabel: 'Total', ...props }))
}
const ids = html => [...html.matchAll(/<tr><td>([A-Z])<\/td>/g)].map(match => match[1])
test('Swiss CHF and civil date columns sort their values; missing entries remain last in either direction', () => {
  const sorted = (column, direction) => ids(ledger({ defaultSort: { column, direction } }))
  assert.deepEqual(sorted('amount', 'ascending'), ['B', 'C', 'D', 'A', 'E'])
  assert.deepEqual(sorted('amount', 'descending'), ['A', 'D', 'C', 'B', 'E'])
  assert.deepEqual(sorted('date', 'ascending'), ['B', 'A', 'C', 'D', 'E'])
  assert.deepEqual(sorted('date', 'descending'), ['D', 'C', 'A', 'B', 'E'])
  assert.match(ledger(), /datetime="2026-02-01"[^>]*>01\.02\.2026/i)
  for (const entry of [{ amount: "1'23.45" }, { date: '31.02.2026' }]) {
    assert.throws(() => ledger({ rows: [{ ...rows[0], ...entry }] }), RangeError)
  }
})
test('groups retain their records and totals add exact displayed centimes, including credits', () => {
  const html = ledger({ groupBy: row => row.group, subtotalLabel: group => group + ' subtotal', defaultSort: { column: 'amount', direction: 'ascending' } })
  assert.deepEqual(ids(html), ['B', 'C', 'A', 'D', 'E'])
  const headers = html.match(/<thead>([\s\S]*?)<\/thead>/)[1]
  assert.equal((headers.match(/<th[^>]*>[\s\S]*?<\/th>/g) ?? []).filter(cell => cell.includes('CHF')).length, 1)
  assert.ok(!html.slice(html.indexOf('</thead>')).includes('CHF'))
  assert.equal((html.match(/data-summary="subtotal"/g) ?? []).length, 2)
  assert.match(html, /Office subtotal[\s\S]*?value="1000.00"/)
  assert.match(html, /Print subtotal[\s\S]*?value="0.01"/)
  assert.match(html, /<tfoot>[\s\S]*?value="1000.01"/)
  assert.ok(html.includes('<span aria-hidden="true">(40.10)</span>'))
  assert.ok(html.includes('minus 40.10'))
  const large = ledger({ rows: [ { ...rows[0], amount: '9007199254740992.01' }, { ...rows[1], amount: '-9007199254740992' } ] })
  assert.match(large, /<tfoot>[\s\S]*?value="0.01"/)
})
test('TableAmount supports exact minor units, localized Swiss decimals and measured column precision', () => {
  const render = props => renderToStaticMarkup(h(TableAmount, props))
  assert.match(render({ minorUnits: -5n, format: 'chf', locale: 'rm-CH' }), /value="-0.05"[^>]*>−0,05</)
  assert.match(render({ value: -1.005, format: 'chf', locale: 'fr-CH' }), /value="-1.01"[^>]*>−1\.01</)
  assert.match(render({ value: '12’345.5', fractionDigits: 3, locale: 'rm-CH' }), /12 345,500/)
  assert.match(render({ value: -1e-7, fractionDigits: 8, locale: 'de-CH' }), /−0\.00000010/)
})
