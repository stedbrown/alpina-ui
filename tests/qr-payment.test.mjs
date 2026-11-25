import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSwissQrPayload, createQrReference, createCreditorReference, formatQrReference, formatCreditorReference,
  isQrReference, isCreditorReference } from 'alpina-ui'

// Test identifiers from the SIX Implementation Guidelines for the QR-bill 2.4, Annex A.
const iban = 'CH58 0079 1123 0008 8901 2'
const qrIban = 'CH44 3199 9123 0008 8901 2'
const qrr = '21 00000 00003 13947 14300 09017'
const creditor = { name: "Atelier de l'Île", street: 'Forchstrasse', buildingNumber: '6a', postalCode: '8008', town: 'Zürich', country: 'CH' }
const debtor = { name: 'Pavla Șandor', postalCode: '7000', town: 'Cuira', country: 'CH' }
const bill = { iban, creditor, currency: 'CHF' }

test('the public reference generators preserve identifiers and match SIX and ISO examples', () => {
  assert.equal(createQrReference('21000000000313947143000901'), '210000000003139471430009017')
  assert.equal(formatQrReference(qrr), '21 00000 00003 13947 14300 09017')
  assert.equal(formatQrReference(formatQrReference(qrr)), formatQrReference(qrr))
  assert.equal(createQrReference(1), createQrReference('0001'))
  assert.ok(isQrReference(createQrReference(99999999999999999999999999n)))
  assert.equal(createCreditorReference('539007547034'), 'RF18539007547034')
  assert.equal(formatCreditorReference('rf18 539007547034'), 'RF18 5390 0754 7034')
  assert.ok(isCreditorReference(createCreditorReference('Ab0123456789abcdefghI')))
  assert.equal(createCreditorReference('0191230100405jsh0438'), 'RF240191230100405JSH0438')
  for (const value of ['', -1, '0', '00', 'A1', '123456789012345678901234567', 1.5, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => createQrReference(value), RangeError)
  for (const value of ['', -2, 'A-1', 'Ä', 'A'.repeat(22), 1.5, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => createCreditorReference(value), RangeError)
  assert.throws(() => formatQrReference('210000000003139471430009018'), RangeError)
  assert.throws(() => formatCreditorReference('RF19539007547034'), RangeError)
})

test('the payload preserves required empty lines, decimal amounts and registered extension positions', () => {
  const base = buildSwissQrPayload(bill)
  assert.equal(base.endsWith('EPD'), true)
  assert.equal(base.includes('\r'), false)
  const lines = base.split('\n')
  assert.equal(lines.length, 31)
  assert.deepEqual(lines.slice(0, 6), ['SPC', '0200', '1', 'CH5800791123000889012', 'S', creditor.name])
  assert.deepEqual(lines.slice(11, 18), Array(7).fill(''))
  assert.equal(lines[18], '')
  assert.deepEqual(lines.slice(20, 27), Array(7).fill(''))
  assert.deepEqual(lines.slice(27), ['NON', '', '', 'EPD'])
  const extended = buildSwissQrPayload({ ...bill, amount: 0.1, debtor, message: 'Merci €',
    alternativeProcedures: ['eBill/B/123'] }).split('\n')
  assert.equal(extended[18], '0.10')
  assert.deepEqual(extended.slice(20, 27), ['S', debtor.name, '', '', '7000', 'Cuira', 'CH'])
  assert.deepEqual(extended.slice(29), ['Merci €', 'EPD', '', 'eBill/B/123'])
  assert.equal(buildSwissQrPayload({ ...bill, amount: '999999999.99' }).split('\n')[18], '999999999.99')
})

test('QRR and SCOR enforce their own checksum, account type and currency', () => {
  assert.ok(isQrReference(qrr))
  assert.ok(isCreditorReference('RF18 5390 0754 7034'))
  assert.ok(isCreditorReference('RF240191230100405JSH0438'))
  assert.equal(isCreditorReference('RF720191230100405JSH0438'), false)
  assert.equal(isQrReference('0'.repeat(27)), false)
  assert.equal(isQrReference(qrr.slice(0, -1) + '8'), false)
  assert.equal(isCreditorReference('RF19 5390 0754 7034'), false)
  const reference = { type: 'QRR', value: qrr }
  assert.ok(buildSwissQrPayload({ ...bill, iban: qrIban, reference }).includes('\nQRR\n210000000003139471430009017\n'))
  const scor = {type: 'SCOR', value: 'rf18 5390 0754 7034'}
  assert.ok(buildSwissQrPayload({ ...bill, currency: 'EUR', reference: scor }).includes('\nSCOR\nRF18539007547034\n'))
  for (const patch of [
    { iban: qrIban }, { reference }, { iban: qrIban, reference, currency: 'EUR' },
    { iban: qrIban, reference: scor }, { reference: { type: 'NON', value: '3' } },
    { reference: { ...scor, value: 'RF00INVALID' } }, { iban: 'CH5800791123000889013' },
  ]) assert.throws(() => buildSwissQrPayload({ ...bill, ...patch }), RangeError)
})

test('rejects invalid amounts, embedded separators, bad addresses and oversized supplementary fields', () => {
  for (const amount of [0, -1, 0.001, 1000000000, '01.00', '2,50', NaN, Infinity]) {
    assert.throws(() => buildSwissQrPayload({ ...bill, amount }), RangeError)
  }
  for (const patch of [
    { creditor: { ...creditor, town: '' } }, { debtor: { ...debtor, postalCode: '' } },
    { debtor: { ...debtor, country: 'XX' } }, { message: 'a\r\nEPD' }, { message: '😃' },
    { message: 'a'.repeat(139), billingInformation: '//S1/12/42' },
    { alternativeProcedures: ['01/a','02/b','03/c'] }, { currency: 'USD' },
  ]) assert.throws(() => buildSwissQrPayload({ ...bill, ...patch }), RangeError)
})

test('the non-payable notification is the only permitted zero-amount exception', () => {
  const notification = { ...bill, message: 'DO NOT USE FOR PAYMENT' }
  assert.equal(buildSwissQrPayload({ ...notification, amount: 0 }).split('\n')[18], '0.00')
  assert.throws(() => buildSwissQrPayload(notification), RangeError)
  assert.throws(() => buildSwissQrPayload({ ...notification, amount: '1.00' }), RangeError)
})

test('grouped invoice identifiers preserve meaningful digits and RF prefixes', () => {
  const grouped = { stripSeparators: true }
  for (const value of ['2026-0141', '2026/0141', '2026.0141', '2026\u202f0141']) {
    assert.equal(createQrReference(value, grouped), createQrReference('20260141'))
    assert.equal(createCreditorReference(value, grouped), createCreditorReference('20260141'))
    assert.throws(() => createQrReference(value), /stripSeparators/)
  }
  assert.equal(createCreditorReference('INV-2026-0141', grouped), createCreditorReference('INV20260141'))
  assert.throws(() => createQrReference('INV-2026-0141', grouped), /numeric identifier/)
  for (const value of [-1, '-1', '2?3', '01-']) {
    assert.throws(() => createQrReference(value, grouped), RangeError)
    assert.throws(() => createCreditorReference(value, grouped), RangeError)
  }
})
