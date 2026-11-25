import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const here = fileURLToPath(new URL('./', import.meta.url))
const packed = join(here, '.alpina')
const { items } = JSON.parse(await readFile(join(packed, 'registry.json')))
const barrel = await readFile(join(packed, 'dist/index.js'), 'utf8')
const entries = new Map(items.map(item => [item.group + '/' + item.name, item.entry]))
for (const [, specifier] of barrel.matchAll(/export \* from ['"]\.\/(swiss\/[^'"]+)\.js['"]/g)) {
  if (!entries.has(specifier)) entries.set(specifier, specifier + '.ts')
}
const project = await mkdtemp(join(here, '.rsc-check-'))
const imports = []
const checks = []
let index = 0
try {
  for (const [path, entry] of entries) {
    const code = await readFile(join(packed, 'src', entry), 'utf8')
    const built = await readFile(join(packed, 'dist', entry.replace(/\.tsx?$/, '.js')), 'utf8')
    const boundary = /^['"]use client['"]/u.test(code)
    assert.equal(/^['"]use client['"]/u.test(built), boundary, 'Lost directive: ' + path)
    if (!boundary && entry.endsWith('.tsx')) {
      const source = ts.createSourceFile(entry, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
      function inspect(node) {
        if (ts.isJsxAttribute(node) && /^on[A-Z]/.test(node.name.getText(source)) &&
          node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
          const expression = node.initializer.expression
          assert.ok(!(ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)),
            entry + ' defines an event handler without a client boundary')
        }
        ts.forEachChild(node, inspect)
      }
      inspect(source)
    }
    const specifier = 'alpina-ui/' + path
    const exports = Object.keys(await import(specifier))
    assert.ok(exports.length, specifier)
    const aliases = []
    for (const key of exports) {
      const alias = 'direct' + index++
      aliases.push(key + ' as ' + alias)
      checks.push('verify(' + alias + ', barrel.' + key + ', ' + boundary + ', ' + JSON.stringify(key) + ')')
    }
    imports.push('import { ' + aliases.join(', ') + ' } from ' + JSON.stringify(specifier))
  }

  await mkdir(join(project, 'app'))
  await writeFile(join(project, 'package.json'), '{"private":true,"type":"module"}')
  await writeFile(join(project, 'next.config.mjs'), "import { fileURLToPath } from 'node:url';export default {turbopack:{root:fileURLToPath(new URL('..',import.meta.url))}}")
  await writeFile(join(project, 'app/layout.jsx'), 'export default function Layout({children}) {return <html lang="en"><body>{children}</body></html>}')
  await writeFile(join(project, 'app/page.jsx'), [
    "import * as barrel from 'alpina-ui'", ...imports,
    'function verify(direct, root, client, name) {',
    " const tag = Symbol.for('react.client.reference')",
    ' for (const value of [direct, root]) {',
    '   if (value == null || (value.$$typeof === tag) !== client) throw Error("Incorrect RSC export: " + name)',
    ' }',
    '}',
    'export default function Contract() {', ...checks,
    ' if (!barrel.isSwissIban("CH9300762011623852957")) throw Error("Server helper failed")',
    ' return <main data-verified="' + index + '">Component boundaries verified</main>',
    '}',
  ].join('\n'))
  // Compile the same editable source a consumer gets from the packaged CLI.
  const serviceRoute = join(project, 'app/public-service')
  const copy = spawnSync(process.execPath, [join(packed, 'cli/alpina.mjs'), 'add', 'block/public-service',
    '--dir', 'app/public-service/components'], { cwd: project, encoding: 'utf8' })
  assert.equal(copy.status, 0, copy.stderr)
  await writeFile(join(serviceRoute, 'page.jsx'), [
    "import { PublicServiceBlock } from './components/blocks/public-service'",
    'export default function Page() { return <PublicServiceBlock /> }',
  ].join('\n'))
  const cli = join(here, 'node_modules/next/dist/bin/next')
  const run = spawnSync(process.execPath, [cli, 'build'], {
    cwd: project, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: 'inherit',
  })
  assert.equal(run.status, 0, 'Next failed to prerender the package contract')
  const html = await readFile(join(project, '.next/server/app/index.html'), 'utf8')
  assert.ok(html.includes('data-verified="' + index + '"'), 'Next did not prerender the complete export check')
  const service = await readFile(join(project, '.next/server/app/public-service.html'), 'utf8')
  assert.match(service, /Residence certificate/)
  await rm(serviceRoute, { recursive: true })
  // Build the same app again with a single client-side root import. Inspect the
  // complete deployment, including server chunks and detached browser assets.
  await writeFile(join(project, 'app/page.jsx'), [
    '"use client"',
    "import { Button } from 'alpina-ui'",
    'export default function Page() { return <Button>Continue</Button> }',
  ].join('\n'))
  await rm(join(project, '.next'), { recursive: true, force: true })
  const button = spawnSync(process.execPath, [cli, 'build'], {
    cwd: project, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: 'inherit',
  })
  assert.equal(button.status, 0, 'Next failed to build the root Button fixture')
  assert.match(await readFile(join(project, '.next/server/app/index.html'), 'utf8'), /<button[^>]*>Continue<\/button>/)
  for (const directory of ['server', 'static']) {
    const output = join(project, '.next', directory)
    for (const file of await readdir(output, { recursive: true, withFileTypes: true })) {
      if (!file.isFile()) continue
      const contents = await readFile(join(file.parentPath, file.name))
      assert.ok(!contents.includes('6900TIMassagno'), 'Next emitted postal data in ' + file.name)
      assert.ok(!contents.includes('997-byte capacity of version 25-M'), 'Next emitted the QR encoder in ' + file.name)
    }
  }
  console.log('Verified the complete Next production output for a root Button import.')
  console.log('Verified ' + index + ' runtime exports through the barrel and every registered subpath in a production React Server Component.')
} finally {
  await rm(project, { recursive: true, force: true })
}
