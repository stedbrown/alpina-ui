import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SwissQrBill } from 'alpina-ui'

const css = await readFile(new URL(import.meta.resolve('alpina-ui/styles.css')), 'utf8')
const fixture = await build({
  stdin: {contents: "import { printSwissQrBill } from 'alpina-ui'; window.printSlip = printSwissQrBill",
    resolveDir: fileURLToPath(new URL('../', import.meta.url))},
  bundle: true, write: false, define: { 'process.env.NODE_ENV': '"production"' },
})
const bill = {
  iban: 'CH5800791123000889012', currency: 'CHF',
  creditor: {name: 'Atelier', postalCode: '6000', town: 'Luzern', country: 'CH'},
}
const print = (data, id, locale = 'en') => renderToStaticMarkup(createElement(SwissQrBill, {bill: data, id, locale}))
const long = {name: 'W'.repeat(70), street: 'W'.repeat(70), buildingNumber: 'W'.repeat(16),
  postalCode: 'W'.repeat(16), town: 'W'.repeat(35), country: 'LI'}
const full = { ...bill, creditor: long, debtor: long, amount: '999999999.99', message: 'W'.repeat(140),
  reference: {type: 'SCOR', value: 'RF18539007547034'}, alternativeProcedures: ['TW/example'] }
const doc = content => '<!doctype html><style>' + css + '</style><body>' + content + '</body>'
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? {executablePath} : existsSync(chromium.executablePath()) ? {} : {channel: 'chrome'})
try {
  const page = await browser.newPage({viewport:{width:1100,height:1300}})
  await page.emulateMedia({media:'print'})
  const first = print(bill, 'first', 'rm-CH')
  const second = print(full, 'second')
  await page.setContent(doc(first + second))
  assert.ok(await page.getByRole('heading', {name: 'Quittanza'}).isVisible())
  const mm = 96 / 25.4
  const bounds = await page.locator('#first .al-bill-slip').boundingBox()
  assert.ok(Math.abs(bounds.y/mm - 192) < .05)
  assert.ok(Math.abs(bounds.width/mm - 210) < .05 && Math.abs(bounds.height/mm - 105) < .05)
  for (const [part, width] of [['receipt',62],['payment',148],['qr',46]]) {
    const box = await page.locator('#first .al-bill-' + part).boundingBox()
    assert.ok(Math.abs(box.width/mm - width) < .05)
  }
  const blanks = await page.locator('#first svg.al-bill-blank').evaluateAll(elements => elements.map(e => [e.getAttribute('width'), e.getAttribute('height')]))
  assert.deepEqual(blanks, [['52mm','20mm'],['30mm','10mm'],['40mm','15mm'],['65mm','25mm']])
  const fits = await page.locator('#second').evaluate(node => {
    const bounds = selector => node.querySelector(selector).getBoundingClientRect()
    return bounds('.al-bill-receipt .al-bill-entry:last-child').bottom <= bounds('.al-bill-receipt .al-bill-amount').top + 1 &&
      bounds('.al-bill-payment .al-bill-details').bottom < bounds('.al-bill-procedures').top
  })
  assert.ok(fits, 'Long addresses and supplementary text must fit without covering other sections.')
  async function pages() {
    const pdf = (await page.pdf({preferCSSPageSize:true, printBackground:true})).toString('latin1')
    const size = pdf.match(/\/MediaBox\s*\[0\s+0\s+([\d.]+)\s+([\d.]+)\]/)
    assert.ok(size && Math.abs(Number(size[1]) - 595.28) < 1 && Math.abs(Number(size[2]) - 841.89) < 1)
    return (pdf.match(/\/Type\s*\/Page\b/g) ?? []).length
  }
  assert.equal(await pages(), 2, 'Each standalone slip gets one A4 page.')

  await page.setContent(doc('<header>Catalog navigation</header><div style="padding:28px"><main><h1>Invoices</h1>' + first + second + '</main></div>'))
  await page.addScriptTag({content:fixture.outputFiles[0].text})
  await page.evaluate(() => { window.print = () => {}; window.printSlip(document.getElementById('second')) })
  assert.equal(await page.getByText('Catalog navigation').isVisible(), false)
  assert.equal(await page.locator('#first').isVisible(), false)
  assert.ok(await page.locator('#second').isVisible())
  assert.equal(await pages(), 1, 'The selected slip prints on its own from a nested application.')
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  assert.equal(await page.locator('[data-al-qr-print-path], [data-al-qr-print-target]').count(), 0)
  assert.ok(await page.getByText('Catalog navigation').isVisible())
  for (const fit of [false, true]) {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.emulateMedia({ media: 'screen' })
    const data = { ...full, creditor: bill.creditor, debtor: undefined, amount: '1234.56' }
    await page.setContent(doc(renderToStaticMarkup(createElement(SwissQrBill, { bill: data, fit, locale: 'it-CH' }))))
    const highlights = page.locator('.al-bill-highlights')
    for (const value of ['CHF 1’234.56', 'Atelier', 'CH58 0079 1123 0008 8901 2', 'RF18 5390 0754 7034']) {
      const field = highlights.getByText(value, { exact: true })
      assert.ok(await field.isVisible(), value)
      const bounds = await field.boundingBox()
      assert.ok(bounds.width > 0 && bounds.x + bounds.width <= 360)
      assert.ok(await field.evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 16))
    }
    const slip = page.locator('.al-bill-slip')
    const small = await slip.boundingBox()
    assert.ok(small.width <= 360 && small.y >= (await highlights.boundingBox()).height)
    const zoom = page.getByRole('checkbox', { name: 'Ingrandisci la cedola' })
    await zoom.press('Space')
    assert.ok(await zoom.isChecked())
    assert.ok(Math.abs((await slip.boundingBox()).width/mm - 210) < .05)
    await page.keyboard.press('Tab')
    const viewport = page.getByRole('region', { name: 'Ricevuta / Sezione pagamento' })
    assert.ok(await viewport.evaluate(el => el === document.activeElement))
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('.al-qr-bill').scrollLeft > 0)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.emulateMedia({ media: 'print' })
    assert.equal(await highlights.isVisible(), false)
    assert.equal(await zoom.isVisible(), false)
    const actual = await slip.boundingBox()
    assert.ok(Math.abs(actual.width/mm - 210) < .05 && Math.abs(actual.height/mm - 105) < .05)
    assert.equal(await pages(), 1)
    await page.emulateMedia({ media: 'screen' })
    await zoom.press('Space')
    assert.ok((await slip.boundingBox()).width <= 360)
    await page.setViewportSize({ width: 1000, height: 900 })
    assert.equal(await highlights.isVisible(), false)
    assert.equal(await zoom.isVisible(), false)
  }
  console.log('Verified readable mobile payment details, keyboard enlargement and physical A4 output.')
} finally {
  await browser.close()
}
