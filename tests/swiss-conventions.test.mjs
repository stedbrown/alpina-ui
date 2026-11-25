import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import { formatCHF, formatSwissDate, formatSwissTime, isoWeek } from 'alpina-ui'

test('Swiss numeric text keeps exact grouping, date order and the 24-hour clock', () => {
  for (const [locale, group] of [['it-CH', '’'], ['de-CH', '’'], ['fr-CH', '\u202f']]) {
    assert.ok(formatCHF(1234567.8, locale).includes('1' + group + '234' + group + '567'))
    assert.equal(formatSwissDate('0001-04-02', locale), '02.04.0001')
  }
  assert.equal(formatSwissTime(new Date('2026-12-31T23:00Z')), '00:00')
  assert.equal(formatSwissTime(new Date('2026-03-29T01:00Z')), '03:00')
})

test('cash totals round once to five centimes with decimal ties away from zero', () => {
  for (const [input, expected] of [[1.0249, 1], [1.025, 1.05], [1.075, 1.1], [1.9749, 1.95],
    [1.975, 2], [-1.025, -1.05], [-0.001, -0], [1e-8, 0], [1e21, 10n ** 21n]]) {
    assert.equal(formatCHF(input, 'de-CH', { cashRounding: true }), formatCHF(expected, 'de-CH'))
  }
  assert.ok(formatCHF(1.025, 'de-CH').includes('1.03'))
  const large = 9007199254740993123n
  assert.equal(formatCHF(large, 'it-CH', { cashRounding: true }), formatCHF(large, 'it-CH'))
})

test('ISO week years cross December and January correctly', () => {
  for (const [day, year, week] of [['0001-01-01', 1, 1], ['2018-12-31', 2019, 1], ['2021-01-01', 2020, 53],
    ['2021-01-04', 2021, 1], ['2026-12-31', 2026, 53], ['9999-12-31', 9999, 52]]) {
    assert.deepEqual(isoWeek(day), { year, week })
  }
})

test('published Swiss copy uses Swiss German spelling throughout', async () => {
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) await inspect(path)
      else if (/\.(?:md|tsx?|json)$/.test(entry.name)) {
        assert.doesNotMatch(await readFile(path, 'utf8'), /[\u00df\u1e9e]/u, path)
      }
    }
  }
  for (const root of ['catalog', 'web', 'src', 'blocks', 'docs', 'recipes/rubrica/src']) await inspect(root)
})
