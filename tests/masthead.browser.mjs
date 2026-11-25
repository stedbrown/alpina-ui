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
    await page.setViewportSize({ width: 320, height: 900 })
    await page.addStyleTag({ content: 'html { font-size: 200% } * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important }' })
    assert.ok(await nav.evaluate(el => {
      const boxes = [...el.querySelectorAll('a,button')].filter(control => control.checkVisibility())
        .map(control => control.getBoundingClientRect())
      return el.scrollWidth <= el.clientWidth + 1 && boxes.every((a, i) =>
        boxes.slice(i + 1).every(b => a.right <= b.left + 1 || b.right <= a.left + 1 ||
          a.bottom <= b.top + 1 || b.bottom <= a.top + 1))
    }), 'Masthead actions remain reachable at 200% text size with WCAG text spacing')
    await page.close()
  }
  const page = await openPublicPage(browser, { viewport: { width: 390, height: 844 } })
  for (const [route, current] of [
    ['/docs/', 'Docs'], ['/docs/components/button/', 'Components'], ['/kit/', 'Kit'], ['/themes/', 'Themes'],
    ['/examples/', 'Examples'], ['/examples/invoice-review/', 'Examples'], ['/examples/bilingual-address-book/', 'Examples'],
    ['/agents/', 'Agents'], ['/principles/', 'Principles'], ['/blocks/login/', 'Blocks'], ['/catalog.html', 'Components'],
  ]) {
    await page.goto(siteOrigin + route)
    await page.getByRole('main').first().waitFor()
    if (route.startsWith('/docs/components/')) await page.locator('.al-preview-content > *').first().waitFor()
    const nav = page.getByRole('navigation', { name: 'Site navigation', exact: true })
    await nav.getByRole('link', { name: 'Alpina UI home' }).waitFor()
    assert.equal(await nav.count(), 1, route)
    assert.equal(await nav.getByRole('link', { name: 'GitHub' }).getAttribute('href'), 'https://github.com/stedbrown/alpina-ui')
    const release = nav.getByRole('link', { name: /^Release / })
    assert.equal(await release.getAttribute('href'), '/docs/guides/release/')
    assert.equal(await release.getAttribute('aria-label'), 'Release ' + (await release.textContent()).trim())
    await nav.getByRole('button', { name: 'Menu', exact: true }).press('Enter')
    assert.equal(await nav.getByRole('link', { name: current, exact: true }).getAttribute('aria-current'), 'page', route)
    await page.keyboard.press('Escape')
    assert.ok(await nav.getByRole('button', { name: 'Menu', exact: true }).evaluate(el => el === document.activeElement))
  }
  await page.close()
  console.log('The masthead and cover share a red field, column edge and responsive action row in both themes.')
} finally { await browser.close() }
