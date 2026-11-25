import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  buildSwissQrPayload, formatSwissNumber, LocaleSelect, MultilingualField, SwissQrBill,
  SwissQrValidationError, swissLocales, swissValidationMessage,
} from 'alpina-ui'

const bill = {
  iban: 'CH5800791123000889012', currency: 'CHF',
  creditor: { name: 'Atelier', street: 'Via Maistra', postalCode: '7500', town: 'San Murezzan', country: 'CH' },
  reference: { type: 'SCOR', value: 'RF18 5390 0754 7034' }, message: 'Quint 12',
}

test('Romansh controls expose the same options and field names in the selected interface language', () => {
  const picker = renderToStaticMarkup(createElement(LocaleSelect, { value: 'rm-CH' }))
  assert.match(picker, /value="rm-CH"[^>]*selected=""[^>]*>Rumantsch/)
  const editor = renderToStaticMarkup(createElement(MultilingualField, {
    name: 'title', label: 'Titel', locale: 'rm-CH', sourceLanguage: 'rm',
    defaultValue: { rm: 'A' }, includeEnglish: true, layout: 'columns',
  }))
  for (const code of ['de', 'fr', 'it', 'rm', 'en']) assert.ok(editor.includes('name="title[' + code + ']"'))
  assert.match(editor, /1 segn · Cumplet/)
  assert.match(editor, /0 segns · Vid/)
  assert.match(editor, /Copiar la versiun «Rumantsch»/)
  for (const field of ['ahv', 'iban', 'uid', 'phone', 'postalCode', 'required']) {
    assert.equal(new Set([...swissLocales, 'en'].map(locale => swissValidationMessage(field, locale))).size, 5, field)
  }
})

test('Swiss decimal quantities retain input precision and Romansh grouping in reduced-ICU environments', () => {
  const digits = '1234567890123456789.12500'
  for (const [tag, expected] of [
    ['rm-CH', '1 234 567 890 123 456 789,125'], ['fr-CH', '1 234 567 890 123 456 789,125'],
    ['de-CH', '1’234’567’890’123’456’789.125'], ['it-CH', '1’234’567’890’123’456’789.125'],
  ]) assert.equal(formatSwissNumber(digits, tag), expected)
  assert.equal(formatSwissNumber(-0, 'rm-CH', { minimumFractionDigits: 2 }), '−0,00')
  assert.equal(formatSwissNumber(1e-7, 'rm-CH'), '0,0000001')
  assert.equal(formatSwissNumber(1e21, 'rm-CH'), '1 000 000 000 000 000 000 000')
  assert.equal(formatSwissNumber(-2500n, 'rm-CH'), '−2 500')
  for (const value of ['1,25', '', '1.2.3', Infinity, NaN]) assert.throws(() => formatSwissNumber(value), RangeError)
})

test('SIX Annex C headings, the notification wording and the QR accessible name use Romansh', () => {
  const markup = props => renderToStaticMarkup(createElement(SwissQrBill, { locale: 'rm-CH', bill: props }))
  const open = markup(bill)
  for (const label of ['Quittanza', 'Part da pajament', 'Conto / Da pajar a', 'Referenza', 'Infurmaziuns supplementaras',
    'Da pajar da (num/adressa)', 'Valuta', 'Import', 'Post da recepziun', 'Code QR svizzer']) assert.ok(open.includes(label), label)
  assert.match(markup({ ...bill, debtor: bill.creditor }), /<dt>Da pajar da<\/dt>/)
  const zero = { ...bill, amount: '0.00', message: 'BETG DUVRAR PER IL PAJAMENT' }
  assert.ok(markup(zero).includes(zero.message))
  for (const tag of swissLocales) assert.equal(buildSwissQrPayload(zero, tag), buildSwissQrPayload(zero))
})

test('payment errors retain machine-readable paths and codes in each language', () => {
  for (const [invalid, field, code] of [
    [{ ...bill, creditor: { ...bill.creditor, name: '' } }, 'creditor.name', 'required'],
    [{ ...bill, debtor: { ...bill.creditor, town: 'x'.repeat(36) } }, 'debtor.town', 'length'],
    [{ ...bill, alternativeProcedures: ['ok', '😃'] }, 'alternativeProcedures.1', 'characterSet'],
    [{ ...bill, amount: -1 }, 'amount', 'amount'],
  ]) {
    const messages = new Set()
    for (const tag of [...swissLocales, 'en']) {
      assert.throws(() => buildSwissQrPayload(invalid, tag), error => {
        assert.ok(error instanceof SwissQrValidationError && error instanceof RangeError)
        assert.equal(error.field, field)
        assert.equal(error.code, code)
        assert.doesNotMatch(error.message, /\{field\}|\{max\}/)
        messages.add(error.message)
        return true
      })
    }
    assert.equal(messages.size, 5)
  }
})
