import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Letter, addressLines } from 'alpina-ui'

test('Letter and addressLines share QR and eCH recipients without retyping or losing postal details', () => {
  const supplier = { name: 'Atelier', street: 'Via Selva', buildingNumber: '4', town: 'Lugano', postalCode: '6900', country: 'CH' }
  const client = { organisation: { organisationName: 'Werk GmbH', organisationNameAddOn1: 'Office', firstName: 'Pia', lastName: 'Meier' },
    addressInformation: { addressLine1: 'c/o Poststelle', street: 'Bergweg', houseNumber: '4a', dwellingNumber: '8',
      postOfficeBoxText: 'Postfach', postOfficeBoxNumber: 0, town: 'Bern', swissZipCode: 3000, country: { countryNameShort: 'Schweiz', countryIdISO2: 'CH' } } }
  assert.deepEqual(addressLines(supplier), ['Atelier', 'Via Selva 4', '6900 Lugano'])
  const lines = ['Werk GmbH', 'Office', 'Pia Meier', 'c/o Poststelle', 'Bergweg 4a/8', 'Postfach 0', '3000 Bern']
  assert.deepEqual(addressLines(client, 'de-CH'), lines)
  assert.equal(addressLines({ ...supplier, country: 'DE' }, 'it-CH').at(-1), 'GERMANIA')
  assert.deepEqual(addressLines({ person: { firstName: 'Iris', lastName: 'Meyer' }, addressInformation: {
    foreignZipCode: '75001', town: 'Paris', country: { countryNameShort: 'France' },
  } }), ['Iris Meyer', '75001 Paris', 'FRANCE'])
  const markup = renderToStaticMarkup(createElement(Letter, { sender: supplier, recipient: client, date: '2026-11-25', subject: 'Account statement' }))
  assert.ok(markup.includes(lines.map(text => '<div>' + text + '</div>').join('')))
})
