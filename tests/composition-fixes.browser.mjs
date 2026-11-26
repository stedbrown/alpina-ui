import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

// Regressions found while building a full site with the library:
// focus moved by a Command action, CHF headings inside rows, and a Progress bar with a printed label.
const root = fileURLToPath(new URL('../', import.meta.url))
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, outfile: 'composition-fixes.js', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"development"' },
  stdin: { loader: 'tsx', resolveDir: root, contents: `
    import { createRoot } from 'react-dom/client'
    import { Command } from './src/interactive/command.js'
    import { CurrencyCHF } from './src/swiss/currency-chf.js'
    import { Progress } from './src/ui/progress.js'
    import { Stack } from './src/ui/stack.js'
    import { Typography } from './src/ui/typography.js'
    import './src/theme.css'
    function Fixture() {
      return <main>
        <Command title="Vai a" trigger="Apri comandi" closeLabel="Chiudi" searchLabel="Cerca" empty="Nessun risultato"
          items={[{ value: 'prezzi', label: 'Prezzi', onSelect: () => document.getElementById('prezzi').focus() }]} />
        <h2 id="prezzi" tabIndex={-1}>Prezzi</h2>
        <div id="row" style={{ inlineSize: '40rem' }}>
          <Stack direction="row" justify="space-between" align="baseline" gap={4}>
            <Typography as="h3" variant="heading">Totale</Typography>
            <Typography as="p" variant="display" numeric id="total"><CurrencyCHF amount={19237.5} locale="it-CH" /></Typography>
          </Stack>
        </div>
        <div id="narrow" style={{ inlineSize: '9rem' }}>
          <Stack direction="row" gap={2}>
            <Typography as="p" variant="display" numeric id="tight"><CurrencyCHF amount={19237.5} locale="it-CH" /></Typography>
          </Stack>
        </div>
        <Progress id="plain" label="Upload" value={30} />
        <Progress id="shown" label="Bozze approvate" value={2} max={3} showLabel formatValue={(v, m) => v + ' di ' + m} />
        <Progress id="percent" label="Stampa" value={45} showLabel />
        <Progress id="waiting" label="In attesa" showLabel />
      </main>
    }
    createRoot(document.getElementById('app')).render(<Fixture />)` },
})
const exe = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(exe ? { executablePath: exe } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.setContent('<!doctype html><html lang="it"><head><title>Composizione</title></head><body><div id="app"></div></body></html>')
  await page.addStyleTag({ content: bundle.outputFiles.find(({ path }) => path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find(({ path }) => path.endsWith('.js')).text })
  const focusedId = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.textContent)

  // An action that moves focus keeps it: the palette closes and restores focus before onSelect runs.
  const trigger = page.getByRole('button', { name: 'Apri comandi' })
  for (const how of ['Enter', 'click']) {
    await trigger.click()
    const search = page.getByRole('dialog').getByRole('combobox')
    await search.fill('prez')
    if (how === 'Enter') await search.press('Enter')
    else await page.getByRole('option', { name: 'Prezzi' }).click()
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    await page.waitForTimeout(100)
    assert.equal(await focusedId(), 'prezzi', 'focus moved by onSelect stays put after ' + how)
  }
  // Escape still hands focus back to the trigger.
  await trigger.click()
  await page.getByRole('dialog').getByRole('combobox').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await page.waitForFunction(() => document.activeElement?.textContent === 'Apri comandi')

  // A numeric display heading keeps a real width inside a flex row instead of collapsing to zero.
  const total = await page.locator('#total').evaluate(node => {
    const box = node.getBoundingClientRect(), figures = node.querySelector('bdi').getBoundingClientRect()
    return { width: box.width, figuresRight: figures.right, boxRight: box.right, size: parseFloat(getComputedStyle(node.querySelector('bdi')).fontSize), own: parseFloat(getComputedStyle(node).fontSize) }
  })
  assert.ok(total.width > 100, 'CHF display in a row has width, got ' + total.width)
  assert.ok(total.figuresRight <= total.boxRight + 1, 'figures stay inside their box')
  assert.ok(total.size >= total.own * 0.75, 'figures keep most of their size when the row has room')
  // In a narrow row the figures still shrink to fit instead of overflowing.
  const tight = await page.locator('#narrow').evaluate(node => ({ scroll: node.scrollWidth, client: node.clientWidth }))
  assert.ok(tight.scroll <= tight.client + 1, 'narrow row does not overflow: ' + JSON.stringify(tight))

  // Progress: the default stays a bare bar; showLabel prints label and value without changing the accessible name.
  assert.equal(await page.locator('#plain').evaluate(node => node.parentElement.className), '')
  assert.equal(await page.locator('.al-progress-field').count(), 3)
  const shown = page.locator('#shown')
  assert.equal(await shown.getAttribute('aria-label'), 'Bozze approvate')
  assert.equal(await shown.getAttribute('aria-valuetext'), '2 di 3')
  const header = shown.locator('xpath=preceding-sibling::div[1]')
  assert.equal(await header.getAttribute('aria-hidden'), 'true')
  assert.equal(await header.innerText(), 'Bozze approvate\n2 di 3')
  assert.equal(await page.locator('#percent').locator('xpath=preceding-sibling::div[1]').innerText(), 'Stampa\n45%')
  assert.equal(await page.locator('#waiting').locator('xpath=preceding-sibling::div[1]').innerText(), 'In attesa')
  assert.equal(await page.getByRole('progressbar', { name: 'Bozze approvate' }).count(), 1)
  assert.deepEqual(errors, [])
  console.log('Command focus hand-off, CHF figures in rows and visible Progress labels passed.')
} finally {
  await browser.close()
}
