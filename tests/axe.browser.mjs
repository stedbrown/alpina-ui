import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
import axe from 'axe-core'
import { openPublicPage, publicRoutes, siteOrigin } from './public-pages.mjs'

const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const routes = await publicRoutes()
  const failures = []
  const isComponent = path => /^\/docs\/components\/[^/]+\/$/.test(path)
  const components = routes.filter(isComponent)
  async function auditPages(remaining, width, colorScheme, scope) {
    const profile = width + ' px ' + colorScheme
    const page = await openPublicPage(browser, { viewport: { width, height: 900 }, colorScheme })
    page.on('pageerror', error => failures.push(profile + ' ' + new URL(page.url()).pathname + ' ' + error.message))
    for (let path; (path = remaining.shift());) {
      await page.goto(siteOrigin + path)
      await page.getByRole('main').waitFor()
      if (isComponent(path)) await page.locator('.al-preview-content > *').first().waitFor()
      await page.evaluate(() => document.fonts.ready)
      await page.addScriptTag({ content: axe.source })
      const result = await page.evaluate(async scope => {
        const { violations } = await window.axe.run(scope === 'html' ? document : document.querySelector(scope), {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'] },
          resultTypes: ['violations'],
        })
        return violations.map(rule => rule.id + ': ' + rule.nodes.map(node => node.target.join(' ')).join(', '))
      }, scope)
      if (result.length) failures.push(profile + ' ' + path + ' ' + result.join('\n  '))
      // WCAG 2.4.11 requires a focused component to stay at least partly visible.
      // Sample the visible viewport intersection after the browser's own focus scroll.
      const obscured = await page.evaluate(scope => {
        const fields = document.querySelector(scope).querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]')
        function exposed(element) {
          // A wrapped link can have empty space between its two visible fragments.
          for (const box of element.getClientRects()) {
            const left = Math.max(0, box.left), top = Math.max(0, box.top)
            const width = Math.min(innerWidth, box.right) - left, height = Math.min(innerHeight, box.bottom) - top
            if (width <= 0 || height <= 0) continue
            for (const x of [.1, .5, .9]) for (const y of [.1, .5, .9]) {
              if (element.contains(document.elementFromPoint(left + width * x, top + height * y))) return true
            }
          }
          return false
        }
        const hidden = []
        for (const field of fields) {
          if (field.tabIndex < 0 || field.matches(':disabled') || !field.getClientRects().length) continue
          field.focus()
          if (document.activeElement !== field) continue
          if (!exposed(field) && !Array.from(field.labels ?? []).some(exposed)) {
            hidden.push(field.tagName + ' ' + (field.getAttribute('aria-label') || field.textContent.trim() || field.id))
          }
        }
        return hidden
      }, scope)
      if (obscured.length) failures.push(profile + ' ' + path + ' focused controls obscured: ' + obscured.join(', '))
    }
    await page.close()
  }
  for (const [pages, width, scheme, scope] of [
    [routes, 1280, 'light', 'html'],
    [components, 360, 'light', '.al-preview-content'],
    [components, 1280, 'dark', '.al-preview-content'],
  ]) {
    const remaining = [...pages]
    await Promise.all(Array.from({ length: 2 }, () => auditPages(remaining, width, scheme, scope)))
  }
  assert.equal(failures.length, 0, failures.sort().join('\n'))
  console.log('axe checked ' + routes.length + ' public pages and ' + components.length * 2 + ' mobile-light and desktop-dark component previews.')
} finally { await browser.close() }
