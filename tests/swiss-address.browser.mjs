import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const root = fileURLToPath(new URL('../', import.meta.url))
const result = await build({
  absWorkingDir: root,
  bundle: true,
  write: false,
  outfile: 'address-test.js',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  stdin: {
    loader: 'tsx',
    resolveDir: root,
    contents: `
      import { useState } from 'react'
      import { createRoot } from 'react-dom/client'
      import { SwissAddressForm } from './src/swiss/swiss-address-form.js'
      import { LocaleSelect } from './src/swiss/locale-select.js'
      import './src/theme.css'
      window.saved = []
      function Demo() {
        const [locale, setLocale] = useState('it-CH')
        return <>
          <LocaleSelect aria-label="Lingua" value={locale} onLocaleChange={setLocale} />
          <SwissAddressForm locale={locale} initialValue={{canton: 'TI'}} onSave={(address) => {
            window.saved.push(address)
            return new Promise((resolve, reject) => { window.finish = resolve; window.fail = reject })
          }} />
        </>
      }
      createRoot(document.getElementById('app')).render(<Demo />)
    `,
  },
})
const exe = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  exe ? { executablePath: exe } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)
try {
  const context = await browser.newContext({ offline: true })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.setContent(
    '<!doctype html><html lang="it-CH"><head><title>Alpina</title></head><body><div id="app"></div></body></html>',
  )
  await page.addStyleTag({
    content: result.outputFiles.find(({ path }) => path.endsWith('.css')).text,
  })
  await page.addScriptTag({
    content: result.outputFiles.find(({ path }) => path.endsWith('.js')).text,
  })
  const form = page.getByRole('form')
  const title = form.getByRole('heading', { level: 2 })
  const headingMetrics = () =>
    title.evaluate((el) => {
      const style = getComputedStyle(el)
      return [style.fontSize, style.lineHeight]
    })
  assert.deepEqual(await headingMetrics(), ['24px', '28px'])
  await page.evaluate(() => document.documentElement.style.setProperty('--al-unit', '5px'))
  assert.deepEqual(await headingMetrics(), ['30px', '35px'])
  await page.evaluate(() => document.documentElement.style.removeProperty('--al-unit'))
  const field = (name) => form.locator('[name="' + name + '"]')
  const submit = form.getByRole('button')
  await page.evaluate(() => {
    location.hash = 'swiss-address-form'
  })
  await submit.click()
  await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'recipient')
  assert.equal(await form.locator('[aria-invalid="true"]').count(), 4)
  const summary = form.getByRole('group', { name: 'Campi da correggere (4)' })
  assert.deepEqual(await summary.getByRole('link').allTextContents(), [
    'Destinatario',
    'Via e numero civico',
    'NPA',
    'Località',
  ])
  await summary.getByRole('link', { name: 'Località' }).focus()
  await page.keyboard.press('Enter')
  assert.equal(await page.evaluate(() => document.activeElement.name), 'locality')
  assert.equal(await page.evaluate(() => location.hash), '#swiss-address-form')
  for (const [locale, name] of [
    ['de-CH', 'Zu korrigierende Felder (4)'],
    ['fr-CH', 'Champs à corriger (4)'],
    ['rm-CH', 'Champs da curreger (4)'],
    ['it-CH', 'Campi da correggere (4)'],
  ]) {
    await page.getByLabel('Lingua').selectOption(locale)
    assert.equal(await form.getByRole('group', { name }).getByRole('link').count(), 4)
  }
  await field('recipient').fill('  A & B  ')
  assert.equal(await field('recipient').getAttribute('aria-invalid'), null)
  await field('recipient').fill(' ')
  assert.equal(await field('recipient').getAttribute('aria-invalid'), 'true')
  await field('recipient').fill('  A & B  ')
  await field('street').fill(' Rue 10 ')
  await field('postalCode').fill('80A0')
  await field('locality').fill(' Genève ')
  await field('canton').selectOption('GE')
  assert.equal(await form.getByRole('link').count(), 0)
  await submit.click()
  await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'postalCode')
  assert.deepEqual(await page.evaluate(() => window.saved), [])
  for (const locale of ['de-CH', 'fr-CH', 'rm-CH', 'it-CH']) {
    await page.getByLabel('Lingua').selectOption(locale)
    assert.equal(await field('postalCode').inputValue(), '80A0')
    assert.equal(await field('canton').inputValue(), 'GE')
    assert.equal(await form.getAttribute('lang'), locale)
    assert.equal(await form.locator('[aria-invalid="true"]').count(), 1)
    const missingRelations = await field('postalCode').evaluate(
      (el) =>
        el
          .getAttribute('aria-describedby')
          .split(' ')
          .filter((id) => !document.getElementById(id)).length,
    )
    assert.equal(missingRelations, 0)
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    }
  }
  await field('postalCode').fill('1201')
  await submit.click()
  assert.ok(await submit.isDisabled())
  assert.deepEqual(await page.evaluate(() => window.saved), [
    {
      recipient: 'A & B',
      street: 'Rue 10',
      postalCode: '1201',
      locality: 'Genève',
      canton: 'GE',
    },
  ])
  await page.evaluate(() => document.querySelector('form').requestSubmit())
  assert.equal(await page.evaluate(() => window.saved.length), 1)
  await page.evaluate(() => window.fail(new Error('fixture')))
  await form.getByRole('alert').waitFor()
  assert.ok(await submit.isEnabled())
  assert.ok(await submit.evaluate((button) => button === document.activeElement))
  assert.equal(await field('postalCode').inputValue(), '1201')
  await submit.click()
  await page.evaluate(() =>
    window.finish({
      fieldErrors: {
        postalCode: 'Verifica il numero postale con il destinatario.',
        locality: 'Conferma il nome della località.',
      },
    }),
  )
  await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'postalCode')
  assert.equal(await form.getByRole('alert').count(), 0)
  assert.equal(await field('recipient').inputValue(), '  A & B  ')
  const returnedErrors = form.getByRole('group', { name: 'Campi da correggere (2)' })
  await returnedErrors.getByRole('link', { name: 'Località' }).click()
  assert.equal(await page.evaluate(() => document.activeElement.name), 'locality')
  assert.equal(await field('locality').getAttribute('aria-invalid'), 'true')
  assert.ok(await form.getByText('Conferma il nome della località.').isVisible())
  await field('postalCode').fill('0123')
  assert.equal(await form.getByRole('link').count(), 0)
  assert.equal(await field('locality').getAttribute('aria-invalid'), 'true')
  await field('locality').fill('Località corretta')
  assert.equal(await form.locator('[aria-invalid="true"]').count(), 0)
  await submit.click()
  await page.getByLabel('Lingua').focus()
  await page.evaluate(() =>
    window.finish({ fieldErrors: { postalCode: 'Verifica il numero postale.' } }),
  )
  await form.getByText('Verifica il numero postale.').waitFor()
  assert.ok(await page.getByLabel('Lingua').evaluate((el) => el === document.activeElement))
  await field('postalCode').fill('1201')
  await submit.click()
  await page.evaluate(() => window.finish())
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]').disabled)
  assert.equal(await form.getByRole('alert').count(), 0)
  assert.deepEqual(errors, [])
  console.log(
    'SwissAddressForm passed four-language error summaries and links, focus management, server errors, recovery and layout checks.',
  )
} finally {
  await browser.close()
}
