import test from 'node:test'
import assert from 'node:assert/strict'
import { ahvSchema, echAddressSchema, ibanSchema, phoneSchema, postalCodeSchema, qrIbanSchema, qrrSchema, scorSchema, uidSchema } from 'alpina-ui/swiss/schemas'
import { swissLocales, swissValidationMessage, toEchMailAddress } from 'alpina-ui'

const examples = [
  [ibanSchema, 'ch93 0076 2011 6238 5295 7', 'CH9300762011623852957'],
  [qrIbanSchema, 'CH44 3199 9123 0008 8901 2', 'CH4431999123000889012'],
  [ahvSchema, '7561234567897', '756.1234.5678.97'],
  [uidSchema, 'che109322551', 'CHE-109.322.551'],
  [phoneSchema, '0041 (0)79 123 45 67', '+41791234567'],
  [postalCodeSchema, '8001', '8001'],
  [qrrSchema, '21 00000 00003 13947 14300 09017', '210000000003139471430009017'],
  [scorSchema, 'rf18 5390 0754 7034', 'RF18539007547034'],
]

test('each Swiss string schema accepts unknown input, returns a canonical value and localizes failures', () => {
  for (const [factory, input, canonical] of examples) {
    const messages = new Set()
    for (const locale of [...swissLocales, 'en']) {
      const schema = factory(locale)['~standard']
      assert.equal(schema.version, 1)
      assert.equal(schema.vendor, 'alpina-ui')
      assert.deepEqual(schema.validate(input), { value: canonical })
      for (const invalid of [new Blob(['file']), {}, [], 42, undefined, null, '', 'invalid']) {
        assert.ok(schema.validate(invalid).issues[0].message.length > 0)
      }
      messages.add(schema.validate('invalid').issues[0].message)
    }
    assert.equal(messages.size, 5)
  }
  assert.ok(qrIbanSchema()['~standard'].validate(examples[0][1]).issues)
})

test('malformed identifiers and incorrect check digits have different localized corrections', () => {
  const checksumWording = {
    'en': /check digits? (?:does|do) not match.*original document/i,
    'de-CH': /Prüfziffern? stimm.*Originaldokument/,
    'fr-CH': /chiffres? de contrôle.*document original/,
    'it-CH': /cifr[ae] di controllo.*documento originale/,
    'rm-CH': /cifras? da controlla.*document original/,
  }
  for (const [field, factory, malformed, mistyped] of [
    ['ahv', ahvSchema, '756.1234.5678', '756.1234.5678.90'],
    ['iban', ibanSchema, 'DE9300762011623852957', 'CH00 0076 2011 6238 5295 7'],
    ['qrIban', qrIbanSchema, 'CH9300762011623852957', 'CH45 3199 9123 0008 8901 2'],
    ['uid', uidSchema, 'CHE-109.322.55A', 'CHE-109.322.552'],
    ['qrr', qrrSchema, '000000000000000000000000000', '21 00000 00003 13947 14300 09018'],
    ['scor', scorSchema, 'RFAB 5390 0754 7034', 'RF19 5390 0754 7034'],
  ]) {
    for (const locale of [...swissLocales, 'en']) {
      const validate = factory(locale)['~standard'].validate
      const checksum = validate(mistyped).issues[0].message
      assert.match(checksum, checksumWording[locale], field + ' ' + locale)
      assert.equal(checksum, swissValidationMessage(field, locale, 'checksum'))
      assert.equal(validate(malformed).issues[0].message, swissValidationMessage(field, locale))
      assert.notEqual(validate(malformed).issues[0].message, checksum)
      assert.equal(validate('').issues[0].message, swissValidationMessage('required', locale))
    }
  }
})

test('eCH schema accepts form exports, Swiss post boxes and foreign organisation addresses', () => {
  const check = echAddressSchema()['~standard'].validate
  const address = toEchMailAddress({ recipient: 'Caduff', street: 'Via Nova', postalCode: '7000', locality: 'Cuira', canton: 'GR' }, 'ech-person')
  const postbox = { person: { lastName: 'Caduff' }, addressInformation: { postOfficeBoxNumber: 18, postOfficeBoxText: 'Chascha postala', town: 'Cuira', swissZipCode: 7000, country: { countryNameShort: 'Svizra', countryIdISO2: 'CH' } } }
  const foreign = { organisation: { organisationName: 'Studio', title: 'Dr', lastName: 'Rossi' }, addressInformation: { town: 'Como', foreignZipCode: '22100', country: { countryNameShort: 'Italia' } }, validity: { dateFrom: '2028-02-29' } }
  for (const input of [address, postbox, foreign]) assert.deepEqual(check(input), { value: input })
  for (const locale of swissLocales) {
    const invalid = echAddressSchema(locale)['~standard'].validate({ person: {}, addressInformation: { town: 'x'.repeat(41), country: {}, swissZipCode: '8000', swissZipCodeId: 2**32, unrecognised: true } })
    assert.deepEqual(invalid.issues.map(i => i.path.join('.')).sort(), ['person.lastName', 'addressInformation.town', 'addressInformation.country.countryNameShort', 'addressInformation.swissZipCode', 'addressInformation.swissZipCodeId', 'addressInformation.unrecognised'].sort())
    assert.ok(invalid.issues.every(i => i.message))
  }
  for (const input of [null, [], { ...foreign, person: {} }, { ...foreign, validity: { dateFrom: '2027-02-29' } }, { ...postbox, addressInformation: { ...postbox.addressInformation, foreignZipCode: '22100' } }])
    assert.ok(check(input).issues)
})

test('eCH address strings and dates retain valid XML field values at serialization', () => {
  const check = echAddressSchema()['~standard'].validate
  const address = { person: { lastName: 'Caduff' }, addressInformation: { town: 'Cuira', swissZipCode: 7000,
    country: { countryId: 8100, countryNameShort: 'Schweiz' } } }
  for (const lastName of ['\vCaduff', 'Caduff\f', 'a'.repeat(30) + '\u00a0']) {
    assert.deepEqual(check({ ...address, person: { lastName } }).issues[0].path, ['person', 'lastName'])
  }
  const spaced = { ...address, person: { lastName: '\tCaduff\n' } }
  assert.deepEqual(check(spaced), { value: spaced })
  assert.deepEqual(check({ ...address, validity: { dateFrom: '0000-01-01' } }).issues[0].path, ['validity', 'dateFrom'])
  assert.deepEqual(check({ ...address, validity: { dateFrom: '2027-01-01', dateTo: '2026-12-31' } }).issues[0].path, ['validity', 'dateTo'])
  assert.ok(check({ ...address, addressInformation: { town: 'Cuira', country: address.addressInformation.country } }).issues)
  assert.ok(check({ ...address, addressInformation: { ...address.addressInformation, country: { countryId: 8100, countryIdISO2: 'IT', countryNameShort: 'Italia' } } }).issues)
  for (const suffix of ['00', '99', 'A', '', 'X2']) {
    const result = check({ ...address, addressInformation: { ...address.addressInformation, swissZipCodeAddOn: suffix } })
    assert.equal(!!result.value, suffix === '00' || suffix === '99')
  }
})
