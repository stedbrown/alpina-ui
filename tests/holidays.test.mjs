import assert from 'node:assert/strict'
import test from 'node:test'
import { addBusinessDays, cantons, swissHolidays } from 'alpina-ui'

const dates = (year, canton, options) => Object.fromEntries(swissHolidays(year, canton, options).map(h => [h.id, h.date]))

test('all 26 schedules identify the national holiday and compute Gregorian Easter and related dates', () => {
  for (const [year, easter, ascension] of [[2024, '03-31', '05-09'], [2025, '04-20', '05-29'], [2026, '04-05', '05-14'], [2027, '03-28', '05-06'], [2038, '04-25', '06-03'], [2100, '03-28', '05-06']]) {
    for (const { code } of cantons) {
      const holidays = swissHolidays(year, code)
      assert.deepEqual(holidays.filter(h => h.scope === 'federal').map(h => h.date), [year + '-08-01'])
      assert.equal(holidays.find(h => h.id === 'easter').date, year + '-' + easter)
      assert.equal(holidays.find(h => h.id === 'ascension').date, year + '-' + ascension)
      assert.deepEqual(holidays.map(h => h.date), holidays.map(h => h.date).sort())
      assert.equal(new Set(holidays.map(h => h.id)).size, holidays.length)
    }
  }
})

test('canton-wide schedules distinguish statutory rest days, local customs and movable exceptions', () => {
  assert.equal(dates(2026, 'VD').fastMonday, '2026-09-21')
  assert.equal(dates(2027, 'GE').genevaFast, '2027-09-09')
  assert.equal(dates(2026, 'GL').naefels, '2026-04-09') // The first Thursday falls in Holy Week.
  assert.equal(dates(2027, 'GL').naefels, '2027-04-01')
  assert.equal(dates(2026, 'OW').bruderKlaus, '2026-09-25')
  assert.equal(dates(2026, 'JU').jura, '2026-06-23')
  assert.equal(dates(2026, 'TI').peterPaul, '2026-06-29')
  assert.equal(dates(2026, 'ZH').berchtold, undefined)
  assert.equal(dates(2026, 'TI').goodFriday, undefined)
  assert.equal(dates(2026, 'NE').easterMonday, undefined)
  assert.equal(dates(2023, 'NE').berchtold, '2023-01-02')
  assert.equal(dates(2026, 'NE').berchtold, undefined)
  assert.equal(dates(2022, 'NE').stephen, '2022-12-26')
  for (const canton of ['AI', 'AR']) {
    assert.equal(dates(2026, canton).stephen, undefined)
    assert.equal(dates(2023, canton).stephen, undefined)
    assert.equal(dates(2025, canton).stephen, '2025-12-26')
  }
  assert.ok(!Object.values(dates(2026, 'ZH')).includes('2026-09-14')) // Knabenschiessen
  assert.deepEqual(swissHolidays(2008, 'ZH').filter(h => h.date === '2008-05-01').map(h => h.id).sort(), ['ascension', 'labour'])
})

test('local holiday profiles apply only within their canton and retain the chosen language', () => {
  assert.equal(dates(2026, 'AG').easterMonday, undefined)
  assert.equal(dates(2026, 'AG', { region: 'AG-aarau' }).easterMonday, '2026-04-06')
  assert.equal(dates(2026, 'AG', { region: 'AG-bremgarten' }).easterMonday, undefined)
  for (const [region, include, exclude] of [['FR-catholic', 'corpus', 'easterMonday'], ['FR-reformed', 'easterMonday', 'corpus']]) {
    assert.ok(dates(2026, 'FR', { region })[include])
    assert.equal(dates(2026, 'FR', { region })[exclude], undefined)
  }
  assert.equal(dates(2026, 'NE').corpus, undefined)
  assert.deepEqual(swissHolidays(2026, 'NE', { region: 'NE-le-landeron', locale: 'fr-CH' }).find(h => h.id === 'corpus'),
    { id: 'corpus', name: 'Fête-Dieu', date: '2026-06-04', scope: 'regional', duration: 'day' })
  assert.equal(dates(2026, 'AI', { region: 'AI-inner' }).maurice, '2026-09-22')
  assert.equal(dates(2026, 'OW', { region: 'OW-engelberg' }).benedict, '2026-03-21')
  assert.equal(swissHolidays(2026, 'GR', { locale: 'rm-CH' }).find(h => h.id === 'goodFriday').name, 'Venderdi sontg')
  assert.equal(swissHolidays(2026, 'SO').find(h => h.id === 'labour').duration, 'afternoon')
})

test('business days cross DST, weekends and years in either direction, respecting whole and partial closures', () => {
  assert.equal(addBusinessDays('2024-03-28', 1, 'ZH'), '2024-04-02')
  assert.equal(addBusinessDays('2024-04-02', -1, 'ZH'), '2024-03-28')
  assert.equal(addBusinessDays('2024-03-28', 1, 'TI'), '2024-03-29')
  assert.equal(addBusinessDays('2026-04-02', 1, 'AG', { region: 'AG-bremgarten' }), '2026-04-06')
  assert.equal(addBusinessDays('2026-04-02', 1, 'AG', { region: 'AG-aarau' }), '2026-04-07')
  assert.equal(addBusinessDays('2026-04-30', 1, 'SO'), '2026-05-01')
  assert.equal(addBusinessDays('2026-04-30', 1, 'ZH'), '2026-05-04')
  assert.equal(addBusinessDays('2026-12-30', 1, 'GE'), '2027-01-04')
  assert.equal(addBusinessDays('2027-01-04', -1, 'GE'), '2026-12-30')
  assert.equal(addBusinessDays('2026-08-01', 0, 'TI'), '2026-08-01')
  assert.equal(addBusinessDays('2027-07-30', 1, 'GE'), '2027-08-02') // No blanket substitute Monday.
  for (const fn of [() => swissHolidays(0, 'TI'), () => swissHolidays(2025.5, 'BE'), () => swissHolidays(2024, 'CH'),
    () => swissHolidays(2024, 'ZH', { region: 'AG-baden' }), () => addBusinessDays('2024-02-30', 0, 'TI'),
    () => addBusinessDays('2024-01-01', 0.5, 'TI'), () => addBusinessDays('0001-01-01', -1, 'TI'),
    () => addBusinessDays('9999-12-31', 1, 'TI')]) assert.throws(fn, RangeError)
})
