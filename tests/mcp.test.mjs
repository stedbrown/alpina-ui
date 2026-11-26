import assert from 'node:assert/strict'
import { names, topics } from '../cli/component-vocabulary.mjs'
import { searchComponents } from '../cli/search-components.mjs'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const cli = fileURLToPath(new URL('../cli/alpina.mjs', import.meta.url))
const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8')
const rpc = (id, method, params = {}) => ({ jsonrpc: '2.0', id, method, params })
const clientInfo = { name: 'catalog-test', version: '1' }
const hello = rpc(1, 'initialize', { protocolVersion: '2025-11-25', clientInfo, capabilities: {} })
const call = (id, name, args) => rpc(id, 'tools/call', { name, arguments: args })
function exchange(messages) {
  const run = spawnSync(process.execPath, [cli, 'mcp'], {
    input: messages.map((msg) => typeof msg === 'string' ? msg : JSON.stringify(msg)).join('\n') + '\n',
    encoding: 'utf8', timeout: 10000,
  })
  assert.equal(run.status, 0, run.stderr)
  return run.stdout.trim().split('\n').map((line) => JSON.parse(line))
}

test('stdio client can discover and read the installed registry, types, source and guides', () => {
  const replies = exchange([
    hello,
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    rpc(2, 'tools/list'), call(3, 'search_components', { query: 'DropdownMenu' }),
    call(4, 'get_component', { name: 'dropdown-menu' }),
    call(5, 'get_component', { name: 'dropdown-menu', file: 'interactive/action-list.tsx' }),
    call(6, 'get_guide', {}), call(7, 'get_guide', { slug: 'build' }),
    call(8, 'search_components', {}),
    call(9, 'get_guide', { slug: 'migration' }),
  ])
  assert.deepEqual(replies.map((r) => r.id), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  const result = replies.map((r) => r.result)
  assert.equal(result[0].protocolVersion, hello.params.protocolVersion)
  assert.equal(result[0].serverInfo.version, JSON.parse(read('registry.json')).version)
  assert.deepEqual(result[1].tools.map((tool) => tool.name), ['search_components', 'get_component', 'get_guide', 'check_design'])
  assert.match(result[2].content[0].text, /^dropdown-menu \(interactive\) — .+/)
  assert.ok(result[3].content[0].text.includes(read('dist/interactive/dropdown-menu.d.ts').trim()))
  assert.ok(result[3].content[0].text.includes(JSON.parse(read('registry.json')).items.find(entry => entry.name === 'dropdown-menu').usage))
  assert.equal(result[4].content[0].text, read('src/interactive/action-list.tsx'))
  const expectedGuides = JSON.parse(read('cli/public-guides.json')).filter(entry => entry.mcp !== false).map(entry => entry.id)
  assert.deepEqual(result[5].content[0].text.split('\n'), expectedGuides)
  assert.ok(expectedGuides.includes('agents'))
  for (const name of ['readme.template', 'npm-release', 'package-quality', '1.0-checklist', 'visual-testing', 'portal', 'beta-review'])
    assert.ok(!expectedGuides.includes(name), name)
  assert.equal(result[6].content[0].text, read('docs/build.md'))
  assert.equal(result[7].content[0].text.split('\n').length, JSON.parse(read('registry.json')).items.length)
  assert.ok(result[5].content[0].text.split('\n').includes('migration'))
  assert.equal(result[8].content[0].text, read('docs/migration.md'))
})

test('modern stdio discovery and tool calls work without a handshake', () => {
  const versionKey = 'io.modelcontextprotocol/protocolVersion'
  const _meta = {
    [versionKey]: '2026-07-28', 'io.modelcontextprotocol/clientInfo': clientInfo,
    'io.modelcontextprotocol/clientCapabilities': {},
  }
  const [discovery, list, lookup, wrongVersion] = exchange([
    rpc(1, 'server/discover', { _meta }), rpc(2, 'tools/list', { _meta }),
    rpc(3, 'tools/call', { _meta, name: 'get_guide', arguments: { slug: 'start' } }),
    rpc(4, 'server/discover', { _meta: { ..._meta, [versionKey]: 'future' } }),
  ])
  assert.ok(discovery.result.supportedVersions.includes(_meta[versionKey]))
  assert.equal(discovery.result._meta['io.modelcontextprotocol/serverInfo'].name, 'alpina-ui')
  assert.equal(list.result.resultType, 'complete')
  assert.ok(list.result.tools.every((tool) => tool.annotations.readOnlyHint))
  assert.equal(lookup.result.content[0].text, read('docs/start.md'))
  assert.equal(wrongVersion.error.code, -32022)
})

test('invalid requests and unregistered files do not prevent subsequent lookups', () => {
  const [malformed, , unknown, file, guide, args, after] = exchange([
    'this is not JSON', hello, call('tool', 'write_file', {}),
    call('file', 'get_component', { name: 'button', file: '../package.json' }),
    call('guide', 'get_guide', { slug: '../package.json' }),
    call('args', 'get_component', { name: 'button', extra: true }), rpc('after', 'ping'),
  ])
  assert.deepEqual([malformed.id, malformed.error.code], [null, -32700])
  assert.equal(unknown.error.code, -32602)
  for (const response of [file, guide, args]) assert.equal(response.result.isError, true)
  assert.deepEqual(after, { jsonrpc: '2.0', id: 'after', result: {} })
})

for (const [queries, expected] of [
  [['date'], ['date-picker', 'calendar', 'swiss-date']],
  [['invoice', 'fattura', 'Rechnung', 'facture', 'fattur'], ['invoice-document', 'swiss-qr-bill', 'letter']],
  [['address', 'indirizzo', 'Adresse', 'adresse'], ['swiss-address-form', 'swiss-postal-code-input']],
  [['holidays', 'festivi', 'Feiertage', 'jours fériés', 'jours feri'], ['calendar', 'date-picker']],
]) {
  for (const query of queries) test('MCP ranks and describes components for ' + query, () => {
    const [, reply] = exchange([hello, call(2, 'search_components', { query })])
    const lines = reply.result.content[0].text.split('\n')
    assert.deepEqual(lines.slice(0, expected.length).map(line => line.split(' ')[0]), expected)
    for (const line of lines) assert.match(line, /^[a-z-]+ \([a-z]+\) — \S.+/)
  })
}

test('every registered component is discoverable by its name in each supported search language', () => {
  const { items } = JSON.parse(read('registry.json'))
  assert.deepEqual(Object.keys(names).sort(), items.map(item => item.name).sort())
  for (const [id, translations] of Object.entries(names)) {
    assert.equal(translations.length, 5, id)
    for (const query of translations) {
      assert.ok(query.trim(), id)
      const results = searchComponents(items, query).slice(0, 3)
      assert.ok(results.some(item => item.name === id), id + ': ' + query)
    }
  }
})

test('the stdio search ranks three phrases per language for every component task', () => {
  for (const { items, aliases } of topics) {
    assert.equal(aliases.length, 5)
    for (const phrases of aliases) assert.ok(new Set(phrases.split('|')).size >= 3)
    const queries = aliases.flatMap(phrases => phrases.split('|'))
    const [, ...responses] = exchange([hello, ...queries.map((query, i) => call(i + 2, 'search_components', { query }))])
    assert.equal(responses.length, queries.length)
    for (const [i, reply] of responses.entries()) {
      const matches = reply.result.content[0].text.split('\n').map(line => line.split(' ')[0])
      assert.equal(matches[0], items[0], queries[i])
      for (const related of items) assert.ok(matches.includes(related), queries[i] + ': ' + related)
    }
  }
})

test('agents can find three distinct controls in each registry group in all five languages', () => {
  const groups = [
    [['input', 'checkbox', 'slider'], [
      ['text input', 'check box', 'range slider'], ['Eingabefeld', 'Kontrollkästchen', 'Schieberegler'],
      ['champ de saisie', 'case à cocher', 'curseur'], ['campo di testo', 'casella di controllo', 'cursore'],
      ['champ da text', 'chascha da controlla', 'regulatur']]],
    [['dialog', 'drawer', 'tabs'], [
      ['modal window', 'sliding drawer', 'tab panels'], ['Dialogfenster', 'Schublade', 'Registerkarten'],
      ['fenêtre modale', 'tiroir', 'onglets'], ['finestra', 'cassetto', 'schede'],
      ['fanestra modala', 'chaschut', 'registers']]],
    [['ahv-input', 'swiss-postal-code-input', 'letter'], [
      ['social insurance number', 'postal code', 'postal letter'], ['AHV Nummer', 'Postleitzahl', 'Brief'],
      ['numéro AVS', 'numéro postal', 'lettre'], ['numero AVS', 'numero postale', 'lettera'],
      ['numer da l’AVS', 'numer postal', 'brev']]],
    [['sidebar', 'code-block', 'text-link'], [
      ['sidebar', 'source code', 'text link'], ['Seitenleiste', 'Quelltext', 'Textlink'],
      ['barre latérale', 'code source', 'lien texte'], ['barra laterale', 'codice sorgente', 'collegamento testuale'],
      ['trav laterala', 'code da funtauna', 'colliaziun da text']]],
  ]
  for (const [ids, languages] of groups) {
    const queries = languages.flat()
    const [, ...replies] = exchange([hello, ...queries.map((query, i) => call(i + 2, 'search_components', { query }))])
    queries.forEach((query, i) => assert.equal(replies[i].result.content[0].text.split(' ')[0], ids[i % ids.length], query))
  }
})

test('MCP handles misspellings, transpositions, abbreviations, diacritics and unrelated queries', () => {
  const cases = [
    ['tabella contabile', 'data-table'], ['dropdwon', 'dropdown-menu'], ['droppdwn', 'dropdown-menu'],
    ['modale', 'dialog'], ['grafico', 'chart'], ['Diagram', 'chart'], ['boite de dialgoue', 'dialog'],
    ['Buchhaltugstabele', 'data-table'], ['contabiltad', 'data-table'], ['menu a tndina', 'dropdown-menu'],
    ['Balkendia', 'bar-chart'], ['rfzqx', 'No'],
  ]
  const [, ...replies] = exchange([hello, ...cases.map(([query], i) => call(i + 2, 'search_components', { query }))])
  cases.forEach(([query, expected], i) => assert.equal(replies[i].result.content[0].text.split(' ')[0], expected, query))
})

test('stdio finds dialogs and Swiss postcode fields in everyday phrases', () => {
  const cases = [
    ['dialog', ['finestra di dialogo', 'aprire una finestra di dialogo', 'open a dialog box',
      'ein Dialogfenster öffnen', 'ouvrir une boîte de dialogue', 'avrir ina fanestra da dialog']],
    ['swiss-postal-code-input', ['codice postale', 'numero postale di avviamento', 'ricerca per codice postale',
      'search by postal code', 'nach PLZ suchen', 'recherche par code postal', 'tschertgar tenor numer postal']],
  ]
  for (const [id, queries] of cases) {
    const [, ...responses] = exchange([hello, ...queries.map((query, i) => call(i + 2, 'search_components', { query }))])
    for (const [i, { result }] of responses.entries()) {
      const ids = result.content[0].text.split('\n').map(line => line.split(' ')[0])
      assert.equal(ids[0], id, queries[i])
      if (id === 'swiss-postal-code-input') assert.ok(ids.includes('swiss-address-form'), queries[i])
    }
  }
})

test('get_guide selects only published translations', () => {
  const [, french, unavailable] = exchange([hello, call(2, 'get_guide', { slug: 'swiss', language: 'fr' }),
    call(3, 'get_guide', { slug: 'release', language: 'fr' })])
  assert.equal(french.result.content[0].text, read('docs/fr/swiss.md'))
  assert.equal(unavailable.result.isError, true)
})
