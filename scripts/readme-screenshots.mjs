// Build the portal first. Capture the actual first screen for GitHub and link previews.
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { openPublicPage, siteOrigin } from '../tests/public-pages.mjs'

const browser = await chromium.launch({ ...(process.env.CHROME_PATH && { executablePath: process.env.CHROME_PATH }) })
try {
  const shots = [
    ['light', 1280, 880, 'docs/images/home-light.png'],
    ['dark', 1280, 880, 'docs/images/home-dark.png'],
    ['light', 1200, 630, 'web/assets/alpina-preview.png'],
  ]
  for (const [colorScheme, width, height, output] of shots) {
    const page = await openPublicPage(browser, { colorScheme, reducedMotion: 'reduce', viewport: { width, height }, deviceScaleFactor: 1 })
    await page.goto(siteOrigin + '/')
    await page.getByRole('heading', { name: 'Swiss design for React.' }).waitFor()
    await page.evaluate(async () => {
      await Promise.all([...document.fonts].map(face => face.load()))
      await document.fonts.ready
      await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode()))
    })
    await page.screenshot({ path: fileURLToPath(new URL('../' + output, import.meta.url)) })
    await page.close()
  }
} finally { await browser.close() }
