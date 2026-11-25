import assert from 'node:assert/strict'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { loadInventory } from './load-inventory.mjs'
import { siteUrl as origin } from './site-config.mjs'

const manifest = JSON.parse(await readFile('package.json', 'utf8'))
const registry = JSON.parse(await readFile('registry.json', 'utf8'))
const inventory = await loadInventory()
assert.deepEqual(inventory.map(([slug]) => slug).sort(), registry.items.map(item => item.name).sort())
const names = new Map(inventory.map(([slug, name]) => [slug, name]))
const classes = new Map(['Base', 'Interactive', 'Swiss', 'Documents', 'Charts'].map(label => [label, []]))
const documents = new Set(['letter', 'invoice-document', 'swiss-qr-bill'])
const charts = new Set(['bar-chart', 'chart', 'chart-table', 'line-chart', 'sparkline'])
for (const { name, group } of registry.items) {
  const label = documents.has(name) ? 'Documents' : charts.has(name) ? 'Charts'
    : group === 'swiss' ? 'Swiss' : group === 'interactive' ? 'Interactive' : 'Base'
  classes.get(label).push('[' + names.get(name) + '](' + origin + '/docs/components/' + name + '/)')
}
const blocks = (await readdir('blocks')).filter(file => file.endsWith('.tsx')).sort().map(file => {
  const slug = file.slice(0, -4)
  const title = slug.split('-').join(' ').replace(/^./, initial => initial.toUpperCase())
  return '[' + title + '](' + origin + '/blocks/' + slug + '/)'
})
const table = [
  registry.items.length + ' installable component entries and ' + blocks.length + ' copyable page blocks.',
  '', '| Category | Entries |', '| --- | --- |',
  ...[...classes, ['Page blocks', blocks]].map(([label, links]) =>
    '| ' + label + ' (' + links.length + ') | ' + links.sort().join(' · ') + ' |'),
].join('\n')
const template = await readFile('docs/readme.template.md', 'utf8')
const rendered = '<!-- Generated from docs/readme.template.md and the public catalog by scripts/readme.mjs. -->\n' +
  template.replaceAll('{{SITE}}', origin).replaceAll('{{VERSION}}', manifest.version)
    .replaceAll('{{BADGE_VERSION}}', manifest.version.replaceAll('-', '--')).replace('{{INVENTORY}}', table)
if (process.argv.includes('--check')) {
  assert.equal((await readFile('README.md', 'utf8')).replaceAll('\r\n', '\n'), rendered.replaceAll('\r\n', '\n'), 'Run node scripts/readme.mjs to refresh the public directory')
} else {
  await writeFile('README.md', rendered)
}
