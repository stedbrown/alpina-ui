import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const registry = JSON.parse(await readFile('registry.json', 'utf8'))
const file = 'scripts/component-status.json'
const previous = JSON.parse(await readFile(file, 'utf8'))
const update = process.argv.includes('--update')
const records = {}
for (const item of registry.items.toSorted((a, b) => a.name.localeCompare(b.name))) {
  // Shared theme changes are documented once per release. Count the actual implementation,
  // its component CSS, and the private helpers copied alongside it by the registry CLI.
  const paths = item.files.filter(name => name !== 'theme.css' && !name.endsWith('.txt'))
    .map(path => 'src/' + path).sort()
  const digest = createHash('sha256')
  for (const path of paths) {
    digest.update(path).update('\0').update((await readFile(path, 'utf8')).replace(/\r\n/g, '\n')).update('\0')
  }
  const source = digest.digest('hex').slice(0, 20)
  let entry = previous[item.name]
  if (source !== entry?.source) {
    assert.ok(update, item.name + ': component sources changed. Run npm run status:update.')
    const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim()
    const pending = git(['status', '--porcelain', '--', ...paths])
    const committed = git(['log', '-1', '--format=%cs', '--', ...paths])
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' })
    entry = { stage: entry?.stage ?? 'Beta', changed: pending || !committed ? today : committed, source }
  }
  assert.ok(['Stable', 'Beta'].includes(entry.stage), item.name)
  assert.match(entry.changed, /^\d{4}-\d{2}-\d{2}$/)
  records[item.name] = entry
}
if (update) await writeFile(file, JSON.stringify(records, null, 2) + '\n')
else assert.deepEqual(records, previous, 'Status directory must match the registry')
console.log(Object.keys(records).length + ' component change records verified.')
