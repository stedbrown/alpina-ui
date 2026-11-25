import { searchComponents } from './search-components.mjs'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline'

const modernVersion = '2026-07-28'
const handshakeVersions = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']
const capabilities = { tools: {} }
const cache = { ttlMs: 60000, cacheScope: 'private' }
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
const string = (description) => ({ type: 'string', description })

function tool(name, description, properties, required = []) {
  return {
    name, description, annotations: readOnly,
    inputSchema: { type: 'object', properties, required, additionalProperties: false },
  }
}

const tools = [
  tool('search_components', 'Find components by name, group or task in English, German, French, Italian and Romansh. Partial names and common misspellings work. Omit query to list the entire registry.', {
    query: string('A name, group or task such as DropdownMenu, facture, Adresse, or jours fériés.'),
  }),
  tool('get_component', 'Read an installed component’s usage notes, public TypeScript declaration, import path and list of source files. Request one listed file to read its source.', {
    name: string('Exact registry identifier, for example dropdown-menu.'),
    file: string('Optional source path exactly as listed by this component.'),
  }, ['name']),
  tool('get_guide', 'Read an installed published Markdown guide. Omit slug to list available guides.', {
    slug: string('Guide identifier returned by this tool, for example swiss or design.'),
    language: string('Optional guide language. Start and Swiss are available in en, it, de and fr.'),
  }),
]

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const resultText = (text, isError = false) => ({ content: [{ type: 'text', text }], isError })

function validateArguments(schema, args) {
  if (!object(args)) return 'Use a JSON object for tool arguments.'
  for (const key of schema.required)
    if (!Object.hasOwn(args, key)) return 'Missing argument: ' + key
  for (const [key, value] of Object.entries(args)) {
    if (!Object.hasOwn(schema.properties, key)) return 'Unknown argument: ' + key
    if (typeof value !== 'string') return 'Expected a string for ' + key
  }
}

async function callTool(root, registry, guides, name, args) {
  const read = (directory, relative) => readFile(path.join(root, directory, relative), 'utf8')
  if (name === 'search_components') {
    const matches = searchComponents(registry.items, args.query)
    return resultText(matches.length
      ? matches.map((entry) => entry.name + ' (' + entry.group + ') — ' + entry.summary).join('\n')
      : 'No matching components.')
  }
  if (name === 'get_guide') {
    if (args.slug === undefined) return resultText([...guides.keys()].join('\n'))
    const guide = guides.get(args.slug)
    if (!guide) return resultText('Unknown guide. Call get_guide without a slug to list guides.', true)
    const language = args.language ?? 'en'
    if (language !== 'en' && !guide.languages?.includes(language)) return resultText('This guide is available in ' + ['en', ...(guide.languages ?? [])].join(', ') + '.', true)
    return resultText(await read('docs', language === 'en' ? guide.file : language + '/' + guide.file))
  }
  const entry = registry.items.find((item) => item.name === args.name)
  if (!entry) return resultText('Unknown component. Use search_components to find its identifier.', true)
  if (args.file !== undefined) {
    if (!entry.files.includes(args.file)) return resultText('Choose a file listed for ' + entry.name + '.', true)
    return resultText(await read('src', args.file))
  }
  const declaration = entry.entry.replace(/\.tsx?$/, '.d.ts')
  const signature = await read('dist', declaration)
  return resultText([
    'Alpina UI ' + registry.version + ' · ' + entry.name,
    'Import path: alpina-ui/' + entry.group + '/' + entry.name,
    'Documentation: ' + new URL('docs/components/' + entry.name + '/', registry.homepage).href,
    '', 'Usage notes', entry.usage, '', 'Public declaration', signature.trim(), '', 'Source files', ...entry.files,
  ].join('\n'))
}

export async function serveCatalog(root, registry) {
  const published = JSON.parse(await readFile(path.join(root, 'cli/public-guides.json'), 'utf8'))
  const guides = new Map(published.filter(guide => guide.mcp !== false).map(guide => [guide.id, guide]))
  const serverInfo = { name: 'alpina-ui', version: registry.version, websiteUrl: registry.homepage }
  const versions = [modernVersion, ...handshakeVersions]
  let initialized = false

  async function dispatch(msg) {
    const id = msg?.id
    const validId = typeof id === 'string' || Number.isSafeInteger(id)
    const fail = (code, message, data) => ({
      jsonrpc: '2.0', id: validId ? id : null, error: { code, message, data },
    })
    if (!object(msg) || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string')
      return fail(-32600, 'Invalid JSON-RPC request.')
    // Notifications, including notifications/initialized, have no response.
    if (!Object.hasOwn(msg, 'id')) return
    if (!validId) return fail(-32600, 'Invalid request ID.')
    const params = msg.params === undefined ? {} : msg.params
    if (!object(params)) return fail(-32602, 'Expected named parameters.')
    const meta = params._meta
    const requested = meta?.['io.modelcontextprotocol/protocolVersion']
    const modern = requested === modernVersion
    const ok = (value) => ({
      jsonrpc: '2.0', id,
      result: modern
        ? { ...value, resultType: 'complete', _meta: { 'io.modelcontextprotocol/serverInfo': serverInfo } }
        : value,
    })
    if (requested !== undefined && !modern)
      return fail(-32022, 'Unsupported protocol version.', { requested, supported: versions })
    if (modern && !object(meta['io.modelcontextprotocol/clientCapabilities']))
      return fail(-32602, 'Missing client capabilities.')
    if (msg.method === 'server/discover' && modern)
      return ok({ supportedVersions: versions, capabilities, ...cache })
    if (msg.method === 'initialize' && !modern) {
      if (typeof params.protocolVersion !== 'string' || !object(params.capabilities) ||
          typeof params.clientInfo?.name !== 'string' || typeof params.clientInfo?.version !== 'string')
        return fail(-32602, 'Expected protocolVersion, clientInfo, and capabilities.')
      const protocolVersion = handshakeVersions.includes(params.protocolVersion)
        ? params.protocolVersion : handshakeVersions[0]
      initialized = true
      return ok({ protocolVersion, capabilities, serverInfo })
    }
    if (msg.method === 'ping') return ok({})
    if (!modern && !initialized) return fail(-32002, 'Initialize the server first.')
    if (msg.method === 'tools/list') {
      if (params.cursor !== undefined) return fail(-32602, 'Invalid cursor.')
      return ok(modern ? { tools, ...cache } : { tools })
    }
    if (msg.method !== 'tools/call') return fail(-32601, 'Method not found.')
    const selected = tools.find((item) => item.name === params.name)
    if (!selected) return fail(-32602, 'Unknown Alpina tool.')
    const args = params.arguments === undefined ? {} : params.arguments
    const invalid = validateArguments(selected.inputSchema, args)
    if (invalid) return ok(resultText(invalid, true))
    try {
      return ok(await callTool(root, registry, guides, selected.name, args))
    } catch {
      return fail(-32603, 'Could not read the installed Alpina reference. Check the package installation.')
    }
  }

  const input = createInterface({ input: process.stdin, crlfDelay: Infinity })
  for await (const line of input) {
    if (!line.trim()) continue
    let response
    try {
      response = await dispatch(JSON.parse(line))
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error
      response = { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Invalid JSON.' } }
    }
    if (response && !process.stdout.write(JSON.stringify(response) + '\n')) await once(process.stdout, 'drain')
  }
}
