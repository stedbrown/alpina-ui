import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const json = async name => JSON.parse(await readFile(new URL('../' + name, import.meta.url), 'utf8'))
const entries = await json('docs/component-guidance.json')
const { items } = await json('registry.json')
const locales = ['de-CH', 'fr-CH', 'it-CH', 'rm-CH']

test('each registry component has an individually written reference and four localised specimens', () => {
  for (const { name } of items) assert.ok(entries[name], name + ' has no editorial reference')
  for (const field of ['use', 'avoid', 'access', 'content']) {
    const sections = Object.values(entries).map(entry => entry[field])
    assert.equal(new Set(sections).size, sections.length, 'Repeated ' + field + ' guidance')
  }
  for (const [slug, { use, avoid, access, content, example, copy }] of Object.entries(entries)) {
    for (const paragraph of [use, avoid, access, content]) {
      assert.ok(paragraph.trim().split(/\s+/u).length >= 7, slug + ': incomplete explanation')
    }
    assert.ok(example.good && example.poor && example.good !== example.poor, slug + ': editorial comparison')
    assert.deepEqual(Object.keys(copy).sort(), [...locales].sort(), slug + ': supported languages')
    for (const label of Object.values(copy)) assert.ok(label.trim(), slug + ': missing translated specimen')
  }
})
