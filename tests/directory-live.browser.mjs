import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executable
    ? { executablePath: executable }
    : existsSync(chromium.executablePath())
      ? {}
      : { channel: 'chrome' },
)
try {
  const page = await browser.newPage({ offline: true, viewport: { width: 390, height: 844 } })
  const site = new URL('../site/catalog.html', import.meta.url).href
  await page.goto(site + '#project/bilingual-address-book')
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  await page.getByRole('link', { name: 'Open the IT / DE address book' }).click()
  await page.getByRole('heading', { name: 'Rubrica degli atelier', level: 1 }).waitFor()
  assert.equal(new URL(page.url()).hash, '#bilingual-address-book')
  assert.equal(await page.locator('html').getAttribute('lang'), 'it-CH')
  assert.equal(await page.getByRole('main').count(), 1)
  await page.getByRole('button', { name: 'Deutsch', exact: true }).click()
  await page.getByRole('heading', { name: 'Atelierverzeichnis', level: 1 }).waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'de-CH')
  await page.getByRole('button', { name: /Aktionen.*Edizioni Riva/ }).click()
  await page.getByRole('menu').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('link', { name: 'Alpina UI', exact: true }).click()
  await page.getByRole('heading', { name: 'Build an Italian–German address book', level: 1 }).waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  await page.goto(site + '#rubrica-bilingue')
  await page.getByRole('heading', { name: 'Rubrica degli atelier', level: 1 }).waitFor()
  await page.goto(site + '#rubrica')
  await page.getByRole('heading', { name: 'Client address book', level: 1 }).waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  console.log('The embedded address book passed offline navigation, language switching, menu and return-to-guide checks.')
} finally {
  await browser.close()
}
