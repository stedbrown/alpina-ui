import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { lookupSwissPostalCode, searchSwissLocalities } from 'alpina-ui'

test('residential postcodes preserve official names, distinct localities and cross-canton pairs', async () => {
  assert.deepEqual(await lookupSwissPostalCode('6900'), ['Lugano', 'Massagno', 'Paradiso'].map(locality => ({ locality, canton: 'TI' })))
  assert.deepEqual(await lookupSwissPostalCode('1085'), ['FR', 'VD'].map(canton => ({ locality: 'Vulliens', canton })))
  assert.deepEqual(await lookupSwissPostalCode('9402'), [{ locality: 'Mörschwil', canton: 'SG' }])
  for (const value of ['', '690', '69000', 'CH-6900', '3001', '9485']) assert.deepEqual(await lookupSwissPostalCode(value), [])
  const first = await lookupSwissPostalCode('6900')
  first[0].locality = ''
  assert.equal((await lookupSwissPostalCode('6900'))[0].locality, 'Lugano')
})

test('the pinned swisstopo download and generated rows cover the complete Swiss snapshot', async () => {
  const project = new URL('../', import.meta.url)
  const archive = await readFile(new URL('scripts/data/swisstopo-postcodes-2026-11-01.zip', project))
  assert.equal(createHash('sha256').update(archive).digest('hex'), 'f7a99833d11e773916a57baebe7374040f4fbde0c8821250c77fa7197a176978')
  const { default: data } = await import('../dist/swiss/postal-localities.data.js')
  const lines = data.trim().split('\n')
  const rows = lines.filter(line => !line.startsWith('='))
  const municipalities = lines.filter(line => line.startsWith('='))
  assert.equal(rows.length, 5697)
  assert.equal(municipalities.length, 2112)
  assert.equal(new Set(lines).size, lines.length)
  assert.equal(new Set(rows.map(line => line.slice(0, 4))).size, 3177)
  assert.equal(new Set(rows.map(line => line.slice(4, 6))).size, 26)
  // Localities per postcode and canton, as in the directory before municipalities were added.
  assert.equal(new Set(rows.map(line => line.slice(0, line.indexOf('\t')))).size, 4233)
  assert.ok(rows.every(line => /^[1-9]\d{3}[A-Z]{2}[^\t]+\t[1-9]\d{0,3}$/u.test(line)))
  assert.ok(municipalities.every(line => /^=[1-9]\d{0,3}\t.+$/u.test(line)))
  const numbers = new Set(municipalities.map(line => line.slice(1, line.indexOf('\t'))))
  assert.ok(rows.every(line => numbers.has(line.slice(line.indexOf('\t') + 1))))
  const entry = await readFile(new URL('dist/index.js', project), 'utf8')
  assert.doesNotMatch(entry, /postal-localities\.data/)
})

test('locality search covers postcodes, names, municipalities and spelling variants', async () => {
  const describe = async (query, options) =>
    (await searchSwissLocalities(query, options)).map(item => [item.postalCode, item.locality, item.municipality, item.bfsNumber, item.canton].join(' '))
  assert.deepEqual(await describe('6900'), [
    '6900 Lugano Lugano 5192 TI', '6900 Massagno Massagno 5196 TI', '6900 Paradiso Paradiso 5210 TI', '6900 Paradiso Lugano 5192 TI'])
  // A locality inside a larger municipality returns that municipality.
  assert.deepEqual(await describe('viganello'), ['6962 Viganello Lugano 5192 TI'])
  assert.deepEqual(await describe('6900 par'), ['6900 Paradiso Paradiso 5210 TI', '6900 Paradiso Lugano 5192 TI'])
  // Accents, umlaut spellings, case, bilingual names and abbreviated saints.
  for (const [query, expected] of [['Zuerich', 'Zürich'], ['ZÜRICH', 'Zürich'], ['geneve', 'Genève'], ['bienne', 'Biel/Bienne'],
    ['sankt gallen', 'St. Gallen'], ['lug', 'Lugano'], ['win', 'Winterthur']]) {
    assert.equal((await searchSwissLocalities(query))[0]?.locality, expected, query)
  }
  // An exact name comes first, and a canton code narrows the results.
  assert.equal((await searchSwissLocalities('Bern'))[0].locality, 'Bern')
  assert.deepEqual([...new Set((await searchSwissLocalities('lugano ti', { limit: 20 })).map(item => item.canton))], ['TI'])
  assert.ok((await searchSwissLocalities('lu', { canton: 'LU', limit: 20 })).every(item => item.canton === 'LU'))
  assert.equal((await searchSwissLocalities('zurich', { limit: 3 })).length, 3)
  for (const query of ['', '   ', '12345', 'qqqq', '-']) assert.deepEqual(await searchSwissLocalities(query), [], query)
  assert.deepEqual(await searchSwissLocalities('lugano', { limit: 0 }), [])
})
