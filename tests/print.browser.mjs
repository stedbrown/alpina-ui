import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Card, Prose, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'alpina-ui'
import { launchBrowser } from './launch-browser.mjs'

const browser = await launchBrowser()
try {
  const page = await browser.newPage()
  const rows = Array.from({ length: 75 }, (_, i) => h(TableRow, { key: i }, h(TableCell, null, 'Invoice line ' + (i + 1))))
  const content = h('main', null, h(Prose, null, h('h1', null, 'Statement'),
    h('a', { href: 'https://example.ch/terms' }, 'Terms'),
    h(Card, null, 'Payment details'),
    h(Table, null, h(TableHeader, null, h(TableRow, null, h(TableHead, null, 'Description'))), h(TableBody, null, rows))))
  await page.setContent('<body data-al-page><header>Navigation</header>' + renderToStaticMarkup(content) + '</body>')
  await page.addStyleTag({ content: await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8') })
  await page.emulateMedia({ media: 'print' })
  assert.ok(await page.locator('header').isHidden())
  assert.equal(await page.locator('a').evaluate(el => getComputedStyle(el, '::after').content), '" (https://example.ch/terms)"')
  assert.equal(await page.locator('thead').evaluate(el => getComputedStyle(el).display), 'table-header-group')
  for (const selector of ['.al-card', 'tbody tr']) {
    assert.equal(await page.locator(selector).first().evaluate(el => getComputedStyle(el).breakInside), 'avoid')
  }
  const pdf = (await page.pdf({ preferCSSPageSize: true })).toString('latin1')
  assert.ok((pdf.match(/\/Type\s*\/Page\b/g) ?? []).length > 1)
  assert.match(pdf, /\/MediaBox\s*\[0 0 59[45][\d.]* 84[12][\d.]*\]/)
  console.log('A4 document printing passed for navigation, link destinations, table rows and cards.')
} finally { await browser.close() }
