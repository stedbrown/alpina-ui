import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
const executable = process.env.CHROME_PATH
const browser = await chromium.launch(
  executable
    ? { executablePath: executable }
    : existsSync(chromium.executablePath())
      ? {}
      : { channel: 'chrome' },
)
try {
  const page = await browser.newPage({ offline: true, viewport: { width: 1440, height: 900 } })
  page.setDefaultTimeout(5000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const url = new URL('../dist/rubrica-bilingue.html', import.meta.url).href
  await page.goto(url)
  const button = (name) => page.getByRole('button', { name, exact: true })
  const choice = (name) => page.getByRole('menuitem', { name, exact: true })
  const list = page.getByRole('list')
  const rows = list.getByRole('listitem')
  assert.equal(await rows.count(), 7)
  await page.getByRole('searchbox').fill('zurich')
  assert.equal(await rows.count(), 1)
  await button('Deutsch').click()
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'de-CH')
  assert.equal(await page.getByRole('searchbox').inputValue(), 'zurich')
  assert.equal(await rows.count(), 1)
  await page.getByRole('searchbox').fill('irreperibile')
  await page.getByText('Keine Kontakte gefunden').waitFor()
  await button('Filter zurücksetzen').click()
  await page.getByRole('combobox', { name: 'Kanton' }).selectOption('TI')
  assert.equal(await rows.count(), 2)
  await page.getByRole('combobox', { name: 'Sortieren nach' }).selectOption('locality')
  assert.match(await rows.first().innerText(), /Studio Arco/)
  await page.getByRole('link', { name: 'Kartei öffnen für Studio Arco' }).click()
  await page.getByRole('complementary', { name: 'Studio Arco' }).waitFor()
  await button('Neuer Kontakt').click()
  let dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Kontakt speichern' }).click()
  assert.equal(await dialog.locator('[aria-invalid=true]').count(), 5)
  const fields = dialog.getByRole('textbox')
  await fields.nth(0).fill('Atelier Prova')
  await fields.nth(1).fill('Via della Prova 9')
  await fields.nth(2).fill('6901')
  await fields.nth(3).fill('Lugano')
  await dialog.getByRole('combobox').selectOption('TI')
  await dialog.getByRole('button', { name: 'Italiano' }).click()
  assert.equal(await fields.first().inputValue(), 'Atelier Prova')
  await dialog.getByRole('button', { name: 'Salva contatto' }).click()
  await page.getByRole('complementary', { name: 'Atelier Prova' }).waitFor()
  assert.equal(await rows.count(), 3)
  assert.equal(await page.getByRole('combobox', { name: 'Cantone' }).inputValue(), 'TI')
  await button('Azioni per Atelier Prova').focus()
  await page.keyboard.press('Enter')
  await choice('Modifica').waitFor()
  await page.keyboard.press('Enter')
  await dialog.getByRole('textbox').first().fill('Atelier Corretto')
  await dialog.getByRole('button', { name: 'Salva contatto' }).click()
  await page.getByRole('complementary', { name: 'Atelier Corretto' }).waitFor()
  await button('Azioni per Atelier Corretto').click()
  await choice('Elimina').click()
  const confirm = page.getByRole('alertdialog')
  await confirm.getByRole('button', { name: 'Annulla' }).click()
  await confirm.waitFor({ state: 'hidden' })
  await page.waitForFunction(
    () => document.activeElement?.getAttribute('aria-label') === 'Azioni per Atelier Corretto',
  )
  await page.setViewportSize({ width: 320, height: 720 })
  await button('Azioni per Atelier Corretto').click()
  const menu = page.getByRole('menu')
  await menu.waitFor()
  const box = await menu.boundingBox()
  console.log('Menu 320 px:', box)
  await choice('Elimina').click()
  await confirm.getByRole('button', { name: 'Elimina' }).click()
  await confirm.waitFor({ state: 'hidden' })
  assert.equal(await rows.count(), 2)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.getByRole('combobox', { name: 'Cantone' }).selectOption('')
  // Clear every remaining fixture to exercise the first-contact state.
  while (await rows.count()) {
    await rows.first().getByRole('button').click()
    await choice('Elimina').click()
    await confirm.getByRole('button', { name: 'Elimina' }).click()
    await confirm.waitFor({ state: 'hidden' })
  }
  await page.getByText('La rubrica è vuota').waitFor()
  await page.reload()
  assert.equal(await rows.count(), 7)
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const language of ['Deutsch', 'Italiano']) {
      await button(language).click()
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        language + ' · ' + width,
      )
    }
  }
  assert.equal(await page.evaluate(() => JSON.stringify(localStorage).includes('Atelier Prova')), false)
  assert.deepEqual(errors, [])
  console.log(
    'Verificati ricerca, ordinamento, filtri, IT/DE, creazione, errori, modifica, annullamento, focus, eliminazione, 320 px e dati effimeri.',
  )
} finally {
  await browser.close()
}
