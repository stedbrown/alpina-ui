import assert from 'node:assert/strict'
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
    call(6, 'get_guide', {}), call(7, 'get_guide', { slug: 'directory' }),
    call(8, 'search_components', {}),
  ])
  assert.deepEqual(replies.map((r) => r.id), [1, 2, 3, 4, 5, 6, 7, 8])
  const result = replies.map((r) => r.result)
  assert.equal(result[0].protocolVersion, hello.params.protocolVersion)
  assert.equal(result[0].serverInfo.version, JSON.parse(read('registry.json')).version)
  assert.deepEqual(result[1].tools.map((tool) => tool.name), ['search_components', 'get_component', 'get_guide'])
  assert.equal(result[2].content[0].text, 'dropdown-menu (interactive)')
  assert.ok(result[3].content[0].text.includes(read('dist/interactive/dropdown-menu.d.ts').trim()))
  assert.ok(result[3].content[0].text.includes(JSON.parse(read('registry.json')).items.find(entry => entry.name === 'dropdown-menu').usage))
  assert.equal(result[4].content[0].text, read('src/interactive/action-list.tsx'))
  assert.ok(result[5].content[0].text.split('\n').includes('agents'))
  assert.equal(result[6].content[0].text, read('docs/directory.md'))
  assert.equal(result[7].content[0].text.split('\n').length, JSON.parse(read('registry.json')).items.length)
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
