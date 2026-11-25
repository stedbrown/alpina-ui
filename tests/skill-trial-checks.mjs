import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const locales = { Invoice: 'fr-CH', Residence: 'it-CH', Ledger: 'de-CH', Editorial: 'de-CH' }

export async function prepareTrials(consumer) {
  const entries = []
  for (const [name, locale] of Object.entries(locales)) {
    const source = await readFile(new URL('../docs/skill-trials/' + name + '.tsx', import.meta.url), 'utf8')
    assert.ok(source.includes('<AlpinaProvider locale="' + locale + '">'), name + ' provider')
    assert.match(source, /import ['"]alpina-ui\/styles\.css['"]/)
    assert.doesNotMatch(source, /className=|tailwind|gradient\(|@ts-(?:ignore|nocheck|expect-error)|as any\b/i)
    assert.doesNotMatch(source, /(?:\bcolor|background(?:Color)?|borderColor|['"]--al-[\w-]+['"])\s*:/i)
    await writeFile(join(consumer, name + '.tsx'), source)
    const entry = 'trial-' + name
    await writeFile(join(consumer, entry + '.tsx'), [
      "import { createRoot } from 'react-dom/client'",
      "import Screen from './" + name + "'",
      "createRoot(document.getElementById('app')!).render(<Screen />)",
    ].join('\n'))
    entries.push(entry)
  }
  return entries
}

async function invoice(page) {
  const article = page.locator('.al-invoice-document')
  assert.match(await article.innerText(), /2[,.]5\s*h/)
  assert.match(await article.locator('.al-invoice-total dd').innerText(), /294[.,]03/)
  await article.locator('.al-qr-bill svg').first().waitFor({ state: 'attached' })
  await page.evaluate(() => {
    window.print = () => {
      window.printedInvoice = !!document.querySelector('.al-invoice-document[data-al-document-target]')
      window.dispatchEvent(new Event('afterprint'))
    }
  })
  await page.getByRole('button', { name: 'Imprimer la facture' }).click()
  assert.equal(await page.evaluate(() => window.printedInvoice), true)
}

async function residence(page) {
  const form = page.locator('form')
  const submit = form.getByRole('button', { name: 'Invia la richiesta' })
  const field = name => form.locator('[name="' + name + '"]')
  await submit.click()
  assert.equal(await field('ahv').getAttribute('aria-invalid'), 'true')
  for (const [name, value] of Object.entries({
    ahv: '7561234567897', recipient: 'Esempio', firstName: 'Ada', street: 'Via Esempio',
    houseNumber: '4', postalCode: '6900', locality: 'Lugano',
  })) await field(name).fill(value)
  await field('canton').selectOption('TI')
  await submit.click()
  await page.getByRole('heading', { name: /Richiesta acquisita/ }).waitFor()
  assert.match(await page.locator('address').innerText(), /6900 Lugano \(TI\)/)
}

async function ledger(page) {
  const table = page.getByRole('table', { name: 'Buchungen der Atelierkasse' })
  assert.match((await table.locator('tfoot').innerText()).replace(/[^\d.]/g, ''), /2080\.65/)
  await table.getByRole('button', { name: /Betrag/ }).click()
  assert.match(await table.locator('tbody tr').first().innerText(), /Rückerstattung/)
  await table.getByRole('button', { name: /Betrag/ }).click()
  assert.match(await table.locator('tbody tr').first().innerText(), /Anfangsbestand/)
}

async function editorial(page, width) {
  assert.match(await page.locator('h1').innerText(), /Rives neuves/)
  assert.equal(await page.locator('li time').count(), 3)
  assert.ok(await page.locator('[lang="fr-CH"]').count() >= 5)
  const columns = await page.locator('header .al-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)
  assert.equal(columns, width < 500 ? 4 : 12)
  const [de, fr] = await page.locator('header .al-type[data-role="lead"]').evaluateAll(items =>
    items.map(item => { const { x, y } = item.getBoundingClientRect(); return { x, y } }))
  if (width < 500) assert.ok(fr.y > de.y && Math.abs(fr.x - de.x) < 1)
  else assert.ok(fr.x > de.x && Math.abs(fr.y - de.y) < 1)
}

const checks = { Invoice: invoice, Residence: residence, Ledger: ledger, Editorial: editorial }
export async function verifyTrials(page) {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 880 })
    for (const [name, check] of Object.entries(checks)) {
      await page.goto('https://skill.test/?example=trial-' + name)
      await page.getByRole('heading', { level: 1 }).first().waitFor()
      assert.equal(await page.locator('html').getAttribute('lang'), locales[name])
      const extent = await page.evaluate(() => document.documentElement.scrollWidth)
      assert.ok(extent <= width, name + ' extends to ' + extent + ' at viewport width ' + width)
      await check(page, width)
    }
  }
  console.log('Verified four independent skill submissions at 360 and 1280 px.')
}
