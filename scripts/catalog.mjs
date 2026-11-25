import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { marked } from 'marked'
import ts from 'typescript'
import { execSync } from 'node:child_process'
import { buildApiReference } from './api-reference.mjs'
import { readDirectorySources } from './directory-sources.mjs'
import { buildWebsite } from './site.mjs'

process.chdir(fileURLToPath(new URL('../', import.meta.url)))
const guides = {}
const guideFiles = {
  coverage: 'docs/coverage.md',
  research: 'docs/research.md',
  portal: 'docs/portal.md',
  elements: 'docs/elements-v3.md',
  actions: 'docs/actions-v3.md',
  workflows: 'docs/workflows-v3.md',
  start: 'docs/start.md',
  cli: 'docs/cli.md',
  release: 'docs/release.md',
  directory: 'docs/directory.md',
  core: 'docs/core.md',
  design: 'docs/design.md',
  interactive: 'docs/interactive.md',
  swiss: 'docs/swiss.md',
}
for (const [key, file] of Object.entries(guideFiles)) {
  guides[key] = (await marked.parse(await readFile(file, 'utf8'))).replace(
    /<pre>/g,
    '<pre tabindex="0">',
  )
}

// Export the source of the actual demo shown for each component, with the imports it uses.
const exampleCss = await readFile('catalog/examples.css', 'utf8')
const sources = {}
for (const file of [
  ...['elements-v3', 'actions-v3', 'workflows-v3', 'portal-v3'].map(
    (name) => 'catalog/' + name + '.tsx',
  ),
  'catalog/stack-example.tsx',
  'catalog/icon-example.tsx',
  'catalog/composition-examples.tsx',
  'catalog/demos.tsx',
  'catalog/address-example.tsx',
  'catalog/design-examples.tsx',
  'catalog/data-examples.tsx',
]) {
  const source = ts.createSourceFile(
    file,
    await readFile(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const imports = source.statements.filter(ts.isImportDeclaration)
  for (const stmt of source.statements.filter(ts.isFunctionDeclaration)) {
    if (!stmt.name || !stmt.name.text.endsWith('Example')) continue
    const names = new Set()
    function visit(node) {
      if (ts.isIdentifier(node)) names.add(node.text)
      ts.forEachChild(node, visit)
    }
    visit(stmt)
    const used = []
    for (const declaration of imports) {
      const parts = (declaration.importClause?.namedBindings?.elements ?? [])
        .filter((el) => names.has(el.name.text))
        .map((el) => (el.isTypeOnly ? 'type ' : '') + el.name.text)
      if (parts.length)
        used.push(
          'import { ' +
            parts.join(', ') +
            ' } from "' +
            (declaration.moduleSpecifier.text === 'react' ? 'react' : 'alpina-ui') +
            '"',
        )
    }
    used.push('import "alpina-ui/styles.css"')
    if (stmt.getText(source).includes('className=')) used.push('import "./example.css"')
    sources[stmt.name.text] = '"use client"\n\n' + used.join('\n') + '\n\n' + stmt.getText(source)
  }
}
const registry = JSON.parse(await readFile('registry.json', 'utf8'))
const licenseFile = 'ALPINA-LICENSE.txt'
const license = await readFile('LICENSE', 'utf8')
const componentFiles = Object.fromEntries(
  registry.items.map((item) => [
    item.name,
    [item.entry, ...item.files.filter((file) => file !== item.entry), licenseFile],
  ]),
)
const sourceFiles = Object.fromEntries(
  await Promise.all(
    [...new Set(Object.values(componentFiles).flat())].map(async (file) => [
      file,
      file === licenseFile ? license : await readFile('src/' + file, 'utf8'),
    ]),
  ),
)
if (Object.keys(sources).length !== registry.items.length)
  throw new Error('The example count does not match the component registry')
const apiReference = await buildApiReference()
const directorySources = await readDirectorySources()
await mkdir('site', { recursive: true })
const archiveName = 'alpina-ui-' + registry.version + '.tgz'
if (process.argv.includes('--release-package')) {
  // Build hosts can produce different tar headers for identical package contents.
  // Serve the exact release bytes pinned by the standalone example's lockfile.
  const directory = 'recipes/rubrica/'
  const archive = await readFile(directory + 'vendor/' + archiveName)
  const lock = JSON.parse(await readFile(directory + 'package-lock.json', 'utf8'))
  const expected = lock.packages['node_modules/alpina-ui']
  const integrity = 'sha512-' + createHash('sha512').update(archive).digest('base64')
  if (expected.version !== registry.version || expected.integrity !== integrity)
    throw new Error('The release package does not match the address book lockfile.')
  await writeFile('site/' + archiveName, archive)
  // Preserve installation URLs for projects pinned to earlier releases.
  for (const previous of ['alpina-ui-0.6.0.tgz', 'alpina-ui-0.7.0.tgz', 'alpina-ui-0.7.1.tgz']) {
    await writeFile('site/' + previous, await readFile(directory + 'vendor/' + previous))
  }
} else {
  execSync('npm pack --ignore-scripts --silent --pack-destination site', { stdio: 'pipe' })
}
const archive = await readFile('site/' + archiveName)
const release = {
  name: archiveName,
  bytes: archive.length,
  data: 'data:application/gzip;base64,' + archive.toString('base64'),
}
const result = await build({
  entryPoints: ['catalog/app.tsx'],
  // The portal and the independently installable recipe share one React dispatcher.
  alias: { react: fileURLToPath(new URL('../node_modules/react', import.meta.url)) },
  outdir: 'site',
  bundle: true,
  jsx: 'automatic',
  write: false,
  minify: true,
  platform: 'browser',
  target: ['es2022'],
  format: 'iife',
  legalComments: 'inline',
  charset: 'utf8',
  loader: { '.woff2': 'dataurl', '.webp': 'dataurl' },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [
    {
      name: 'guide-offline',
      setup(ctx) {
        ctx.onResolve({ filter: /^alpina:atelier$/ }, () => ({
          path: fileURLToPath(new URL('../recipes/rubrica/src/app.tsx', import.meta.url)),
        }))
        // Resolve the recipe against the same public package entry as the rest of the portal.
        ctx.onResolve({ filter: /^alpina-ui$/ }, () => ({
          path: fileURLToPath(import.meta.resolve('alpina-ui')),
        }))
        ctx.onResolve({ filter: /^alpina:content$/ }, () => ({ path: 'content', namespace: 'alpina' }))
        ctx.onLoad({ filter: /.*/, namespace: 'alpina' }, () => ({
          contents:
            'export const guides=' +
            JSON.stringify(guides) +
            ';export const usageNotes=' +
            JSON.stringify(Object.fromEntries(registry.items.map(({ name, usage }) => [name, usage]))) +
            ';export const sources=' +
            JSON.stringify(sources) +
            ';export const exampleCss=' +
            JSON.stringify(exampleCss) +
            ';export const sourceFiles=' +
            JSON.stringify(sourceFiles) +
            ';export const componentFiles=' +
            JSON.stringify(componentFiles) +
            ';export const directorySources=' +
            JSON.stringify(directorySources) +
            ';export const release=' +
            JSON.stringify(release) +
            ';export const apiReference=' +
            JSON.stringify(apiReference) +
            ';export const version=' +
            JSON.stringify(registry.version),
        }))
      },
    },
  ],
})
const script = result.outputFiles
  .find((f) => f.path.endsWith('.js'))
  .text.replace(/<\/script/gi, '<\\/script')
const css = result.outputFiles.find((f) => f.path.endsWith('.css')).text
const notices = await Promise.all(
  ['react', 'react-dom', 'scheduler'].map(
    async (name) => name + '\n' + (await readFile('node_modules/' + name + '/LICENSE', 'utf8')),
  ),
)
notices.unshift('Alpina UI\n' + license)
notices.push(await readFile('src/swiss/UNICODE-LICENSE.txt', 'utf8'))
notices.push('Inter\n' + await readFile('src/fonts/OFL.txt', 'utf8'))
const offlineFonts = await build({
  entryPoints: ['src/fonts.css'], bundle: true, write: false, minify: true, loader: { '.woff2': 'dataurl' },
})
const html =
  '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><title>Alpina UI</title><style>' +
  css + offlineFonts.outputFiles[0].text +
  '</style></head><body><div id="app"></div><noscript>Enable JavaScript to try the interactive components.</noscript><script>' +
  script +
  '</script><script type="text/plain" id="third-party-notices">' +
  notices.join('\n\n') +
  '</script></body></html>'
await mkdir('site', { recursive: true })
await writeFile('site/catalog.html', html)
await buildWebsite({ guides, guideFiles, apiReference, registry, script, css, notices })
console.log(
  'Offline catalog: site/catalog.html (' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KiB)',
)
