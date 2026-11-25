import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const site = new URL('../site/', import.meta.url)
const origin = 'https://alpina.test'
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executable ? { executablePath: executable } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)

async function homepage({ javaScriptEnabled = true, viewport, beforeModule } = {}) {
  const page = await browser.newPage({ javaScriptEnabled, viewport })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.route(origin + '/**', async route => {
    const { pathname } = new URL(route.request().url())
    if (beforeModule && /^\/assets\/showcase-[\w-]+\.js$/.test(pathname)) await beforeModule()
    const file = pathname === '/' ? 'index.html' : pathname.slice(1)
    return route.fulfill({ path: fileURLToPath(new URL(file, site)) })
  })
  await page.goto(origin, { waitUntil: beforeModule ? 'commit' : 'load' })
  return { page, errors }
}

const samples = ['#interfaces [data-landing-island="dashboard"]', '#swiss [data-landing-island="swiss"]',
  '#qr-bill [data-home-slip] .al-bill-slip', '#agents [data-landing-island="skill"]', '#agents [data-landing-island="mcp"]']

// The server-rendered samples reserve their final size, so hydrating them never shifts the page.
async function verifyStableGeometry(viewport) {
  let release, requested
  const gate = new Promise(resolve => { release = resolve })
  const entered = new Promise(resolve => { requested = resolve })
  const { page } = await homepage({ viewport, beforeModule: async () => { requested(); await gate } })
  const measure = list => list.map(selector => {
    const box = document.querySelector(selector)?.getBoundingClientRect()
    if (!box?.width || !box?.height) throw Error('Missing homepage sample: ' + selector)
    return [selector, Math.round(box.x), Math.round(box.y + scrollY), Math.round(box.width), Math.round(box.height)]
  })
  try {
    await entered
    await page.waitForFunction(() => document.querySelector('link[rel="stylesheet"][href*="/fonts-"]')?.sheet)
    await page.evaluate(() => document.fonts.ready)
    const first = await page.evaluate(measure, samples)
    release()
    await page.waitForLoadState('load')
    for (const selector of samples) {
      await page.locator(selector).scrollIntoViewIfNeeded()
      await page.waitForTimeout(150)
    }
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    assert.deepEqual(await page.evaluate(measure, samples), first, 'Hydrating the homepage samples moved the layout at ' + viewport.width + ' px')
  } finally {
    release()
    await page.close()
  }
}

try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1350, height: 940 }]) await verifyStableGeometry(viewport)

  const { page, errors } = await homepage({ viewport: { width: 1440, height: 940 } })
  const chapter = id => page.locator('#' + id)
  const ready = async (id, name) => {
    await chapter(id).scrollIntoViewIfNeeded()
    await page.locator('#' + id + ' [data-landing-island="' + name + '"][data-landing-ready]').waitFor({ state: 'attached' })
  }
  assert.deepEqual(await page.locator('main > section h2[id]').evaluateAll(nodes => nodes.map(node => node.textContent)), [
    'Real interfaces', 'Built for Switzerland', 'A real QR-bill', 'The grid', 'Made to be relied on',
    'From shadcn/ui', 'Ready for AI agents', 'Install in 30 seconds',
  ])

  // 02 — the dashboard block filters and sorts once it hydrates.
  const dashboard = chapter('interfaces')
  await ready('interfaces', 'dashboard')
  const register = dashboard.locator('table').last()
  assert.equal(await register.locator('tbody tr').count(), 5)
  await dashboard.getByLabel('Find a client').fill('Pigna')
  await page.waitForFunction(() => [...document.querySelectorAll('#interfaces table')].at(-1).querySelectorAll('tbody tr').length === 2)
  assert.ok((await register.locator('tbody tr').allTextContents()).every(row => row.includes('Studio Pigna')))

  // 03 — a postcode finds its town and canton, the language changes every label and the holidays follow the canton.
  const swiss = chapter('swiss')
  await ready('swiss', 'swiss')
  await swiss.getByRole('textbox', { name: 'Postleitzahl' }).fill('6900')
  await page.waitForFunction(() => document.querySelector('#swiss input[name="town"]').value === 'Lugano')
  await swiss.getByRole('button', { name: 'Italiano' }).click()
  assert.equal(await swiss.getByRole('combobox', { name: 'Cantone' }).inputValue(), 'TI')
  await swiss.getByRole('textbox', { name: 'Numero AVS' }).fill('756.1234.5678.97')
  await swiss.getByRole('textbox', { name: 'Numero AVS' }).press('Tab')
  await page.waitForFunction(() => [...document.querySelectorAll('#swiss dd')].filter(dd => dd.textContent.includes('Valido')).length === 2)
  assert.match(await swiss.innerText(), /Prossimi giorni festivi · TI/)

  // 04 — the QR code is re-encoded from the typed amount.
  const qr = chapter('qr-bill')
  await ready('qr-bill', 'qr')
  const code = () => qr.locator('svg path').first().getAttribute('d')
  const original = await code()
  await qr.getByRole('textbox', { name: 'Amount in CHF' }).fill('1250.40')
  await page.waitForFunction(() => /1.250\.40/.test(document.querySelector('#qr-bill [aria-live]').textContent))
  assert.notEqual(await code(), original, 'A new amount produces a new QR code')
  await qr.getByRole('textbox', { name: 'Amount in CHF' }).fill('12,5x')
  assert.ok(await qr.getByText('Enter an amount such as 197.58').isVisible())

  // 08 and 09 — copyable commands for agents and for npm.
  assert.match(await chapter('agents').innerText(), /npx skills add stedbrown\/alpina-ui --skill alpina-ui/)
  const install = page.locator('[data-landing-island="install"]')
  assert.equal(await install.locator('code').textContent(), 'npm install alpina-ui' + (manifest.version.includes('-') ? '@next' : ''))
  assert.ok(await install.getByRole('button', { name: /Copy/ }).isVisible())

  for (const width of [320, 360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal scrolling at ' + width + ' px')
  }
  assert.deepEqual(errors, [], 'The homepage logs no errors')
  await page.close()

  // Without JavaScript every sample is still readable from the server rendering.
  const { page: still } = await homepage({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } })
  assert.ok(await still.locator('#interfaces table tbody tr').count() >= 5)
  assert.ok(await still.locator('#swiss input[name="town"]').inputValue() === 'Bern')
  assert.ok(await still.locator('#qr-bill .al-bill-slip svg').count() >= 1)
  await still.close()
  console.log('Homepage samples keep their geometry, hydrate on approach, filter, validate, re-encode the QR-bill and read without JavaScript.')
} finally {
  await browser.close()
}
