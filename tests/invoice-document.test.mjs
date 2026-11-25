import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { calculateInvoiceTotals, InvoiceDocument } from 'alpina-ui'

const line = (quantity, unitPrice, vatRate = 8.1) => ({ description: 'Test line', quantity, unitPrice, vatRate })

test('invoice arithmetic rounds fractional net lines and tax once for each rate', () => {
  const totals = calculateInvoiceTotals([line('2.5', '1.005'), line(1, '0.005'), line(1, '-0.005'),
    line(1, '30.00', 2.6), line(2, '10.00', 3.8), line(1, '2', 0)])
  assert.deepEqual(totals.lineNetCents, [251, 1, -1, 3000, 2000, 200])
  assert.deepEqual(totals.vat, [
    { rate: 0, baseCents: 200, taxCents: 0 }, { rate: 2.6, baseCents: 3000, taxCents: 78 },
    { rate: 3.8, baseCents: 2000, taxCents: 76 }, { rate: 8.1, baseCents: 251, taxCents: 20 },
  ])
  assert.equal(totals.totalCents, 5625)
  assert.equal(calculateInvoiceTotals([line(1, '0.10'), line(1, '0.10')]).taxCents, 2)
  assert.equal(calculateInvoiceTotals([line(1, '0.06'), line(1, '0.06')]).taxCents, 1)
  for (const sign of [1, -1]) {
    const cash = calculateInvoiceTotals([line(1, sign * 1.03, 0)], { cashRounding: true })
    assert.equal(cash.roundingCents, sign * 2)
    assert.equal(cash.totalCents, sign * 105)
  }
})

test('invalid quantities, precision and VAT rates fail before payment creation', () => {
  for (const invalid of [line(-1, 4), line('1,5', 4), line(1, Infinity), line(1, 1.00001), line(1, 2, 7.7),
    line('999999999999', '999999999999'), { ...line(1, 3), description: ' ' }]) {
    assert.throws(() => calculateInvoiceTotals([invalid]), RangeError)
  }
  assert.throws(() => calculateInvoiceTotals([]), RangeError)
})

test('the payable invoice and its receipt share one validated amount', () => {
  const party = { name: 'Studio', postalCode: '3000', town: 'Bern', country: 'CH' }
  const props = { invoiceNumber: 'A-24', issueDate: '2026-11-25', supplyDate: '2026-11-24', dueDate: '2026-12-25',
    vatNumber: 'CHE109322551', locale: 'it-CH', cashRounding: true, lines: [line(1, 10.01)],
    payment: { iban: 'CH5800791123000889012', creditor: party, debtor: party } }
  const html = renderToStaticMarkup(createElement(InvoiceDocument, props))
  assert.match(html, /CHE-109\.322\.551 IVA/)
  assert.match(html, /CHF 10\.80/)
  const [printed, readingView] = html.split('<details class="al-bill-reading"')
  assert.equal((printed.match(/>10\.80<\/dd>/g) ?? []).length, 2)
  assert.match(readingView, />10\.80<\/dd>/)
  for (const invalid of [{ lines: [line(1, 0)] }, { lines: [line(1, '999999999.99')] }, { vatNumber: 'CHE-100.000.000' }]) {
    assert.throws(() => renderToStaticMarkup(createElement(InvoiceDocument, { ...props, ...invalid })), RangeError)
  }
})

test('large offsetting lines retain the fourth price digit and every printed centime', () => {
  const party = { name: 'Studio', postalCode: '3000', town: 'Bern', country: 'CH' }
  const html = renderToStaticMarkup(createElement(InvoiceDocument, {
    invoiceNumber: 'R-2', issueDate: '2026-11-25', supplyDate: '2026-11-24', dueDate: '2026-12-25',
    vatNumber: 'CHE109322551', locale: 'de-CH', lines: [
      line(100, '900719925474.0991', 0), line(100, '-900719925474.0991', 0),
      line(1, '999999999999.9997', 0), line(1, '-999999999999.9997', 0), line(1, 1, 0), line(1, -0.01, 0),
    ], payment: { iban: 'CH5800791123000889012', creditor: party, debtor: party },
  }))
  assert.ok(html.includes('90’071’992’547’409.91'))
  assert.ok(html.includes('−90’071’992’547’409.91'))
  assert.match(html, /value="999999999999\.9997">1’000’000’000’000\.00</)
  assert.ok(html.includes('>−0.01<'))
  assert.ok(html.includes('CHF 0.99'))
})

test('invoice quantities retain their units and monetary columns always have two decimals', () => {
  const party = { name: 'Studio', postalCode: '3000', town: 'Bern', country: 'CH' }
  const lines = [{ ...line('2.50', 80, 0), unit: 'h' }, { ...line(1.25, '24.00', 0), unit: 'm²' },
    { ...line(2, '1.005', 0) }, { ...line(1, '-0.005', 0) }]
  const html = renderToStaticMarkup(createElement(InvoiceDocument, {
    invoiceNumber: 'R-3', issueDate: '2026-11-25', supplyDate: '2026-11-24', dueDate: '2026-12-25',
    vatNumber: 'CHE109322551', locale: 'de-CH', lines, payment: { iban: 'CH5800791123000889012', creditor: party, debtor: party },
  }))
  const body = html.match(/<tbody>([\s\S]*?)<\/tbody>/)[1]
  const values = [...body.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(match => match[1].replace(/<[^>]+>/g, ''))
  assert.deepEqual(values, ['2.5 h', '80.00', '0 %', '200.00', '1.25 m²', '24.00', '0 %', '30.00',
    '2', '1.01', '0 %', '2.01', '1', '−0.01', '0 %', '−0.01'])
})
