import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup as render } from 'react-dom/server'
import { AlpinaProvider, CurrencyCHF, FileInput, SwissDate, SwissAddressFields, SwissQrBill } from 'alpina-ui'

const wrap = (locale, ...children) => h(AlpinaProvider, { locale }, ...children)
test('the nearest AlpinaProvider supplies message and formatting locales during server rendering', () => {
  const html = render(wrap('fr-CH',
    h(FileInput, { multiple: true }), h(SwissDate, { value: '2026-03-19', dateStyle: 'long' }),
    wrap('it-CH', h(FileInput, { multiple: true }), h(SwissAddressFields), h(CurrencyCHF, { amount: -1 })),
    h(FileInput, { locale: 'de-CH', multiple: true })))
  for (const phrase of ['Ajouter des fichiers', '19 mars 2026', 'Aggiungi file', 'Destinatario', 'meno', 'Dateien hinzufügen']) {
    assert.ok(html.includes(phrase), phrase)
  }
  assert.match(render(h(FileInput, { multiple: true })), /Add files/)
  assert.match(render(wrap('en', h(SwissDate, { value: '2026-03-19' }))), /lang="it-CH"/)
})

test('payment slip headings inherit the provider and accept a local override', () => {
  const bill = { iban: 'CH5800791123000889012', currency: 'CHF', creditor: {
    name: 'Example SA', street: 'Via Esempio', buildingNumber: '1', postalCode: '6900', town: 'Lugano', country: 'CH',
  } }
  assert.match(render(wrap('fr-CH', h(SwissQrBill, { bill }))), /Récépissé/)
  assert.match(render(wrap('fr-CH', h(SwissQrBill, { bill, locale: 'de-CH' }))), /Empfangsschein/)
})
