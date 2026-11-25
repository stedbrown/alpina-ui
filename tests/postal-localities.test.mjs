import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { lookupSwissPostalCode } from 'alpina-ui'

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
  const rows = data.trim().split('\n')
  assert.equal(rows.length, 4233)
  assert.equal(new Set(rows).size, rows.length)
  assert.equal(new Set(rows.map(line => line.slice(0, 4))).size, 3177)
  assert.equal(new Set(rows.map(line => line.slice(4, 6))).size, 26)
  assert.ok(rows.every(line => /^[1-9]\d{3}[A-Z]{2}.+$/u.test(line)))
  const entry = await readFile(new URL('dist/index.js', project), 'utf8')
  assert.doesNotMatch(entry, /postal-localities\.data/)
})
