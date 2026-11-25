import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const metadata = JSON.parse(await readFile(new URL('../scripts/component-status.json', import.meta.url), 'utf8'))
const browser = await launchBrowser()
try {
  const page = await openPublicPage(browser, { viewport: { width: 360, height: 800 } })
  await page.goto(siteOrigin + '/docs/components/')
  await page.getByRole('link', { name: 'Check component status' }).click()
  await page.getByRole('heading', { level: 1, name: 'Component status' }).waitFor()
  const rows = await page.getByRole('table', { name: 'Component release status' }).locator('tbody tr').evaluateAll(rows =>
    rows.map(row => ({ slug: row.querySelector('a').pathname.split('/')[3],
      stage: row.cells[1].textContent, date: row.querySelector('time').dateTime })))
  assert.equal(rows.length, Object.keys(metadata).length)
  for (const row of rows) {
    assert.equal(row.stage, metadata[row.slug].stage, row.slug)
    assert.equal(row.date, metadata[row.slug].changed, row.slug)
  }
  assert.deepEqual(new Set(rows.map(row => row.stage)), new Set(['Beta', 'Stable']))
  console.log(rows.length + ' component status links, stages and dates verified.')
} finally {
  await browser.close()
}
