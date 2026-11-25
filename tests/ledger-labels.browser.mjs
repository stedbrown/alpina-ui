import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Badge, Button, DataTable, DescriptionList, InlineCode, Stack, Table, TableBody, TableRow, TableCell, TextLink } from 'alpina-ui'
import { launchBrowser } from './launch-browser.mjs'
import { readableLabelIssues } from './readable-labels.mjs'

const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')
const fixture = renderToStaticMarkup(h(Stack, { align: 'start' },
  h(DataTable, {
    caption: 'Fatture', empty: 'Nessuna fattura', rows: [{ id: '2026-0158' }, { id: '2026-0141' }], rowKey: r => r.id,
    columns: [
      { id: 'id', header: 'Numero', cell: r => r.id, compare: () => 0 },
      { id: 'document', header: 'Link', nowrap: true, cell: r => h(TextLink, { href: '#invoice-' + r.id }, r.id) },
      { id: 'client', header: 'Cliente', cell: () => 'Falegnameria di quartiere' },
      { id: 'date', header: 'Data', format: 'swiss-date', value: () => '2026-03-14' },
      { id: 'amount', header: 'Totale', format: 'chf', value: () => 1285.15 },
      { id: 'status', header: 'Stato', cell: () => h(Badge, null, 'Pagata') },
      { id: 'remind', header: 'Azione', cell: () => h(Button, null, 'Sollecito') },
    ],
  }),
  h(Table, { 'aria-label': 'Imported references' }, h(TableBody, null, h(TableRow, null,
    h(TableCell, null, 'Atelier'.repeat(12), h('small', null, 'Ref')),
    h(TableCell, { numeric: true }, '9'.repeat(100)),
  ))),
  h(DescriptionList, { items: [{ term: 'Richiedente', detail: 'Ada Rossi' }] }),
))
const browser = await launchBrowser()
try {
  const page = await browser.newPage()
  await page.setContent('<!doctype html><meta charset="utf-8"><style>' + css + '</style>' + fixture)
  for (const width of [320, 360, 640, 768, 800, 960, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert.deepEqual(await page.evaluate(readableLabelIssues), [], width + 'px')
    const split = await page.getByRole('table', { name: 'Fatture' }).locator('tbody td:first-child, td a, time, button, .al-badge').evaluateAll(elements => {
      return elements.flatMap(el => {
        const range = document.createRange()
        range.selectNodeContents(el)
        const runs = [...range.getClientRects()].filter(r => r.width && r.height)
        return runs.some(run => Math.abs(run.top - runs[0].top) > 2) ? [el.textContent] : []
      })
    })
    assert.deepEqual(split, [], 'Split ledger controls or reference at ' + width + 'px')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  }
  await page.setViewportSize({ width: 320, height: 900 })
  const token = page.getByText('Atelier'.repeat(12), { exact: true })
  await token.focus()
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(() => document.activeElement?.scrollLeft > 0)
  assert.ok(await token.evaluate(el => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return range.getClientRects().length === 1 && el.scrollWidth > el.clientWidth
  }), 'A very long imported identifier is readable from end to end with the keyboard')
  const signature = "'div' | 'header' | 'main' | 'section' | 'article' | 'footer'"
  const propsTable = h(Table, { layout: 'fixed' }, h(TableBody, null, h(TableRow, null,
    h(TableCell, null, h(InlineCode, { unbroken: true }, '2026-0158')), h(TableCell, null, h(InlineCode, null, signature)),
  )))
  await page.setContent('<style>' + css + '</style>' + renderToStaticMarkup(propsTable))
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  assert.equal(await page.getByText('2026-0158').evaluate(el => getComputedStyle(el).whiteSpace), 'nowrap')
  await page.setContent('<table><tr><td style="max-width:2ch"><a href="#">2026-0141</a></td></tr></table><div class="al-field-error" style="width:2ch">Lo sportello serve solo Lugano.</div><div style="width:2ch">Custom summary</div>' +
    '<span style="display:inline-block;width:2ch">Custom label</span>' +
    '<div style="width:2ch"><span>Wrapper width</span></div>' +
    '<div style="width:2ch"><span>OK</span></div>' +
    '<div style="clip-path:inset(50%);width:0"><span style="display:block">Audible only</span></div>')
  assert.deepEqual((await page.evaluate(readableLabelIssues)).sort(), [
    'Text column narrower than 4ch: 2026-0141',
    'Text column narrower than 4ch: Custom label',
    'Text column narrower than 4ch: Custom summary',
    'Text column narrower than 4ch: Lo sportello serve solo Lugano.',
    'Text column narrower than 4ch: Wrapper width',
  ])
  console.log('Invoice references, actions and description terms retain their intrinsic reading width.')
} finally { await browser.close() }
