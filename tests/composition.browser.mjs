import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium } from 'playwright-core'

const bundle = await build({
  absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
  entryPoints: ['tests/composition-fixture.tsx'], outfile: 'fixture.js', bundle: true,
  write: false, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
})
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const page = await browser.newPage()
  await page.setContent('<!doctype html><html lang="en"><body><main id="app"></main></body></html>')
  await page.addStyleTag({ content: bundle.outputFiles.find(f => f.path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find(f => f.path.endsWith('.js')).text })
  const link = name => page.getByRole('link', { name, exact: true })
  const button = name => page.getByRole('button', { name, exact: true })
  const events = async () => page.locator('output').evaluate(output => {
    const result = output.textContent
    output.replaceChildren()
    return result
  })
  assert.equal(await link('Work').getAttribute('class'), 'al-button outer child')
  assert.equal(await link('Work').getAttribute('data-child-ref'), 'attached')
  assert.equal(await link('Work').evaluate(node => node.style.padding + ' ' + node.style.color), '8px black')
  await link('Work').click()
  await button('Read ref').click()
  assert.equal(await events(), 'child|button|route #work|A|')
  await button('Mount link').click()
  await button('Read ref').click()
  assert.equal(await events(), 'cleanup|detached|')
  await link('Cancel navigation').click()
  assert.equal(await events(), 'cancel|')
  const disabled = link('Disabled route')
  assert.equal(await disabled.getAttribute('aria-disabled'), 'true')
  assert.equal(await disabled.getAttribute('tabindex'), '-1')
  await disabled.click({ force: true, modifiers: ['Control'] })
  await disabled.press('Enter')
  await disabled.press('Space')
  assert.ok(await disabled.evaluate(node => {
    const event = new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 })
    return !node.dispatchEvent(event)
  }))
  assert.equal(await link('Busy route').getAttribute('aria-busy'), 'true')
  assert.equal(await link('Busy route').getAttribute('href'), null)
  await button('Neutral child').click()
  assert.equal(await events(), '')
  assert.equal(await link('Label').locator('.al-badge-mark').count(), 1)
  assert.equal(await link('Guide').getAttribute('data-variant'), 'action')
  assert.equal(await link('Current').getAttribute('aria-current'), 'page')
  await link('Index').click()
  assert.equal(await events(), '/index|route #index|')
  assert.equal(await page.locator('a a, button a, a button').count(), 0)
  await button('Actions').press('ArrowDown')
  const targets = page.getByRole('menuitem')
  await targets.first().press('ArrowDown')
  assert.equal(await targets.nth(1).evaluate(node => node === document.activeElement), true)
  await targets.nth(1).press('Enter')
  assert.equal(await targets.count(), 3)
  await targets.nth(1).press('e')
  assert.equal(await targets.last().evaluate(node => node === document.activeElement), true)
  await targets.last().press('Space')
  assert.equal(await events(), 'edit|route #edit|')
  assert.equal(await button('Actions').evaluate(node => node === document.activeElement), true)
  console.log('Slotted links passed ref composition, cancellation, disabled activation, keyboard and router checks.')
} finally {
  await browser.close()
}
