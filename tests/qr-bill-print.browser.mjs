import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'
import { PNG } from 'pngjs'
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
  // Both scissors are centred on their perforation: the horizontal line along the top of the slip and
  // the vertical line between the receipt and the payment part.
  const scissors = await page.locator('#first .al-bill-slip').evaluate(slip => {
    const receipt = slip.querySelector('.al-bill-receipt')
    const box = (element, pseudo) => {
      const style = getComputedStyle(element, pseudo), matrix = new DOMMatrix(style.transform)
      const width = parseFloat(style.width), height = parseFloat(style.height)
      return { style, matrix, width, height }
    }
    const top = box(slip, '::after'), side = box(receipt, '::before')
    return {
      content: [top.style.content, side.style.content],
      square: [top.width === top.height, side.width === side.height],
      centre: parseFloat(top.style.top) + top.matrix.f + top.height / 2,
      left: parseFloat(top.style.left),
      across: receipt.getBoundingClientRect().width - parseFloat(side.style.right) - side.width + side.matrix.e + side.width / 2 - receipt.getBoundingClientRect().width,
      down: parseFloat(side.style.top),
      quarter: Math.round(Math.atan2(side.matrix.b, side.matrix.a) * 180 / Math.PI),
    }
  })
  assert.deepEqual(scissors.content, ['""', '""'], 'The scissors are drawn shapes, not font glyphs with uneven side bearings.')
  assert.deepEqual(scissors.square, [true, true])
  assert.ok(Math.abs(scissors.centre) < .5, 'The top scissors sit centred on the horizontal perforation.')
  assert.ok(Math.abs(scissors.left / mm - 5) < .05, 'The top scissors align with the 5 mm margin.')
  assert.ok(Math.abs(scissors.across) < .5, 'The receipt scissors sit centred on the vertical perforation.')
  assert.ok(Math.abs(scissors.down / mm - 5) < .05, 'The receipt scissors sit 5 mm below the top edge.')
  assert.equal(scissors.quarter, 90, 'The receipt scissors cut downwards along the vertical perforation.')
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
  for (const width of [320, 360]) {
    await page.setViewportSize({ width, height: 800 })
    for (const theme of ['light', 'dark']) {
      await page.setContent(doc(print(bill, 'slip')))
      await page.evaluate(theme => { document.documentElement.dataset.alTheme = theme }, theme)
      const reader = page.locator('.al-bill-reading')
      const summary = reader.getByText('Read payment details', { exact: true })
      // The first glyph is a browser marker without a DOM box. Inspect its actual ink
      // between the control's leading edge and the first letter of its text.
      const textStart = await summary.evaluate(el => {
        const range = document.createRange()
        range.selectNodeContents(el)
        return Math.floor(range.getBoundingClientRect().left - el.getBoundingClientRect().left)
      })
      const pixels = PNG.sync.read(await summary.screenshot())
      const ink = []
      for (let x = 0; x < textStart; x++) {
        for (let y = 2; y < pixels.height - 2; y++) {
          const red = pixels.data[(y * pixels.width + x) * 4]
          if (theme === 'light' ? red < 90 : red > 165) { ink.push(x); break }
        }
      }
      assert.ok(ink.length >= 4 && ink[0] >= 8, `${width}px ${theme}: disclosure marker inside the gutter, got ink at ${ink}`)
      await summary.press('Enter')
      assert.equal(await reader.getAttribute('open'), '')
      assert.ok(await reader.getByText('Atelier', { exact: true }).isVisible())
      assert.ok(await summary.evaluate(el => el.matches(':focus-visible') && getComputedStyle(el).outlineStyle !== 'none'))
      await summary.press('Space')
      assert.equal(await reader.getAttribute('open'), null)
    }
  }
  console.log('Verified readable mobile payment details, keyboard enlargement and physical A4 output.')
} finally {
  await browser.close()
}
