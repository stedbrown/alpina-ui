import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const browser = await launchBrowser()
try {
  const page = await openPublicPage(browser, { viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(siteOrigin + '/')
  const region = page.getByRole('region', { name: 'From shadcn/ui' })
  await region.scrollIntoViewIfNeeded()
  assert.equal(await region.getByRole('table', { name: 'Edition form equivalents' }).getByRole('row').count(), 5)
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: siteOrigin })
  const rectangles = []
  for (const [id, name] of [['shadcn', 'shadcn/ui'], ['alpina', 'Alpina UI']]) {
    const element = region.locator('iframe[title="' + name + ' edition label"]')
    const frame = element.contentFrame()
    await element.scrollIntoViewIfNeeded()
    const field = frame.getByRole('textbox', { name: 'Edition name' })
    const submit = frame.getByRole('button', { name: 'Set label' })
    await field.fill('September proofs')
    await submit.press('Enter')
    await frame.getByText('Label: September proofs').waitFor()
    const radius = await submit.evaluate(button => parseFloat(getComputedStyle(button).borderTopLeftRadius))
    assert.ok(id === 'shadcn' ? radius > 0 : radius === 0, name + ' must use its own stylesheet')
    const source = (await readFile('fixtures/migration/' + id + '-form.tsx', 'utf8')).replaceAll('\r\n', '\n').trimEnd()
    const code = region.getByRole('figure', { name: name + ' · EditionLabel.tsx' })
    assert.equal(await code.locator('code').textContent(), source)
    await code.getByRole('button', { name: 'Copy' }).click()
    await code.getByText('Copied', { exact: true }).waitFor()
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n'), source)
    rectangles.push(await code.boundingBox())
  }
  assert.ok(Math.abs(rectangles[0].y - rectangles[1].y) < 1 && rectangles[0].x < rectangles[1].x, 'Side-by-side code on desktop')
  await page.setViewportSize({width: 320, height: 900})
  assert.ok(await region.evaluate(node => node.scrollWidth <= node.clientWidth + 1))
  assert.deepEqual(errors, [])
  console.log('Both migration forms rendered, submitted, retained their design and copied their runnable sources.')
} finally { await browser.close() }
