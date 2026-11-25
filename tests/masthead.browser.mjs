import assert from 'node:assert/strict'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const browser = await launchBrowser()
try {
  for (const colorScheme of ['light', 'dark']) {
    const page = await openPublicPage(browser, { colorScheme, reducedMotion: 'reduce' })
    await page.goto(siteOrigin)
    const nav = page.getByRole('navigation', { name: 'Site navigation', exact: true })
    const brand = nav.getByRole('link', { name: 'Alpina UI home' })
    assert.equal(await brand.getAttribute('aria-current'), 'page')
    assert.equal(await brand.locator('img[alt=""]').count(), 1)
    for (const width of [320, 390, 768, 1024, 1440, 2560]) {
      await page.setViewportSize({ width, height: 900 })
      const geometry = await brand.evaluate(link => {
        const header = link.closest('header'), cover = document.querySelector('#cover')
        const box = el => el.getBoundingClientRect()
        const nav = link.closest('nav')
        const visible = [...nav.querySelectorAll('a,button')].filter(el => el.checkVisibility())
        return {
          ink: getComputedStyle(link).color,
          header: getComputedStyle(header).backgroundColor, hero: getComputedStyle(cover).backgroundColor,
          gap: box(cover).top - box(header).bottom,
          alignment: box(link).left - box(cover.querySelector('h1')).left,
          line: visible.every(el => Math.abs((box(el).top + box(el).bottom - box(link).top - box(link).bottom)/2) < 3),
          fits: visible.every(el => box(el).left >= 0 && box(el).right <= innerWidth),
        }
      })
      assert.equal(geometry.ink, 'rgb(255, 255, 255)')
      assert.equal(geometry.header, 'rgb(235, 0, 0)')
      assert.equal(geometry.header, geometry.hero)
      assert.equal(geometry.gap, 0)
      assert.ok(Math.abs(geometry.alignment) <= 1, 'Brand and title use the same left grid edge')
      assert.ok(geometry.line && geometry.fits, 'Unbroken navigation at ' + width)
    }
    await page.close()
  }
  console.log('The masthead and cover share a red field, column edge and responsive action row in both themes.')
} finally { await browser.close() }
