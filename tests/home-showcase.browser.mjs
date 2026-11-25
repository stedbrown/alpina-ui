import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const site = new URL('../site/', import.meta.url)
const origin = 'https://alpina.test'
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executable ? { executablePath: executable } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)

async function homepage(javaScriptEnabled) {
  const page = await browser.newPage({ javaScriptEnabled })
  await page.route(origin + '/**', route => {
    const { pathname } = new URL(route.request().url())
    const file = pathname === '/' ? 'index.html' : pathname.slice(1)
    return route.fulfill({ path: fileURLToPath(new URL(file, site)) })
  })
  await page.goto(origin)
  return page
}

async function checkSecondWeek(chart) {
  await chart.getByText('View hours as a table', { exact: true }).press('Enter')
  const table = chart.getByRole('table', { name: 'Hours on press' })
  assert.deepEqual(await table.getByRole('cell').allTextContents(), ['6', '5', '8', '7', '4'])
}

try {
  const page = await homepage(true)
  const estimate = page.getByRole('region', { name: 'Poster estimate' })
  const slider = estimate.getByRole('slider', { name: 'Edition size' })
  const ink = estimate.getByRole('switch', { name: 'Add a second ink' })
  await slider.press('ArrowRight')
  assert.equal(await slider.getAttribute('aria-valuetext'), '125 copies')
  assert.match(await estimate.getByRole('status').innerText(), /CHF\s*174\.00/)
  await ink.press('Space')
  assert.ok(await ink.isChecked())
  assert.match(await estimate.getByRole('status').innerText(), /CHF\s*224\.00/)

  const log = page.getByRole('region', { name: 'Press log' })
  await log.getByRole('combobox', { name: 'Reporting week' }).press('End')
  await checkSecondWeek(log.getByRole('figure', { name: 'Hours on press' }))
  const invoice = page.getByRole('region', { name: 'Invoice AP-104' })
  await invoice.getByRole('tab', { name: 'German' }).press('ArrowRight')
  assert.ok(await invoice.getByRole('tabpanel').getByText('Montant total').isVisible())

  const staticPage = await homepage(false)
  const staticEstimate = staticPage.getByRole('region', { name: 'Poster estimate' })
  assert.ok(await staticEstimate.getByText('100 copies · Black ink').isVisible())
  assert.match(await staticEstimate.getByRole('status').innerText(), /CHF\s*144\.00/)
  assert.equal(await staticEstimate.getByRole('slider').count(), 0)

  const staticLog = staticPage.getByRole('region', { name: 'Press log' })
  await staticLog.getByText('22–26 March 2027', { exact: true }).press('Enter')
  await checkSecondWeek(staticLog.getByRole('figure', { name: 'Hours on press' }))
  const staticInvoice = staticPage.getByRole('region', { name: 'Invoice AP-104' })
  await staticInvoice.getByText('Italian', { exact: true }).press('Enter')
  assert.ok(await staticInvoice.getByText('Totale fattura').isVisible())
  console.log('Homepage print estimate, weekly chart and localized invoice passed keyboard and static checks.')
} finally {
  await browser.close()
}
