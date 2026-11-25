import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'
import { formatCHF } from 'alpina-ui'

const script = await build({ stdin: { contents: "export {formatCHF, formatSwissDate, formatSwissTime} from 'alpina-ui'", resolveDir: process.cwd() },
  bundle: true, write: false, format: 'iife', globalName: 'swiss' })
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage({ timezoneId: 'Asia/Tokyo' })
  await page.setContent('<article lang="de-CH"><q>Text</q></article><article lang="fr-CH"><q>Texte <q>cité</q></q></article>')
  await page.addStyleTag({ content: await readFile('src/theme.css', 'utf8') })
  await page.addScriptTag({ content: script.outputFiles[0].text })
  for (const locale of ['de-CH', 'it-CH', 'fr-CH', 'rm-CH']) {
    const [money, date, time] = await page.evaluate(locale => [
      swiss.formatCHF(-1234567.025, locale, { cashRounding: true }),
      swiss.formatSwissDate('2028-02-29', locale), swiss.formatSwissTime(new Date('2026-12-31T23:00Z')),
    ], locale)
    assert.equal(money, formatCHF(-1234567.025, locale, { cashRounding: true }))
    assert.equal(date, '29.02.2028')
    assert.equal(time, '00:00')
  }
  const quotes = await page.locator('q').evaluateAll(nodes => nodes.map(q => getComputedStyle(q).quotes))
  assert.equal(quotes[0], '"«" "»" "‹" "›"')
  assert.equal(quotes[1], '"« " " »" "‹ " " ›"')
  assert.equal(quotes[2], quotes[1])
  console.log('Node and Chromium agree on Swiss digit grouping, cash rounding, date order and local clock conventions.')
} finally { await browser.close() }
