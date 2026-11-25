import { readFile, writeFile, readdir, mkdir, rm, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { transform } from 'esbuild'
import { groups, additions } from './items.mjs'
import { buildScannerCodecs } from './scanner-codecs.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
process.chdir(root)
await writeFile(
  'catalog/expanded-inventory.ts',
  'export const expanded = ' +
    JSON.stringify(
      additions.map((row) => row.slice(1)),
      null,
      2,
    ) +
    ' as const\n',
)
const paths = []
for (const group of Object.keys(groups)) {
  for (const file of (await readdir('src/' + group)).sort()) paths.push(group + '/' + file)
}
const modules = paths.filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.d.ts'))
const sources = new Map(
  await Promise.all(paths.map(async (file) => [file, await readFile('src/' + file, 'utf8')])),
)
function dependencies(file, seen = new Set()) {
  if (seen.has(file)) return seen
  seen.add(file)
  if (file.endsWith('.css')) return seen
  const imports = /(?:\bfrom\s*|^\s*import\s*|\bimport\(\s*)["'](\.[^"']+)["']/gm
  for (const match of sources.get(file).matchAll(imports)) {
    const relative = path.posix.join(path.posix.dirname(file), match[1])
    const key = [relative, relative.replace(/\.js$/, '.tsx'), relative.replace(/\.js$/, '.ts')].find(
      (p) => sources.has(p),
    )
    if (!key) throw new Error('Unknown local import in ' + file + ' → ' + relative)
    dependencies(key, seen)
  }
  return seen
}
const registry = {
  name: 'alpina-ui',
  version: JSON.parse(await readFile('package.json')).version,
  items: [],
}
const usageNotes = JSON.parse(await readFile('scripts/component-usage.json', 'utf8'))
for (const [group, names] of Object.entries(groups)) {
  for (const name of names) {
    const entry = group + '/' + name + '.tsx'
    await access('src/' + entry)
    const files = dependencies(entry)
    if (files.has('swiss/format-chf.ts') || files.has('swiss/format-swiss-date.ts') || files.has('swiss/format-swiss-number.ts'))
      files.add('swiss/UNICODE-LICENSE.txt')
    const usage = usageNotes[name]
    if (typeof usage !== 'string' || !usage.trim()) throw new Error('Missing usage notes for ' + name)
    registry.items.push({ name, group, entry, usage, files: ['theme.css', ...files] })
  }
}
await writeFile('registry.json', JSON.stringify(registry, null, 2) + '\n')
// Re-export public entries and Swiss data/formatting helpers. Internal overlay helpers stay internal.
const publicFiles = modules.filter(
  (f) => registry.items.some((i) => i.entry === f) || (f.startsWith('swiss/') && f.endsWith('.ts') && !f.endsWith('.data.ts') && !f.endsWith('.internal.ts')),
)
await writeFile(
  'src/index.ts',
  publicFiles.map((f) => "export * from './" + f.replace(/\.tsx?$/, '.js') + "'").join('\n') + '\n',
)
await rm('dist', { force: true, recursive: true })
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], {
  stdio: 'inherit',
})
// A copied component uses the original deferred loader. Package consumers resolve the
// same private import through the bundler conditions declared in package.json.
const postalPath = 'dist/swiss/postal-localities.js'
const postal = await readFile(postalPath, 'utf8')
await writeFile(postalPath, postal.replace('./postal-loader.internal.js', '#postal-loader'))
await writeFile('dist/swiss/postal-inline.js', [
  "import rows from './postal-localities.data.js'",
  'export const loadPostalRows = () => Promise.resolve(rows)',
].join('\n') + '\n')
await buildScannerCodecs()
// Consumers choose a single stylesheet or per-component styles. ESM can be loaded in bare Node SSR.
for (const file of modules) {
  const dest = 'dist/' + file.replace(/\.tsx?$/, '.js')
  const declaration = dest.replace(/\.js$/, '.d.ts')
  for (const output of [dest, declaration]) {
    const data = await readFile(output, 'utf8')
    await writeFile(output, data.replace(/^\s*import\s*["'][^"']+\.css["'];?\s*$/gm, ''))
  }
}
async function css(files, target) {
  const source = (await Promise.all(files.map((file) => readFile('src/' + file, 'utf8')))).join('\n')
  await writeFile(target, (await transform(source, { loader: 'css', minify: true })).code)
}
await mkdir('dist/styles', { recursive: true })
await css(['theme.css', ...paths.filter((f) => f.endsWith('.css')), 'print.css'], 'dist/styles.css')
for (const item of registry.items) {
  await css(
    item.files.filter((f) => f.endsWith('.css') && f !== 'theme.css'),
    'dist/styles/' + item.name + '.css',
  )
}
console.log(registry.items.length + ' components built.')
