// Build the portal first. Capture the actual first screen for GitHub and link previews.
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { openPublicPage, siteOrigin } from '../tests/public-pages.mjs'

const browser = await chromium.launch({ ...(process.env.CHROME_PATH && { executablePath: process.env.CHROME_PATH }) })
try {
  const shots = [
    ['light', 1440, 900, 1, 'docs/images/home-light.png'],
    ['dark', 1440, 900, 1, 'docs/images/home-dark.png'],
    // Render the full poster at desktop scale; the resulting sharing card is 1200 × 630.
    ['light', 1920, 1008, 0.625, 'web/assets/alpina-preview.png'],
  ]
  for (const [colorScheme, width, height, deviceScaleFactor, output] of shots) {
    const page = await openPublicPage(browser, { colorScheme, reducedMotion: 'reduce', viewport: { width, height }, deviceScaleFactor })
    await page.goto(siteOrigin + '/')
    await page.getByRole('heading', { name: 'Swiss design for React.' }).waitFor()
    await page.evaluate(async () => {
      await Promise.all([...document.fonts].map(face => face.load()))
      await document.fonts.ready
      await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode()))
    })
    const metric = page.getByText('WCAG AA target', { exact: true }).first()
    const bounds = await metric.boundingBox()
    assert.ok(bounds && bounds.y + bounds.height <= height, 'All four cover figures must fit in ' + output)
    await page.screenshot({ path: fileURLToPath(new URL('../' + output, import.meta.url)) })
    await page.close()
  }
} finally { await browser.close() }
