import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Letter, InvoiceDocument } from 'alpina-ui'

const css = await readFile(new URL(import.meta.resolve('alpina-ui/styles.css')), 'utf8')
const helper = await build({ stdin: {
  contents: [
    'export { printSwissDocument } from "alpina-ui"',
    'import { createElement as h } from "react"',
    'import { createRoot } from "react-dom/client"',
    'import { InvoiceDocument } from "alpina-ui"',
    'export function mountInvoice(node, props) { createRoot(node).render(h(InvoiceDocument, { ...props, footer: h("a", {href:"https://visibility.example/invoice"}, "Invoice copy") })) }',
  ].join('\n'), resolveDir: fileURLToPath(new URL('../', import.meta.url)),
}, format: 'iife', globalName: 'documents', bundle: true, write: false, define: { 'process.env.NODE_ENV': '"production"' } })
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1300 } })
  await page.emulateMedia({ media: 'print' })
  const render = async (...elements) => page.setContent('<!doctype html><html><head><style>' + css +
    '</style></head><body>' + elements.map(renderToStaticMarkup).join('') + '</body></html>')
  async function marker(selector) {
    await page.addStyleTag({ content: "a[data-pdf-measure]::after { content: none !important; }" })
    await page.locator(selector).evaluate(element => {
      const mark = document.createElement('a')
      mark.dataset.pdfMeasure = ''
      mark.href = 'https://geometry.example/measure'
      mark.setAttribute('aria-hidden', 'true')
      mark.style.cssText = 'position:absolute;left:0;top:0;width:1mm;height:1mm;display:block'
      mark.textContent = '\u00a0'
      element.append(mark)
    })
  }
  async function pages(point, checkRunningTitle = false) {
    const pdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
    const boxes = [...pdf.matchAll(/\/MediaBox\s*\[0\s+0\s+([\d.]+)\s+([\d.]+)\]/g)]
    assert.ok(boxes.length && boxes.every(([, x, y]) => Math.abs(x - 595.28) < 1 && Math.abs(y - 841.89) < 1))
    const objects = [...pdf.matchAll(/(?:^|\n)(\d+) 0 obj\b([\s\S]*?)endobj/g)]
    const sheetObjects = objects.filter(([, , content]) => /\/Type\s*\/Page\b/.test(content))
    if (checkRunningTitle) {
      const titles = objects.filter(([, , body]) => body.includes('https://geometry.example/title')).map(([, id]) => id)
      assert.ok(titles.length >= 2, 'The printed continuation repeats the document title')
      for (const sheet of sheetObjects.slice(0, -1)) {
        assert.ok(titles.some(id => new RegExp('/Annots\\s*\\[[^\\]]*?\\b' + id + ' 0 R').test(sheet[2])), 'One running title on each itemized sheet')
      }
    }
    if (point) {
      const annotation = objects.find(([, , content]) => content.includes('https://geometry.example/measure'))
      assert.ok(annotation, 'The PDF contains the physical measurement marker')
      const rectangle = annotation[2].match(/\/Rect\s*\[([\d. -]+)\]/)[1].trim().split(/\s+/).map(Number)
      const height = Number(boxes.at(-1)[2])
      assert.ok(Math.abs(rectangle[0] * 25.4 / 72 - point.x) < .5, 'PDF horizontal position ' + rectangle)
      assert.ok(Math.abs((height - rectangle[3]) * 25.4 / 72 - point.y) < .5, 'PDF vertical position ' + rectangle)
      assert.match(sheetObjects.at(-1)[2], new RegExp('/Annots\\s*\\[[^\\]]*?\\b' + annotation[1] + ' 0 R'), 'Marker on last page')
    }
    return sheetObjects.length
  }
  function mm(value, expected) { assert.ok(Math.abs(value * 25.4 / 96 - expected) < .12, 'Expected ' + expected + ' mm, got ' + value * 25.4 / 96) }
  const letterProps = { sender: ['Atelier Nord'], recipient: ['Clara Meier', '3011 Bern'], date: '2026-11-25', subject: 'Proof' }
  for (const [side, x, y, width] of [['left', 20, 35.5, 100], ['right', 112, 45, 90]]) {
    await render(h(Letter, { ...letterProps, windowPosition: side }, 'Proof approved.'))
    const paper = await page.locator('.al-letter').boundingBox()
    const address = await page.locator('.al-letter-window').boundingBox()
    mm(address.x - paper.x, x - 20); mm(address.y - paper.y, y - 15)
    mm(address.width, width); mm(address.height, 45)
    const marks = await page.locator('.al-letter-folds').evaluate(el => ['::before', '::after'].map(p => parseFloat(getComputedStyle(el, p).top)))
    mm(marks[0], 105 - 15); mm(marks[1], 210 - 15)
    await marker('.al-letter-window')
    assert.equal(await pages({ x, y }), 1)
  }
  await render(h(Letter, letterProps, 'Fold positions.'))
  await marker('.al-letter-folds')
  await page.locator('.al-letter-folds a').evaluate(el => { el.style.top = '90mm' })
  assert.equal(await pages({ x: 3.5, y: 105 }), 1)
  await render(h(Letter, { ...letterProps, foldMarks: false }, Array.from({ length: 75 }, (_, index) => h('p', { key: index }, 'Paragraph ' + index))))
  assert.equal(await page.locator('.al-letter-folds').count(), 0)
  assert.ok(await pages() > 1)

  const party = { name: 'Atelier', postalCode: '3000', town: 'Bern', country: 'CH' }
  const invoice = { invoiceNumber: 'AN-104', issueDate: '2026-11-25', supplyDate: '2026-11-24', dueDate: '2026-12-25',
    vatNumber: 'CHE-109.322.551', payment: { iban: 'CH5800791123000889012', creditor: party, debtor: party } }
  const lines = Array.from({ length: 120 }, (_, i) => ({ description: 'Item ' + i, quantity: 3, unitPrice: 24.44, vatRate: [0, 2.6, 3.8, 8.1][i % 4] }))
  for (const width of [320, 360]) {
    await page.setViewportSize({ width, height: 800 })
    await page.emulateMedia({ media: 'screen' })
    await render(h(InvoiceDocument, { ...invoice, locale: 'it-CH', lines: [{ ...lines[0], description: 'Correzione delle bozze', unit: 'h' }] }))
    const table = page.getByRole('table', { name: 'Voci della fattura' })
    assert.equal(await table.getByRole('columnheader').count(), 5)
    const row = table.getByRole('row').last()
    const [description, quantity, price, tax, net] = await row.locator('th, td').evaluateAll(cells => cells.map(cell => {
      const box = cell.getBoundingClientRect()
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom }
    }))
    assert.ok(description.bottom <= quantity.top + 1 && quantity.top === price.top && price.top === net.top)
    assert.ok(tax.top >= price.bottom - 1)
    assert.ok(net.right <= width && net.left > price.left, 'The complete line total is visible without scrolling')
    assert.ok(await table.evaluate(el => el.parentElement.scrollWidth <= el.parentElement.clientWidth + 1))
  }
  await page.setViewportSize({ width: 1000, height: 1300 })
  for (const length of [1, 2, 3, 4, 5, 6, 7, 8, 120]) {
    const realistic = { ...party, name: 'Atelier für Innenausbau am Waldrand', street: 'Werkstattstrasse', buildingNumber: '12' }
    const document = h(InvoiceDocument, { ...invoice, payment: { ...invoice.payment, creditor: realistic }, lines: lines.slice(0, length) })
    await render(h('main', {}, h('nav', {}, 'Application commands'), h('section', {}, h('button', {}, 'Print'), document), h('footer', {}, 'Other invoices')))
    await page.emulateMedia({ media: 'screen' })
    assert.equal(await page.getByRole('heading', { name: 'Rechnung AN-104' }).count(), 1)
    assert.equal(await page.locator('.al-invoice-running').isVisible(), false)
    await page.emulateMedia({ media: 'print' })
    assert.equal(await page.getByText('Application commands').isVisible(), false)
    assert.equal(await page.getByText('Other invoices').isVisible(), false)
    if (length % 2 === 0) {
      await page.addScriptTag({ content: helper.outputFiles[0].text })
      await page.evaluate(() => { window.print = () => {}; documents.printSwissDocument(document.querySelector('article')) })
    }
    const slip = await page.locator('.al-bill-slip').boundingBox()
    mm(slip.width, 210); mm(slip.height, 105)
    assert.equal(await page.locator('.al-invoice-items tbody tr').count(), length)
    const amounts = await page.locator('.al-invoice-items tbody tr:first-child td:nth-child(3), .al-invoice-items tbody tr:first-child td:last-child').evaluateAll(cells =>
      cells.map(cell => ({ alignment: getComputedStyle(cell).textAlign, figures: getComputedStyle(cell).fontVariantNumeric })))
    assert.equal(amounts.length, 2)
    assert.ok(amounts.every(cell => ['end', 'right'].includes(cell.alignment) && cell.figures.includes('tabular-nums')))
    await marker('.al-bill-slip')
    if (length === 120) await page.locator('.al-invoice-running strong').evaluate(title => {
      const link = document.createElement('a')
      link.dataset.pdfMeasure = ''
      link.href = 'https://geometry.example/title'
      link.textContent = title.textContent
      title.replaceChildren(link)
    })
    const pageCount = await pages({ x: 0, y: 192 }, length === 120)
    if (length <= 8) assert.equal(pageCount, 1)
    else assert.ok(pageCount > 1)
  }
  const slotNames = ['logo', 'intro', 'paymentTerms', 'notes', 'footer']
  const slots = Object.fromEntries(slotNames.map(name => [name, h('a', {
    href: 'https://invoice.example/' + name, 'data-pdf-measure': '',
  }, name)]))
  await render(h(InvoiceDocument, { ...invoice, ...slots, lines: lines.slice(0, 3), locale: 'it-CH' }))
  await marker('.al-bill-slip')
  assert.equal(await pages({ x: 0, y: 192 }), 1)
  const correspondencePdf = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString('latin1')
  for (const name of slotNames) assert.ok(correspondencePdf.includes('https://invoice.example/' + name), name + ' prints with the invoice')
  const denseParty = { ...party, name: 'W'.repeat(70), street: 'W'.repeat(70), buildingNumber: 'W'.repeat(16), town: 'W'.repeat(35) }
  const denseLines = lines.slice(0, 4).map(line => ({ ...line, description: 'W'.repeat(48), quantity: '40000.0001' }))
  for (const locale of ['de-CH', 'fr-CH', 'it-CH', 'rm-CH', 'en']) {
    await render(h(InvoiceDocument, { ...invoice, locale, invoiceNumber: 'W'.repeat(32), lines: denseLines,
      payment: { ...invoice.payment, creditor: denseParty, debtor: denseParty } }))
    await marker('.al-bill-slip')
    await pages({ x: 0, y: 192 })
  }
  const boundary = { ...party, name: 'W'.repeat(32), street: 'W'.repeat(32), buildingNumber: 'W'.repeat(8), town: 'W'.repeat(24) }
  const shortLines = lines.slice(0, 3).map(line => ({ ...line, description: 'W'.repeat(32), quantity: 4000 }))
  await render(h(InvoiceDocument, { ...invoice, locale: 'it-CH', lines: shortLines, payment: { ...invoice.payment, creditor: boundary, debtor: boundary } }))
  await marker('.al-bill-slip')
  assert.equal(await pages({ x: 0, y: 192 }), 1)
  await render(h('main', {}, h('h1', {}, 'Account portal'), h(Letter, letterProps, 'Correspondence')))
  await page.addScriptTag({ content: helper.outputFiles[0].text })
  await page.evaluate(() => { window.print = () => {}; documents.printSwissDocument(document.querySelector('article')) })
  assert.equal(await page.getByText('Account portal').isVisible(), false)
  assert.equal(await pages(), 1)
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  assert.equal(await page.getByText('Account portal').isVisible(), false)
  await render(h('main', {}, h('section', {}, h(Letter, letterProps, 'Correspondence')),
    h('section', {}, h(InvoiceDocument, { ...invoice, lines: lines.slice(0, 8) }))))
  await page.addScriptTag({ content: helper.outputFiles[0].text })
  await page.addStyleTag({ content: '@media print { .al-invoice-content { height: var(--al-invoice-extent); } }' })
  await page.evaluate(() => {
    const supports = CSS.supports.bind(CSS)
    CSS.supports = (property, value) => value?.includes('calc-size(') ? false : supports(property, value)
    window.print = () => {}
    documents.printSwissDocument(document.querySelector('.al-invoice-document'))
  })
  assert.equal(await page.locator('.al-letter').isVisible(), false, 'The explicit helper prints only the selected invoice')
  assert.equal(await page.locator('[data-al-invoice-measured]').count(), 1)
  await marker('.al-bill-slip')
  assert.equal(await pages({ x: 0, y: 192 }), 1)
  await page.emulateMedia({ media: null })
  const evidence = name => h('a', { href: 'https://visibility.example/' + name }, name)
  const hiddenInvoice = h(InvoiceDocument, { ...invoice, lines: lines.slice(0, 3), footer: evidence('invoice') })
  async function printedLinks(visible, absent) {
    const pdf = (await page.pdf({ preferCSSPageSize: true })).toString('latin1')
    for (const name of visible) assert.ok(pdf.includes('https://visibility.example/' + name), 'Expected printed content: ' + name)
    for (const name of absent) assert.ok(!pdf.includes('https://visibility.example/' + name), 'Unexpected printed content: ' + name)
  }
  for (const inactive of [h('section', { hidden: true }, hiddenInvoice), h('dialog', {}, hiddenInvoice),
    h('details', {}, h('summary', {}, 'Archived'), hiddenInvoice)]) {
    await render(h('main', {}, evidence('orders'), inactive))
    await printedLinks(['orders'], ['invoice'])
    await render(h('main', {}, evidence('orders'), inactive, h(Letter, letterProps, evidence('letter'))))
    await printedLinks(['letter'], ['orders', 'invoice'])
  }
  await render(h('main', {}, evidence('orders'), h('section', { id: 'invoice-panel', className: 'inactive' }, h('div', { id: 'invoice-mount' }))))
  await page.addStyleTag({ content: '.inactive { display: none }' })
  await page.addScriptTag({ content: helper.outputFiles[0].text })
  await page.evaluate(props => documents.mountInvoice(document.querySelector('#invoice-mount'), props), { ...invoice, lines: lines.slice(0, 3) })
  await page.locator('body[data-al-document-managed]').waitFor({ state: 'attached' })
  await printedLinks(['orders'], ['invoice'])
  await page.locator('#invoice-panel').evaluate(el => { el.className = '' })
  await printedLinks(['invoice'], ['orders'])
  await page.locator('#invoice-panel').evaluate(el => { el.className = 'inactive' })
  await printedLinks(['orders'], ['invoice'])
  console.log('Verified Swiss window and fold geometry, A4 pagination, isolated printing and final QR positioning.')
} finally { await browser.close() }
