import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { SwissQrBill, buildSwissQrPayload } from 'alpina-ui'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const bill = { iban: 'CH5800791123000889012', currency: 'CHF', amount: '211.00',
  creditor: { name: 'Atelier Étude', street: 'Rue du Lac', buildingNumber: '3', postalCode: '1003', town: 'Lausanne', country: 'CH' },
  reference: { type: 'SCOR', value: 'RF18539007547034' }, message: 'Édition 42' }
const css = await readFile(new URL(import.meta.resolve('alpina-ui/styles.css')), 'utf8')
const browser = await launchBrowser()
try {
  const fixture = await browser.newPage({ viewport: { width: 1000, height: 1200 }, deviceScaleFactor: 3 })
  const slip = renderToStaticMarkup(createElement(SwissQrBill, { bill, printLayout: 'inline', locale: 'en' }))
  await fixture.setContent('<!doctype html><style>' + css + '</style>' + slip)
  const png = await fixture.locator('.al-bill-payment').screenshot()
  // Put only the rasterized slip in the PDF. There is no selectable payment text.
  await fixture.setContent('<style>@page{size:A4;margin:0}body{margin:0}section{height:200mm;break-after:page}img{width:148mm;display:block}</style><section>Invoice items</section><img src="data:image/png;base64,' + png.toString('base64') + '">')
  await fixture.locator('img').evaluate(img => img.decode())
  const pdf = await fixture.pdf({ preferCSSPageSize: true, printBackground: true })
  await fixture.close()

  const files = [['invoice.png', 'image/png', png], ['invoice.pdf', 'application/pdf', pdf]]
  // Identical synthetic payment data encoded as CCITT Group 4 and JPEG 2000 scans.
  for (const name of ['qr-fax.pdf', 'qr-jpeg2000.pdf'])
    files.push([name, 'application/pdf', await readFile(new URL('./fixtures/' + name, import.meta.url))])

  for (const offline of [false, true]) {
    const page = offline ? await browser.newPage() : await openPublicPage(browser)
    const disallowed = [], codecs = []
    await page.addInitScript(() => { Object.defineProperty(window, 'BarcodeDetector', { value: undefined, configurable: true }) })
    page.on('request', req => {
      if (/qr-reader-(?:image|pdf)\.internal-/.test(req.url())) codecs.push(req.url())
      if ((offline && /^https?:/.test(req.url())) || (!offline && /^https?:/.test(req.url()) && !req.url().startsWith(siteOrigin + '/')) || req.method() !== 'GET')
        disallowed.push(req.method() + ' ' + req.url())
    })
    if (offline) await page.context().setOffline(true)
    await page.goto(offline ? new URL('../site/catalog.html#qr-bill-scanner', import.meta.url).href : siteOrigin + '/docs/components/qr-bill-scanner/')
    const scanner = page.getByRole('region', { name: 'Scan a payment slip' })
    const file = scanner.getByLabel('Choose an image or PDF')
    assert.deepEqual(codecs, [], 'No decoder is fetched just to display the scanner')
    for (const [name, mimeType, buffer] of files) {
      await file.setInputFiles({ name, mimeType, buffer })
      await scanner.getByRole('heading', { name: 'Review payment details' }).waitFor()
      if (!offline && name.endsWith('.png')) {
        assert.ok(codecs.some(url => url.includes('qr-reader-image.internal-')))
        assert.ok(!codecs.some(url => url.includes('qr-reader-pdf.internal-')))
      }
      assert.match(await scanner.innerText(), /Atelier Étude/)
      assert.match(await scanner.innerText(), /CHF\s211\.00/)
      assert.equal(await scanner.getByText('SCOR · RF18 5390 0754 7034', { exact: true }).count(), 1)
      if (name.endsWith('pdf')) assert.equal(await scanner.locator('dt').filter({ hasText: 'PDF page' }).locator('..').locator('dd').innerText(), name === 'invoice.pdf' ? '2' : '1')
      await scanner.getByRole('button', { name: 'Confirm details' }).press('Enter')
      await scanner.getByText('Payment details confirmed.', { exact: true }).waitFor()
      await scanner.getByRole('button', { name: 'Scan another slip' }).press('Enter')
      assert.ok(await file.evaluate(el => el === document.activeElement))
    }
    await file.setInputFiles({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.7\n') })
    await scanner.getByRole('alert').waitFor()
    assert.equal(await scanner.getByRole('button', { name: 'Confirm details' }).count(), 0)
    await scanner.getByRole('button', { name: 'Use camera' }).press('Enter')
    await scanner.getByText('Camera scanning is unavailable. Choose an image or PDF.').waitFor()
    assert.deepEqual(disallowed, [])
    await page.close()
  }

  const phone = await openPublicPage(browser)
  await phone.addInitScript(payload => {
    window.cameraState = { requested: 0, stopped: 0, raw: '' }
    window.samplePayload = payload
    window.BarcodeDetector = class {
      static getSupportedFormats() { return Promise.resolve(['qr_code']) }
      detect() { return Promise.resolve(window.cameraState.raw ? [{ rawValue: window.cameraState.raw }] : []) }
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: async () => {
      window.cameraState.requested++
      const stream = canvas.captureStream(5)
      const track = stream.getVideoTracks()[0], stop = track.stop.bind(track)
      const draw = setInterval(() => ctx.fillRect(0, 0, 1, 1), 80)
      track.stop = () => { clearInterval(draw); window.cameraState.stopped++; stop() }
      return stream
    } })
  }, buildSwissQrPayload({ ...bill, iban: 'CH4431999123000889012', reference: { type: 'QRR', value: '210000000003139471430009017' } }))
  await phone.goto(siteOrigin + '/docs/components/qr-bill-scanner/')
  const scanner = phone.getByRole('region', { name: 'Scan a payment slip' })
  assert.equal(await phone.evaluate(() => window.cameraState.requested), 0)
  const camera = scanner.getByRole('button', { name: 'Use camera' })
  await camera.press('Enter')
  await phone.waitForFunction(() => document.querySelector('video')?.readyState >= 2)
  await scanner.getByRole('button', { name: 'Cancel scan' }).press('Escape')
  assert.equal(await phone.evaluate(() => window.cameraState.stopped), 1)
  await phone.evaluate(() => { window.cameraState.raw = window.samplePayload + '\ninvalid billing information' })
  await camera.press('Enter')
  await scanner.getByRole('heading', { name: 'Review payment details' }).waitFor()
  assert.equal(await scanner.getByText('QRR · 21 00000 00003 13947 14300 09017', { exact: true }).count(), 1)
  assert.equal(await phone.evaluate(() => window.cameraState.stopped), 2)
  assert.match(await scanner.innerText(), /Additional information omitted/)
  assert.match(await scanner.innerText(), /Line 32/)
  assert.equal(await scanner.getByText('Payment details confirmed.', { exact: true }).count(), 0)
  const app = await build({ stdin: { contents: [
    'import { createRoot } from "react-dom/client"',
    'import { createElement } from "react"',
    'import { QrBillScanner, preloadQrBillScanner } from "alpina-ui"',
    'window.confirmedBills = []',
    'document.querySelector("#warm").onclick = async (event) => { const button=event.currentTarget; await preloadQrBillScanner(); button.textContent="Offline ready" }',
    'createRoot(document.querySelector("main")).render(createElement(QrBillScanner,{locale:"rm-CH",onConfirm:bill=>window.confirmedBills.push(bill)}))',
  ].join('\n'), resolveDir: process.cwd() }, bundle: true, splitting: true, format: 'esm', conditions: ['alpina-scanner-chunk'],
    minify: true, outdir: 'scanner-fixture', entryNames: 'scanner', write: false, define: { 'process.env.NODE_ENV': '"production"' } })
  const consumer = await browser.newPage({ viewport: { width: 320, height: 800 } })
  const origin = 'https://preload.alpina.test'
  let disconnected = false
  const attempts = []
  await consumer.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (disconnected || url.origin !== origin) { attempts.push(url.href); return route.abort() }
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body:
      '<html lang="rm-CH"><style>' + css + '</style><button id="warm">Prepare offline</button><main></main><script type="module" src="/scanner.js"></script></html>' })
    const asset = app.outputFiles.find(file => file.path.replaceAll('\\', '/').endsWith(url.pathname))
    assert.ok(asset, url.pathname)
    return route.fulfill({ contentType: 'text/javascript', body: Buffer.from(asset.contents) })
  })
  await consumer.goto(origin)
  await consumer.getByRole('button', { name: 'Prepare offline' }).click()
  await consumer.getByRole('button', { name: 'Offline ready' }).waitFor()
  disconnected = true
  await consumer.context().setOffline(true)
  const upload = consumer.getByLabel('Tscherner in maletg u in PDF')
  await upload.setInputFiles({ name: 'invoice.png', mimeType: 'image/png', buffer: png })
  await consumer.getByRole('heading', { name: 'Controllar las datas da pajament' }).waitFor()
  assert.deepEqual(await consumer.evaluate(() => window.confirmedBills), [])
  assert.match(await consumer.locator('main').innerText(), /CHF\s211,00/)
  assert.equal(await consumer.getByText('SCOR · RF18 5390 0754 7034', { exact: true }).count(), 1)
  await consumer.locator('html').evaluate(el => el.style.fontSize = '200%')
  assert.ok(await consumer.locator('.al-qr-value').evaluateAll(elements => elements.every(el => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return range.getClientRects().length === 1
  })))
  await consumer.getByRole('button', { name: 'Confermar las datas' }).press('Enter')
  const accepted = await consumer.evaluate(() => window.confirmedBills)
  assert.deepEqual(accepted.map(buildSwissQrPayload), [buildSwissQrPayload(bill)])
  await upload.setInputFiles({ name: 'invoice.pdf', mimeType: 'application/pdf', buffer: pdf })
  await consumer.getByRole('heading', { name: 'Controllar las datas da pajament' }).waitFor()
  assert.match(await consumer.locator('main').innerText(), /Pagina dal PDF/)
  assert.deepEqual(attempts, [], 'The preloaded consumer must not request anything while scanning files')
  await consumer.close()
  console.log('Read real PNG and multipage raster PDF bills entirely offline and on the hosted scanner, including camera consent, release and explicit confirmation.')
} finally { await browser.close() }
