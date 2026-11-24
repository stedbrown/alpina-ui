import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const bundle = await build({
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  entryPoints: ['tests/dropdown05-fixture.tsx'],
  outfile: 'fixture.js',
  bundle: true,
  write: false,
})
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executable
    ? { executablePath: executable }
    : existsSync(chromium.executablePath())
      ? {}
      : { channel: 'chrome' },
)
try {
  async function createPage(touch = false) {
    const page = await browser.newPage({
      viewport: touch ? { width: 320, height: 520 } : { width: 1000, height: 350 },
      hasTouch: touch,
      offline: true,
    })
    await page.setContent(
      '<!doctype html><html lang="de-CH"><meta name="viewport" content="width=device-width,initial-scale=1"><main id="app"></main></html>',
    )
    await page.addStyleTag({
      content: bundle.outputFiles.find((file) => file.path.endsWith('.css')).text,
    })
    await page.addScriptTag({
      content: bundle.outputFiles.find((file) => file.path.endsWith('.js')).text,
    })
    return page
  }
  const page = await createPage()
  const trigger = page.getByRole('button', { name: 'Aktionen für Atelier' })
  const menu = page.getByRole('menu')
  const item = (name) => menu.getByRole('menuitem', { name, exact: true })
  const focused = async (target) =>
    assert.ok(await target.evaluate((el) => el === document.activeElement))
  await page.getByRole('button', { name: 'Torna al contatto' }).click()
  await focused(trigger)
  assert.equal((await trigger.boundingBox()).height, 32)
  await page.keyboard.press('ArrowUp')
  await menu.waitFor()
  const remove = item('Kontakt löschen…')
  await focused(remove)
  assert.equal(await menu.getByRole('separator').count(), 1)
  assert.equal(await remove.locator('[aria-hidden=true]').textContent(), '−')
  assert.ok(
    await menu.evaluate((panel) => {
      const p = panel.getBoundingClientRect(),
        i = document.activeElement.getBoundingClientRect()
      return panel.scrollTop > 0 && i.top >= p.top && i.bottom <= p.bottom
    }),
  )
  const position = async () => [await trigger.boundingBox(), await menu.boundingBox()]
  let [t, m] = await position()
  assert.ok(Math.abs(t.x + t.width - m.x - m.width) <= 1, 'LTR logical end')
  await page.keyboard.press('Home')
  await focused(item('Bearbeiten'))
  await page.keyboard.press('g')
  const disabled = item('Gemeindeverwaltungsangaben des Ansprechpartners exportieren')
  await focused(disabled)
  await page.keyboard.press('Enter')
  assert.equal(await page.locator('output').textContent(), '')
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  const confirm = page.getByRole('alertdialog')
  await confirm.waitFor()
  await focused(confirm.getByRole('button', { name: 'Abbrechen' }))
  assert.equal(await page.locator('output').textContent(), 'item/remove')
  await page.keyboard.press('Escape')
  await confirm.waitFor({ state: 'hidden' })
  await focused(trigger)
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl'
  })
  await trigger.click()
  await menu.waitFor()
  ;[t, m] = await position()
  assert.ok(Math.abs(t.x - m.x) <= 1, 'RTL logical end')
  await disabled.hover()
  await focused(disabled)
  await page.keyboard.press('Tab')
  await menu.waitFor({ state: 'hidden' })
  await focused(page.locator('#after'))
  await page.getByRole('button', { name: 'IT / DE' }).click()
  const azioni = page.getByRole('button', { name: 'Azioni per Atelier' })
  await azioni.click()
  await menu.waitFor()
  await focused(item('Modifica'))
  assert.equal(
    await menu.evaluate((el) => el.matches(':popover-open')),
    true,
    'Escapes clipping through top layer',
  )
  await page.locator('#clip').evaluate((el) => {
    el.scrollTop = 250
  })
  await menu.waitFor({ state: 'hidden' })
  assert.ok(
    await page.locator('#clip').evaluate((el) => el.scrollTop >= 250),
    'No scroll jump on dismissal',
  )
  await page.locator('#clip').evaluate((el) => {
    el.scrollTop = 0
    el.style.position = 'fixed'
    el.style.inset = 'auto 0 0'
    el.style.height = '3rem'
  })
  await azioni.click()
  await menu.waitFor()
  const anchorBottom = await azioni.boundingBox()
  const openedAbove = await menu.boundingBox()
  assert.ok(openedAbove.y + openedAbove.height <= anchorBottom.y + 1, 'Opens above at the bottom edge')
  await page.keyboard.press('Escape')
  await focused(azioni)
  await page.close()

  const mobile = await createPage(true)
  const button = mobile.getByRole('button', { name: 'Aktionen für Atelier' })
  assert.ok((await button.boundingBox()).height >= 44)
  const iconOnly = mobile.getByRole('button', { name: 'Weitere Aktionen' })
  assert.ok((await iconOnly.boundingBox()).width >= 44, 'Compact icon trigger retains a touch target')
  await button.tap()
  const panel = mobile.getByRole('menu')
  await panel.waitFor()
  const target = panel.getByRole('menuitem').nth(1)
  assert.ok((await target.boundingBox()).height >= 44)
  const bounds = await panel.boundingBox()
  assert.ok(bounds.x >= 8 && bounds.x + bounds.width <= 312)
  assert.ok(await target.evaluate((el) => el.scrollWidth <= el.clientWidth), 'Long German text wraps')
  await mobile.emulateMedia({ forcedColors: 'active' })
  await mobile.keyboard.press('End')
  await focused(panel.getByRole('menuitem', { name: 'Kontakt löschen…' }))
  assert.equal(
    await panel
      .getByRole('menuitem')
      .last()
      .evaluate((n) => getComputedStyle(n).outlineStyle),
    'solid',
  )
  console.log(
    'DropdownMenu: IT/DE, allineamento logico LTR/RTL, mouse, touch, menu lungo, conferma, scroll e colori forzati verificati.',
  )
} finally {
  await browser.close()
}
