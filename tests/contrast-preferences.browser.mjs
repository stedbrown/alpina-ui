import assert from 'node:assert/strict'
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
