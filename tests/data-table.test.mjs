import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DataTable } from 'alpina-ui/ui/data-table'
import { CurrencyCHF } from 'alpina-ui/swiss/currency-chf'

const rows = Object.freeze([
  { id: 'B', cents: 12000 },
  { id: 'A', cents: 800 },
  { id: 'C', cents: 12000 },
])
const columns = [
  { id: 'id', header: 'Fattura', cell: (row) => row.id },
  {
    id: 'cents',
    header: 'Importo',
    align: 'end',
    cell: (row) => createElement(CurrencyCHF, { amount: row.cents / 100 }),
    compare: (a, b) => a.cents - b.cents,
  },
]
const props = {
  caption: 'Contabilità',
  empty: 'Non ci sono fatture',
  columns,
  rows,
  rowKey: (row) => row.id,
}

test('DataTable SSR sorts raw CHF stably without mutating the source or emitting events', () => {
  const html = renderToStaticMarkup(
    createElement(DataTable, {
      ...props,
      defaultSort: { column: 'cents', direction: 'descending' },
      onSortChange: () => assert.fail('SSR must not request a sort change'),
    }),
  )
  const order = [...html.matchAll(/<tr><td>([ABC])<\/td>/g)].map((match) => match[1])
  assert.deepEqual(order, ['B', 'C', 'A'])
  assert.deepEqual(
    rows.map((row) => row.id),
    ['B', 'A', 'C'],
  )
  assert.match(html, /<table class="al-table">/)
  assert.match(html, /<caption>Contabilità<\/caption>/)
  assert.match(html, /aria-sort="descending"/)
  assert.equal((html.match(/aria-sort=/g) ?? []).length, 1)
  assert.match(html, /<data lang="it-CH" value="8">/)
})

test('DataTable renders one full-width empty cell and retains the column headers', () => {
  const html = renderToStaticMarkup(createElement(DataTable, { ...props, rows: [] }))
  assert.match(html, /<tbody><tr><td colSpan="2">Non ci sono fatture<\/td><\/tr><\/tbody>/i)
  assert.match(html, /<th[^>]*scope="col"[^>]*>Fattura<\/th>/)
  assert.doesNotMatch(html, /aria-sort=/)
})