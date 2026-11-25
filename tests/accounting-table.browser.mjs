import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { launchBrowser } from './launch-browser.mjs'

const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')
const script = await build({ stdin: { resolveDir: fileURLToPath(new URL('../', import.meta.url)), contents: `
  import { createElement as h } from 'react'
  import { createRoot } from 'react-dom/client'
  import { DataTable } from 'alpina-ui'
  const rows = Array.from({length:90}, (_, i) => ({
    id:'Posting ' + (i+1), amount:i===0 ? -32.5 : i % 2 ? 125 : 980.75,
    date:i % 2 ? '31.01.2026' : '01.02.2026', group: i < 50 ? 'Paper' : 'Binding',
  }))
  createRoot(document.querySelector('#app')).render(h(DataTable, {
    caption: 'Production account', empty: 'No postings', rows, rowKey: r => r.id,
    groupBy: r => r.group, totalLabel: 'Grand total', maxHeight: '16rem',
    stickyHeader: true, stickyFirstColumn: true, negativeStyle: 'parentheses', locale: 'de-CH',
    columns:[
      { id:'id', header:'Reference', cell:r=>r.id },
      { id:'date', header:'Booked', format:'swiss-date', value:r=>r.date },
      { id:'due', header:'Due', format:'swiss-date', value:r=>r.date },
      { id:'rate', header:'Quantity', format:'decimal', fractionDigits:3, value:()=>2.5 },
      { id:'amount', header:'Balance', format:'chf', value:r=>r.amount, aggregate:'sum' },
    ],
  }))
` }, format: 'iife', bundle: true, write: false, define: { 'process.env.NODE_ENV': '"production"' } })
const browser = await launchBrowser()
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } })
  await page.setContent('<!doctype html><html lang="en"><style>' + css + '</style><div id="app"></div></html>')
  await page.addScriptTag({ content: script.outputFiles[0].text })
  const table = page.getByRole('table', { name: 'Production account' })
  await table.waitFor()
  const heading = table.getByRole('button', { name: 'Balance (CHF)' })
  const dots = await table.locator('tbody:first-of-type tr:not([data-summary]) td:last-child data').evaluateAll(cells => cells.slice(0, 5).map(cell => {
    const text = [...(cell.querySelector('[aria-hidden=true]') ?? cell).childNodes].find(node => node.nodeType === 3 && node.textContent.includes('.'))
    const dot = text.textContent.indexOf('.')
    const range = document.createRange()
    range.setStart(text, dot)
    range.setEnd(text, dot + 1)
    return range.getBoundingClientRect().left
  }))
  assert.ok(Math.max(...dots) - Math.min(...dots) < .5, 'Common decimal position for debits and credits: ' + dots)
  await heading.focus()
  await page.keyboard.press('Enter')
  assert.equal(await table.locator('thead th:last-child').getAttribute('aria-sort'), 'ascending')
  await page.keyboard.press('Space')
  assert.equal(await table.locator('thead th:last-child').getAttribute('aria-sort'), 'descending')
  assert.equal(await heading.evaluate(el => el === document.activeElement), true)
  assert.equal(await table.locator('tfoot td:last-child').evaluate(el => getComputedStyle(el).borderBlockStartStyle), 'double')

  await page.setViewportSize({ width: 320, height: 670 })
  const region = page.getByRole('region', { name: 'Production account' })
  const pinned = await region.evaluate(el => {
    const first = el.querySelector('tbody tr:first-child td'), header = el.querySelector('thead th')
    const original = first.getBoundingClientRect().left
    el.scrollLeft = 145
    el.scrollTop = 180
    return { shifted: el.scrollLeft, down: el.scrollTop, first: first.getBoundingClientRect().left - original,
      top: header.getBoundingClientRect().top - el.getBoundingClientRect().top }
  })
  assert.ok(pinned.shifted > 0 && pinned.down > 0)
  assert.ok(Math.abs(pinned.first) < 1 && Math.abs(pinned.top) < 1, JSON.stringify(pinned))

  await page.setViewportSize({ width: 1000, height: 1200 })
  await page.emulateMedia({ media: 'print' })
  await table.evaluate(el => {
    const labels = [...el.querySelectorAll('thead th')].map((cell, i) => [cell.querySelector('.al-table-print-label') ?? cell, 'head-' + i])
    labels.push([el.querySelector('tfoot th:first-child'), 'total'])
    for (const [label, id] of labels) {
      const link = document.createElement('a')
      link.href = 'https://print.example/' + id
      link.textContent = label.textContent
      label.replaceChildren(link)
    }
  })
  const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
  const objects = [...pdf.matchAll(/(?:^|\n)(\d+) 0 obj\b([\s\S]*?)endobj/g)]
  const pages = objects.filter(([, , body]) => /\/Type\s*\/Page\b/.test(body))
  const markers = label => objects.filter(([, , body]) => body.includes('https://print.example/' + label)).map(([, id]) => id)
  const hasMarker = (page, ids) => ids.some(id => new RegExp('/Annots\\s*\\[[^\\]]*?\\b' + id + ' 0 R').test(page[2]))
  assert.ok(pages.length >= 3, 'Ledger spans at least three A4 pages')
  assert.ok(pages.every(page => /\/MediaBox\s*\[0 0 59[45][\d.]* 84[12][\d.]*\]/.test(page[2])))
  for (let i = 0; i < 5; i++) assert.ok(pages.every(page => hasMarker(page, markers('head-' + i))), 'Column ' + i + ' label prints on every sheet')
  assert.deepEqual(pages.map(page => hasMarker(page, markers('total'))), pages.map((_, i) => i === pages.length - 1),
    'Grand total appears only on the last sheet')
  console.log('Verified the decimal axis, pinned cells, keyboard sorting and repeated A4 ledger headers.')
} finally { await browser.close() }
