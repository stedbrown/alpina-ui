import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { cantons } from '../dist/swiss/cantons.js'
import { CurrencyCHF } from '../dist/swiss/currency-chf.js'
import { formatCHF } from '../dist/swiss/format-chf.js'
import { formatSwissDate } from '../dist/swiss/format-swiss-date.js'
import { localeNames, swissLocales, swissLocalePreferences } from '../dist/swiss/locales.js'
import { isSwissPostalCode } from '../dist/swiss/postal-code.js'
import { SwissDate } from '../dist/swiss/swiss-date.js'

test('all 26 cantons have unique codes and four language labels', () => {
  assert.equal(cantons.length, 26)
  assert.equal(new Set(cantons.map(({ code }) => code)).size, 26)
  for (const canton of cantons) {
    assert.match(canton.code, /^[A-Z]{2}$/)
    for (const locale of swissLocales) assert.ok(canton.names[locale]?.length)
  }
  assert.equal(cantons.find(({ code }) => code === 'GR').names['rm-CH'], 'Grischun')
  assert.equal(cantons.find(({ code }) => code === 'AR').names['it-CH'], 'Appenzello Esterno')
  assert.equal(cantons.find(({ code }) => code === 'AI').names['fr-CH'], 'Appenzell Rhodes-Intérieures')
})

test('every requested locale has an endonym and Swiss alternatives', () => {
  for (const locale of swissLocales) {
    const preferences = swissLocalePreferences(locale)
    assert.ok(localeNames[locale]?.length)
    assert.equal(preferences[0], locale)
    assert.deepEqual(new Set(preferences), new Set(swissLocales))
  }
})

