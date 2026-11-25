import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('the candidate review includes a reasoned recommendation for each Beta entry', async () => {
  const status = JSON.parse(await readFile('scripts/component-status.json', 'utf8'))
  const guide = await readFile('docs/beta-review.md', 'utf8')
  const rows = [...guide.matchAll(/^\| \[[^\]]+\]\(https?:\/\/[^/]+\/docs\/components\/([a-z-]+)\/\) \| (Stable|Experimental|Migrate) \| ([^|]+) \|$/gm)]
  assert.deepEqual(rows.map(row => row[1]).sort(), Object.keys(status).filter(slug => status[slug].stage === 'Beta').sort())
  for (const row of rows) assert.ok(row[3].trim().length > 35, 'Explain the recommendation for ' + row[1])
})
