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
// Release history, unreleased work on main and component stages come from the changelog and status registry.
const changelog = (await readFile('CHANGELOG.md', 'utf8')).replaceAll('\r\n', '\n')
const sections = [...changelog.matchAll(/^## (.+)\n\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)].map(([, heading, body]) => ({
  heading: heading.trim(),
  items: [...body.matchAll(/^- (.+)$/gm)].map(([, item]) => item.replace(/^\*\*[^*]+\*\* /, '')),
}))
// Keep the first sentence of an entry. A period inside a version, a URL or a code span does not end it.
const firstSentence = item => (item.match(/^(?:`[^`]*`|\[[^\]]*\]\([^)]*\)|\.(?=\S)|[^.`[])+\.(?=\s|$)/)?.[0] ?? item).trim()
const unreleased = sections.find(section => section.heading === 'Unreleased')
const releases = sections.filter(section => section.heading !== 'Unreleased').slice(0, 3)
assert.equal(releases[0]?.heading.split(' · ')[0], manifest.version, 'The changelog must start with the package version after Unreleased.')
const stages = Object.values(JSON.parse(await readFile('scripts/component-status.json', 'utf8')))
const count = stage => stages.filter(entry => entry.stage === stage).length
const prerelease = manifest.version.includes('-')
const versions = [
  '| Channel | Version | Install |', '| --- | --- | --- |',
  '| npm `' + (prerelease ? 'next' : 'latest') + '` | ' + manifest.version + ' | `npm install alpina-ui' + (prerelease ? '@next' : '') + '` |',
  '| Checksummed archive | ' + manifest.version + ' | `npm install ' + origin + '/alpina-ui-' + manifest.version + '.tgz` |',
  '| `main` branch | Changes after ' + manifest.version + ' | Live on [' + new URL(origin).host + '](' + origin + '/) before the next release |',
  '',
  count('Stable') + ' component entries are Stable and covered by the 1.x compatibility policy. ' + count('Beta') +
    ' remain Beta while their [review](docs/beta-review.md) collects device, printing and assistive-technology evidence. [Component status](' + origin + '/status/) · [API stability](docs/api-stability.md)',
  ...(unreleased?.items.length ? ['', '**On `main`, not yet on npm**', '', ...unreleased.items.map(item => '- ' + firstSentence(item))] : []),
  '', '**Recent releases**', '',
  ...releases.map(({ heading, items }) => {
    const [version, date] = heading.split(' · ')
    return '- **' + version + '**' + (date ? ' · ' + date : '') + ' · ' + items.length + (items.length === 1 ? ' change' : ' changes')
  }),
  '', '[Full changelog](CHANGELOG.md) · [GitHub releases](https://github.com/stedbrown/alpina-ui/releases)',
].join('\n')
const template = await readFile('docs/readme.template.md', 'utf8')
const rendered = '<!-- Generated from docs/readme.template.md and the public catalog by scripts/readme.mjs. -->\n' +
  template.replaceAll('{{SITE}}', origin).replaceAll('{{VERSION}}', manifest.version)
    // Prereleases install from the npm next tag, stable versions from latest.
    .replaceAll('{{NPM_INSTALL}}', 'npm install alpina-ui' + (manifest.version.includes('-') ? '@next' : ''))
    .replaceAll('{{BADGE_VERSION}}', manifest.version.replaceAll('-', '--')).replace('{{INVENTORY}}', table)
    .replaceAll('{{NPM_TAG}}', prerelease ? 'next' : 'latest').replace('{{VERSIONS}}', versions)
if (process.argv.includes('--check')) {
  assert.equal((await readFile('README.md', 'utf8')).replaceAll('\r\n', '\n'), rendered.replaceAll('\r\n', '\n'), 'Run node scripts/readme.mjs to refresh the public directory')
} else {
  await writeFile('README.md', rendered)
}