test("CHF uses the runtime's Swiss locale, two decimals and exact BigInt inputs", () => {
  for (const locale of swissLocales) {
    if (locale === 'rm-CH' && !Intl.NumberFormat.supportedLocalesOf(locale).length) {
      assert.equal(formatCHF(-1234.56, locale), 'CHF\u00a0−1\u202f234,56')
      continue
    }
    const reference = new Intl.NumberFormat(swissLocalePreferences(locale), {
      style: 'currency',
      currency: 'CHF',
      currencyDisplay: 'code',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    for (const amount of [0, 22.999, 9007199254740993123n]) {
      const group = ['fr-CH', 'rm-CH'].includes(locale) ? '\u202f' : '’'
      assert.equal(formatCHF(amount, locale), reference.formatToParts(amount).map(part => part.type === 'group' ? group : part.value).join(''))
    }
  }
  for (const [locale, expected] of Object.entries({
    'de-CH': 'CHF\u00a0−1.05', 'it-CH': 'CHF\u00a0−1.05',
    'rm-CH': 'CHF\u00a0−1,05', 'fr-CH': '−1.05\u00a0CHF',
  })) assert.equal(formatCHF(-1.05, locale), expected)
  const spoken = renderToStaticMarkup(createElement(CurrencyCHF, { amount: -1.05, locale: 'it-CH' }))
  assert.match(spoken, /CHF\u00a0meno 1.05/)
  assert.match(spoken, /aria-hidden="true">CHF\u00a0−1.05/)
  assert.equal(formatCHF(1), formatCHF(1, 'it-CH'))
  for (const amount of [NaN, Infinity, -Infinity]) assert.throws(() => formatCHF(amount), RangeError)
})

test("valid civil dates keep their day regardless of the caller's time zone", () => {
  for (const value of ['0001-01-01', '0099-12-31', '2000-02-29', '2026-03-29', '2026-10-25']) {
    const utc = formatSwissDate(value, 'fr-CH', { timeZone: 'UTC' })
    assert.equal(formatSwissDate(value, 'fr-CH', { timeZone: 'Pacific/Honolulu' }), utc)
    assert.equal(formatSwissDate(value, 'fr-CH', { timeZone: 'Pacific/Kiritimati' }), utc)
  }
})

test('instants use Zurich time by default, including summer and winter transitions', () => {
  for (const [instant, localDay] of [
    ['2026-03-29T22:30:00Z', '2026-03-30'],
    ['2026-10-25T23:30:00Z', '2026-10-26'],
  ]) {
    for (const locale of swissLocales) {
      assert.equal(formatSwissDate(new Date(instant), locale), formatSwissDate(localDay, locale))
      assert.equal(
        formatSwissDate(new Date(instant), locale, { timeZone: 'UTC' }),
        formatSwissDate(instant.slice(0, 10), locale),
      )
    }
  }
})

test('impossible, ambiguous and invalid inputs raise a RangeError', () => {
  for (const value of [
    '0000-01-01',
    '2025-02-29',
    '1900-02-29',
    '2026-02-30',
    '2026-08-32',
    '2026-13-01',
    '2026-1-02',
    '2026-11-24T12:30:00',
    new Date(NaN),
  ])
    assert.throws(() => formatSwissDate(value), RangeError)
  assert.throws(() => formatSwissDate(new Date(), 'de-CH', { timeZone: 'Europe/Ticino' }), RangeError)
})

test('the postal-code shape covers exactly four ASCII digits', () => {
  for (const value of ['6900', '8000', '0123']) assert.ok(isSwissPostalCode(value))
  for (const value of ['800', '80001', 'CH-8000', ' 8000', '8e04', '8000\n', '８０００']) {
    assert.equal(isSwissPostalCode(value), false)
  }
})

test('currency and date components expose machine-readable values during server rendering', () => {
  assert.match(
    renderToStaticMarkup(createElement(CurrencyCHF, { amount: -12.5 })),
    /<data lang="it-CH" value="-12.5" class="al-swiss-figures">/,
  )
  const civil = renderToStaticMarkup(createElement(SwissDate, { value: '2024-02-29' }))
  assert.match(civil, /<time lang="it-CH" dateTime="2024-02-29" class="al-swiss-figures">/i)
  const instant = new Date('2024-02-29T23:45:00Z')
  const html = renderToStaticMarkup(createElement(SwissDate, { value: instant, locale: 'rm-CH' }))
  assert.ok(html.includes(instant.toISOString()))
})

test('Romansh CHF and dates render in Romansh on a runtime without Romansh data', async (t) => {
  t.mock.method(Intl.NumberFormat, 'supportedLocalesOf', () => [])
  t.mock.method(Intl.DateTimeFormat, 'supportedLocalesOf', () => [])
  // Fresh module-level caches are required to simulate a newly started browser.
  const { formatCHF: francs } = await import('../dist/swiss/format-chf.js?missing-rm')
  const { formatSwissDate: date } = await import('../dist/swiss/format-swiss-date.js?missing-rm')
  assert.equal(francs(1234.555, 'rm-CH'), 'CHF\u00a01\u202f234,56')
  assert.equal(francs(-0, 'rm-CH'), 'CHF\u00a0−0,00')
  assert.equal(
    francs(-9007199254740993123n, 'rm-CH'),
    'CHF\u00a0−9\u202f007\u202f199\u202f254\u202f740\u202f993\u202f123,00',
  )
  const samples = [
    ['short', '05.04.2026'],
    ['medium', '05-04-2026'],
    ['long', '5 d’avrigl 2026'],
    ['full', 'dumengia, ils 5 d’avrigl 2026'],
  ]
  for (const [dateStyle, expected] of samples) {
    assert.equal(date('2026-04-05', 'rm-CH', { dateStyle }), expected)
  }
  assert.equal(date('0001-01-01', 'rm-CH', { dateStyle: 'short' }), '01.01.0001')
  assert.equal(
    date(new Date('2026-03-29T22:30:00Z'), 'rm-CH', { dateStyle: 'full' }),
    'glindesdi, ils 30 da mars 2026',
  )
  assert.equal(
    date(new Date('2026-10-25T23:30:00Z'), 'rm-CH', { dateStyle: 'full' }),
    'glindesdi, ils 26 d’october 2026',
  )
  const utcNewYear = new Date('2027-01-01T00:30:00Z')
  assert.equal(
    date(utcNewYear, 'rm-CH', { dateStyle: 'full', timeZone: 'America/New_York' }),
    'gievgia, ils 31 da december 2026',
  )
  const beforeNewYear = new Date('2026-12-31T23:30:00Z')
  assert.equal(date(beforeNewYear, 'rm-CH', { dateStyle: 'full' }), 'venderdi, ils 1 da schaner 2027')
})
