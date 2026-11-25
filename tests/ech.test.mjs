import assert from 'node:assert/strict'
import test from 'node:test'
import { isSwissUid, formatSwissUid, toEchMailAddress } from 'alpina-ui'

test('eCH-0108 UID check digit accepts the official example, zero and rejects an unassignable ten', () => {
  assert.equal(formatSwissUid('che109322551'), 'CHE-109.322.551')
  assert.equal(isSwissUid('CHE-100.000.070'), true)
  for (const id of ['CHE-109.322.552', 'CHE-123.456.789', 'CHE-000.000.000', '109322551', 'CHE-109.322.551 MWST', 'CH109322551']) {
    assert.equal(isSwissUid(id), false, id)
  }
  for (let digit = 0; digit <= 9; digit++) assert.equal(isSwissUid('CHE-100.000.16' + digit), false)
})

const address = { recipient: 'Grafik AG', addressLine1: 'c/o Atelier', addressLine2: 'Chalet Edelweiss',
  street: 'Rue des  Lilas', houseNumber: '2a', postalCode: '1003', locality: 'Lausanne', canton: 'VD' }

test('eCH-0010 street delivery preserves the ordered, structured fields and Swiss country information', () => {
  assert.deepEqual(toEchMailAddress(address, 'ech-organisation'), {
    organisation: { organisationName: 'Grafik AG' }, addressInformation: {
      addressLine1: 'c/o Atelier', addressLine2: 'Chalet Edelweiss', street: 'Rue des Lilas', houseNumber: '2a',
      town: 'Lausanne', swissZipCode: 1003, country: { countryIdISO2: 'CH', countryNameShort: 'Schweiz' },
    },
  })
  assert.deepEqual(toEchMailAddress({ ...address, recipient: 'Graf', firstName: 'Ida' }, 'ech-person').person, { firstName: 'Ida', lastName: 'Graf' })
  const { addressInformation } = toEchMailAddress({ ...address, addressLine2: '', houseNumber: '' }, 'ech-person')
  assert.ok(!('addressLine2' in addressInformation) && !('houseNumber' in addressInformation))
  for (const [key, limit] of [['recipient', 60], ['addressLine1', 150], ['addressLine2', 150], ['street', 150], ['houseNumber', 30], ['locality', 40]]) {
    assert.doesNotThrow(() => toEchMailAddress({ ...address, [key]: '𐐀'.repeat(limit) }, 'ech-organisation'))
    assert.throws(() => toEchMailAddress({ ...address, [key]: '𐐀'.repeat(limit + 1) }, 'ech-organisation'), RangeError)
  }
  for (const key of ['firstName', 'recipient']) assert.throws(() => toEchMailAddress({ ...address, [key]: 'ä'.repeat(31) }, 'ech-person'), RangeError)
  assert.throws(() => toEchMailAddress({ ...address, addressLine1: 'c/o\u0000Firma' }, 'ech-person'), RangeError)
  for (const invalid of ['0999', '10000', '1x00', '00']) assert.throws(() => toEchMailAddress({ ...address, postalCode: invalid }, 'ech-person'), RangeError)
})
