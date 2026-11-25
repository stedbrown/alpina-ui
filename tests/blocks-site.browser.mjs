import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const site = new URL('../site/', import.meta.url)
const origin = 'https://alpina.test'
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route(origin + '/**', route => {
    const { pathname } = new URL(route.request().url())
    const file = pathname.endsWith('/') ? pathname + 'index.html' : pathname
    return route.fulfill({ path: fileURLToPath(new URL('.' + file, site)) })
  })
  const main = page.getByRole('main')
  async function open(slug, title) {
    await page.goto(origin + '/blocks/' + slug + '/')
    await main.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
    assert.equal(await main.count(), 1)
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  }

  await open('login', 'Sign in')
  const password = main.getByLabel('Password', { exact: true })
  await password.fill('invalid-preview-password')
  await main.getByRole('button', { name: 'Sign in', exact: true }).press('Enter')
  await main.getByRole('alert').waitFor()
  await password.fill('atelier-demo')
  await main.getByRole('button', { name: 'Sign in', exact: true }).press('Enter')
  await main.getByRole('heading', { name: 'Signed in' }).waitFor()
  assert.equal(await main.getByRole('link', { name: 'Continue to workspace' }).getAttribute('href'), '/blocks/dashboard/')

  await open('account-settings', 'Account settings')
  const fullName = main.getByLabel('Full name')
  const save = main.getByRole('button', { name: 'Save changes' })
  await fullName.fill('Anna Meier')
  await main.getByLabel('Preferred language').selectOption('it-CH')
  await save.click()
  await main.getByText('Changes saved.', { exact: true }).waitFor()
  assert.ok(await main.getByRole('heading', { name: 'Anna Meier' }).isVisible())
  await fullName.fill('Unsaved draft')
  await main.getByRole('button', { name: 'Discard changes' }).click()
  assert.equal(await fullName.inputValue(), 'Anna Meier')
  assert.ok(await save.isDisabled())

  await open('dashboard', 'Studio accounts')
  await main.getByLabel('Invoice status').selectOption('Open')
  const ledger = main.getByRole('table', { name: 'Invoices in the selected period' })
  assert.equal(await ledger.getByRole('row').count(), 3)
  await ledger.getByRole('button', { name: 'Amount' }).click()
  assert.deepEqual(await ledger.locator('tbody data').evaluateAll(nodes => nodes.map(node => node.value)), ['840', '2460'])
  await main.getByRole('searchbox').fill('Maison')
  assert.equal(await main.getByRole('status').innerText(), '1 matching invoice')

  await open('pricing', 'Studio pricing')
  const plan = main.getByRole('article', { name: 'Studio', exact: true })
  assert.equal(await plan.locator('data').getAttribute('value'), '49')
  await main.getByRole('button', { name: 'Annual' }).click()
  assert.equal(await plan.locator('data').getAttribute('value'), '490')
  const download = page.waitForEvent('download')
  await plan.getByRole('link', { name: 'Download Studio quote' }).click()
  const quote = await download
  assert.equal(quote.suggestedFilename(), 'studio-annual-quote.txt')
  assert.match(await readFile(await quote.path(), 'utf8'), /Billing interval: annual\nTotal per year: .*490/)
  assert.deepEqual(errors, [])
  console.log('All four hosted blocks passed 390 px, landmarks, sign-in, settings, filtering, sorting and quote download checks.')
} finally {
  await browser.close()
}
