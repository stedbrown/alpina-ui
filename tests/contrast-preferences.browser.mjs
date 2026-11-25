import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button } from 'alpina-ui'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { assertPaintedProfile } from './display-profile.mjs'
import { launchBrowser } from './launch-browser.mjs'
import { mountComponentGallery } from './component-gallery.mjs'

async function gallery(browser, theme) {
  const page = await browser.newPage({ viewport: { width: 768, height: 900 }, colorScheme: theme, deviceScaleFactor: 2 })
  await mountComponentGallery(page)
  await page.locator('html').evaluate((el, value) => el.dataset.alTheme = value, theme)
  return page
}

async function checkButtonInk(button) {
  await button.focus()
  const label = await button.evaluate(el => {
    const range = document.createRange()
    range.selectNodeContents(el)
    const text = range.getBoundingClientRect(), box = el.getBoundingClientRect(), css = getComputedStyle(el)
    return { x: Math.ceil(text.left - box.left), y: Math.ceil(text.top - box.top), right: Math.floor(text.right - box.left),
      bottom: Math.floor(text.bottom - box.top), ink: css.color.match(/\d+/g).slice(0, 3).map(Number),
      focus: el.matches(':focus-visible') && parseFloat(css.outlineWidth) >= 2 }
  })
  assert.ok(label.focus)
  const png = PNG.sync.read(await button.screenshot({ scale: 'css' }))
  // A solid text backplate has at most one ink run on any row. Real letters
  // have separate strokes in the resolved system foreground, with paper between.
  let strokes = 0
  for (let y = label.y; y < label.bottom; y++) {
    let last = false, runs = 0
    for (let x = label.x; x < label.right; x++) {
      const at = 4 * (y * png.width + x)
      const ink = label.ink.every((v, i) => Math.abs(v - png.data[at + i]) < 32)
      if (!last && ink) runs++
      last = ink
    }
    strokes = Math.max(strokes, runs)
  }
  assert.ok(strokes >= 3, 'System colours must paint separate letter strokes in ' + await button.innerText())
}

const browser = await launchBrowser()
const forcedBrowsers = []
try {
  for (const theme of ['light', 'dark']) {
    const page = await gallery(browser, theme)
    const token = name => page.evaluate(name => {
      const marker = document.createElement('span')
      marker.style.color = 'var(--al-' + name + ')'
      document.body.append(marker)
      const result = getComputedStyle(marker).color
      marker.remove()
      return result
    }, name)
    const normal = await token('accent')
    await page.emulateMedia({ colorScheme: theme, contrast: 'more' })
    assert.ok(await page.evaluate(() => matchMedia('(prefers-contrast: more)').matches))
    assert.notEqual(await token('accent'), normal)
    assert.equal(await token('line'), await token('ink'))
    await assertPaintedProfile(page, { theme, appearance: theme === 'dark' ? 'contrast-more-dark' : 'contrast-more', media: { contrast: 'more' } })
    const header = page.locator('[data-component="data-table"]').locator('thead button').first()
    await header.press('Enter')
    assert.ok(await header.evaluate(el => el.matches(':focus-visible') && parseFloat(getComputedStyle(el).outlineWidth) >= 2))
    assert.ok(await header.evaluate(el => ['ascending', 'descending'].includes(el.closest('th').ariaSort)))

    await page.close()
    const native = await launchBrowser(theme)
    forcedBrowsers.push(native)
    const forced = await gallery(native, theme)
    await forced.emulateMedia({ colorScheme: theme, forcedColors: 'active' })
    await assertPaintedProfile(forced, { theme, appearance: theme === 'dark' ? 'forced-colors-dark' : 'forced-colors', media: { forcedColors: 'active' } })
    const sample = id => forced.locator('[data-component="' + id + '"]')
    const danger = renderToStaticMarkup(createElement(Button, { variant: 'danger' }, 'Delete draft'))
    await sample('button').evaluate((el, html) => el.insertAdjacentHTML('beforeend', html), danger)
    await forced.keyboard.press('Tab')
    for (const label of ['Add a copy', 'Delete draft']) await checkButtonInk(sample('button').getByRole('button', { name: label }))
    await checkButtonInk(sample('swiss-address-form').locator('button[type=submit]'))
    for (const id of ['combobox', 'canton-combobox']) {
      const input = sample(id).getByRole('combobox').first()
      await input.press('ArrowDown')
      const target = await input.getAttribute('aria-activedescendant')
      assert.ok(target, id)
      assert.ok(await forced.locator('[id="' + target + '"]').evaluate(el => getComputedStyle(el).outlineStyle === 'solid'), id)
      await input.press('Escape')
    }
    const qr = sample('swiss-qr-bill').locator('.al-bill-qr').first()
    assert.equal(await qr.evaluate(el => getComputedStyle(el).forcedColorAdjust), 'none')
    const pixels = PNG.sync.read(await qr.screenshot())
    const decoded = jsQR(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height, { inversionAttempts: 'dontInvert' })
    assert.ok(decoded?.data.startsWith('SPC\n0200\n'), theme + ' forced-color QR must decode in its original polarity')
    const reader = sample('swiss-qr-bill').locator('.al-bill-reading')
    await reader.locator('summary').press('Enter')
    assert.equal(await reader.getAttribute('open'), '')
    await reader.locator('.al-bill-number').first().waitFor({ state: 'visible' })
    await forced.emulateMedia({ media: 'print' })
    assert.equal(await reader.isVisible(), false)
    await forced.close()
  }
  console.log('Verified strong contrast, selected options, keyboard sorting and scannable payment details in light and dark palettes.')
} finally { await Promise.all([browser, ...forcedBrowsers].map(instance => instance.close())) }
