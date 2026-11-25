import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSwissQrPayload, parseSwissQrPayload, SwissQrPayloadError } from 'alpina-ui'

// SIX IG 2.4 Annex A uses this QR-IBAN, structured address and QRR combination.
const base = { iban: 'CH4431999123000889012', currency: 'CHF', amount: '1949.75',
  creditor: { name: 'Max Muster & Söhne', street: 'Musterstrasse', buildingNumber: '123', postalCode: '8000', town: 'Seldwyla', country: 'CH' },
  debtor: { name: 'Simon Muster', postalCode: '8000', town: 'Seldwyla', country: 'CH' },
  reference: { type: 'QRR', value: '210000000003139471430009017' }, message: 'Commande 01234',
  billingInformation: '//S1/10/10201409', alternativeProcedures: ['UV;test', 'XY;test'] }
const original = buildSwissQrPayload(base)
test('all payment fields round-trip across LF and CRLF including alternative procedures, open amounts and notifications', () => {
  const plain = { iban: 'CH5800791123000889012', creditor: base.creditor, currency: 'EUR' }
  for (const bill of [base, plain, { ...plain, amount: '55', reference: { type: 'SCOR', value: 'RF18539007547034' } },
    { ...plain, message: 'BETG DUVRAR PER IL PAJAMENT', amount: '0.00' }, { ...plain, alternativeProcedures: ['XY;1'] }]) {
    const data = buildSwissQrPayload(bill)
    for (const separator of ['\n', '\r\n']) for (const trailing of ['', separator])
      assert.equal(buildSwissQrPayload(parseSwissQrPayload(data.replaceAll('\n', separator) + trailing)), data)
  }
})
test('wire framing, reserved positions, checksum, account pairing, lengths and transaction rules report the precise SIX field', () => {
  const invalid = [
    [1, 'SPX', 'header'], [2, '0300', 'version'], [3, '2', 'encoding'], [4, 'CH4431999123000889013', 'iban'],
    [5, 'K', 'creditor.type'], [6, '', 'creditor.name'], [7, 'bad😀', 'creditor.street'], [8, '1'.repeat(17), 'creditor.buildingNumber'],
    [11, 'ZZ', 'creditor.country'], [12, 'S', 'ultimateCreditor.type'], [18, 'CH', 'ultimateCreditor.country'], [19, '01.50', 'amount'],
    [19, '1.5', 'amount'], [19, '0.00', 'amount'], [20, 'EUR', 'currency'], [21, '', 'debtor.type'], [25, '', 'debtor.postalCode'],
    [26, 'x'.repeat(36), 'debtor.town'], [28, 'SCOR', 'reference.type'], [29, '210000000003139471430009018', 'reference.value'],
    [30, 'x'.repeat(141), 'message'], [31, 'END', 'trailer'], [32, 'incorrect', 'billingInformation'],
    [33, '', 'alternativeProcedures.0'], [34, 'x'.repeat(101), 'alternativeProcedures.1'],
  ]
  for (const [line, value, field] of invalid) {
    const lines = original.split('\n')
    lines[line - 1] = value
    assert.throws(() => parseSwissQrPayload(lines.join('\n'), { locale: 'rm-CH' }), e =>
      e instanceof SwissQrPayloadError && e.line === line && e.field === field && e.message.includes('Lingia ' + line), field)
  }
  for (const [payload, code] of [[original.replace('\n', '\r\n'), 'separators'], [original + '\n\n', 'separators'],
    [original.replace('\n', '\r'), 'separators'], [original + '\nextra', 'fields'], ['SPC\n0200', 'fields'], ['x'.repeat(998), 'capacity']])
    assert.throws(() => parseSwissQrPayload(payload), e => e instanceof SwissQrPayloadError && e.code === code)
})

test('receiving a valid payment quarantines invalid status-A fields with their source lines', () => {
  const lines = original.split('\n')
  lines[31] = 'bad billing syntax'
  lines[32] = 'x'.repeat(101)
  const warnings = []
  const bill = parseSwissQrPayload(lines.join('\n'), { onAdditionalError: issue => warnings.push(issue) })
  assert.equal(bill.billingInformation, undefined)
  assert.deepEqual(bill.alternativeProcedures, [lines[33]])
  assert.deepEqual(warnings.map(e => [e.line, e.field]), [[32, 'billingInformation'], [33, 'alternativeProcedures.0']])
  assert.throws(() => parseSwissQrPayload(lines.join('\n')), e => e.line === 32)
  lines[28] = '0'.repeat(27)
  assert.throws(() => parseSwissQrPayload(lines.join('\n'), { onAdditionalError() {} }), e => e.line === 29)
})

test('the scanned symbol capacity counts the original UTF-8 bytes including CRLF and final delimiter', () => {
  const capacityBill = { ...base, message: '', billingInformation: undefined }
  const address = { name: 'é'.repeat(70), town: 'é'.repeat(35), street: 'é'.repeat(70), buildingNumber: '1'.repeat(16), postalCode: '1003', country: 'CH' }
  let code
  for (let length = 1; length <= 140; length++) {
    try { code = buildSwissQrPayload({ ...capacityBill, creditor: address, debtor: address, message: 'é'.repeat(length) }) }
    catch { break }
  }
  assert.ok(Buffer.byteLength(code) >= 996)
  assert.ok(parseSwissQrPayload(code))
  assert.throws(() => parseSwissQrPayload(code.replaceAll('\n', '\r\n')), e => e.code === 'capacity')
})
