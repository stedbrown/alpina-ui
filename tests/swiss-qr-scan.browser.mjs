import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { chromium } from 'playwright-core'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SwissQrBill } from 'alpina-ui'

const bill = {
  iban: 'CH5800791123000889012',
  creditor: { name: 'Atelier Étude', street: 'Rue du Lac', buildingNumber: '3', postalCode: '1003', town: 'Lausanne', country: 'CH' },
  debtor: { name: 'Büro Süd', street: 'Brunnenweg', buildingNumber: '4', postalCode: '3000', town: 'Bern', country: 'CH' },
  amount: '211', currency: 'CHF', message: 'Édition 42',
}
// Independent of the library serializer. Blank fields and line endings are
// significant even when the scanned payment information looks identical.
const expected = [
  'SPC', '0200', '1', 'CH5800791123000889012',
  'S', 'Atelier Étude', 'Rue du Lac', '3', '1003', 'Lausanne', 'CH',
  '', '', '', '', '', '', '', '211.00', 'CHF',
  'S', 'Büro Süd', 'Brunnenweg', '4', '3000', 'Bern', 'CH', 'NON', '', 'Édition 42', 'EPD',
].join('\n')
const stylesheet = await readFile(new URL(import.meta.resolve('alpina-ui/styles.css')), 'utf8')
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage({ deviceScaleFactor: 3, viewport: { width: 1000, height: 1300 } })
  await page.emulateMedia({ media: 'print' })
  const markup = renderToStaticMarkup(createElement(SwissQrBill, { bill, locale: 'it-CH' }))
  await page.setContent('<!doctype html><html><head><style>' + stylesheet + '</style></head><body>' + markup + '</body></html>')
  await page.addScriptTag({ path: createRequire(import.meta.url).resolve('jsqr') })
  const mark = page.getByRole('img', { name: 'Swiss QR Code' })
  const box = await mark.boundingBox()
  assert.ok(box)
  const pxPerMm = box.width / 46
  const pad = 5 * pxPerMm
  const left = Math.floor(box.x - pad)
  const top = Math.floor(box.y - pad)
  const clip = { x: left, y: top, width: Math.ceil(box.x + box.width + pad) - left, height: Math.ceil(box.y + box.height + pad) - top }
  const png = await page.screenshot({ clip, scale: 'device', animations: 'disabled' })

  const scan = await page.evaluate(async ({ png, clip, box }) => {
    const image = new Image()
    image.src = 'data:image/png;base64,' + png
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
    const decoded = window.jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'dontInvert' })
    // Read black corners and white strokes from the actual printed cross.
    // Coordinates are millimetres from the center of the 46 mm symbol.
    function intensity(dx, dy) {
      const x = Math.floor((box.x - clip.x + box.width * (0.5 + dx / 46)) * image.width / clip.width)
      const y = Math.floor((box.y - clip.y + box.height * (0.5 + dy / 46)) * image.height / clip.height)
      return pixels.data[4 * (y * image.width + x)]
    }
    return {
      text: decoded?.data,
      bytes: decoded?.binaryData,
      version: decoded?.version,
      dark: [[-2, -2], [2, -2], [2, 2], [-2, 2]].map(([x, y]) => intensity(x, y)),
      light: [[0, 0], [1.4, 0], [-1.4, 0], [0, 1.4], [0, -1.4], [3.3, 0]].map(([x, y]) => intensity(x, y)),
    }
  }, { png: png.toString('base64'), clip, box })
  assert.equal(scan.text, expected)
  assert.deepEqual(Buffer.from(scan.bytes), Buffer.from(expected, 'utf8'))
  assert.equal(scan.version, 9)
  assert.ok(scan.dark.every(value => value < 30), 'printed dark field behind the cross')
  assert.ok(scan.light.every(value => value > 225), 'printed white cross and keyline')
  console.log('The printed Swiss QR Code and recognition mark decode to the expected UTF-8 payment fields.')
} finally {
  await browser.close()
}
