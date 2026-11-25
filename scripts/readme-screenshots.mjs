// Build the portal first. Capture the actual homepage in both system appearances.
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { openPublicPage, siteOrigin } from '../tests/public-pages.mjs'

const browser = await chromium.launch({ ...(process.env.CHROME_PATH && { executablePath: process.env.CHROME_PATH }) })
try {
  for (const colorScheme of ['light', 'dark']) {
    const page = await openPublicPage(browser, { colorScheme, viewport: { width: 1280, height: 880 }, deviceScaleFactor: 1 })
    await page.goto(siteOrigin + '/')
    await page.getByRole('heading', { name: 'Swiss UI for React.' }).waitFor()
    await page.evaluate(async () => {
      await Promise.all([...document.fonts].map(face => face.load()))
      await document.fonts.ready
      await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode()))
    })
    await page.screenshot({ path: fileURLToPath(new URL('../docs/images/home-' + colorScheme + '.png', import.meta.url)) })
    await page.close()
  }
} finally { await browser.close() }
