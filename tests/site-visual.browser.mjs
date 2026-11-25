import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { platform, difference, launchVisualBrowser } from './visual-tools.mjs'
import { openPublicPage, publicRoutes, siteOrigin } from './public-pages.mjs'

const update = process.argv.includes('--update')
const destination = new URL('./site-reference/' + platform + '/', import.meta.url)
const diagnostics = new URL('../test-results/visual/site/', import.meta.url)
const allRoutes = await publicRoutes()
const selected = process.argv.find(arg => arg.startsWith('--route='))?.slice('--route='.length)
const routes = selected ? allRoutes.filter(route => route === selected) : allRoutes
assert.ok(routes.length, 'Unknown public route ' + selected)
const failures = []
const browser = await launchVisualBrowser()
let count = 0
try {
  async function capture(route, width, scheme) {
    const page = await openPublicPage(browser, {
      viewport: { width, height: 900 }, deviceScaleFactor: 1, colorScheme: scheme,
      locale: 'en-GB', timezoneId: 'Europe/Zurich', reducedMotion: 'reduce',
    })
    try {
      // A cold optional font can legitimately miss Chromium’s first-paint deadline.
      // Compare the designed Inter layout consistently. Lighthouse measures the production policy.
      await page.route('**/assets/fonts-*.css', async request => {
        const file = new URL('../site' + new URL(request.request().url()).pathname, import.meta.url)
        const css = await readFile(file, 'utf8')
        await request.fulfill({ contentType: 'text/css', body: css.replaceAll('font-display:optional', 'font-display:block') })
      })
      await page.clock.install({ time: new Date('2026-11-25T10:00:00Z') })
      await page.clock.pauseAt(new Date('2026-11-25T10:01:00Z'))
      await page.goto(siteOrigin + route)
      await page.getByRole('heading', { level: 1 }).first().waitFor()
      if (route === '/blocks/public-service/') await page.locator('main form[aria-busy="false"]').waitFor()
      if (/^\/docs\/components\/.+\/$/.test(route)) await page.locator('.al-preview-content > *').first().waitFor()
      await page.evaluate(async () => {
        const inter = [...document.fonts].filter(face => face.family.includes('Inter Variable'))
        if (!inter.length) throw Error('The portal must load its Inter font sheet')
        await Promise.all(inter.map(face => face.load()))
        await document.fonts.ready
      })
      await page.evaluate(async fullPage => {
        // Capture the entire homepage, including images beyond the lazy-load distance.
        const images = [...document.images]
        if (fullPage) for (const image of images) image.loading = 'eager'
        await Promise.all(images.filter(image => image.loading !== 'lazy').map(async image => {
          try { await image.decode() }
          catch (error) { if (fullPage) throw error }
        }))
      }, route === '/')
      const actual = await page.screenshot({ fullPage: route === '/', animations: 'disabled', caret: 'hide' })
      const slug = route.split('/').filter(Boolean).join('_') || 'home'
      const file = slug + '-' + width + '-' + scheme + '.png'
      const reference = new URL(file, destination)
      if (update) await writeFile(reference, actual)
      else {
        const expected = await readFile(reference).catch(err => {
          if (err.code !== 'ENOENT') throw err
        })
        const diff = expected ? difference(expected, actual) : { reason: 'reference missing' }
        if (diff) {
          failures.push(file + ' ' + diff.reason)
          await mkdir(diagnostics, { recursive: true })
          await writeFile(new URL(file, diagnostics), actual)
          if (diff.image) await writeFile(new URL('diff-' + file, diagnostics), diff.image)
        }
      }
      count++
    } finally { await page.close() }
  }
  if (update) await mkdir(destination, { recursive: true })
  const jobs = routes.filter(route => route !== '/').map(route => [route, 800, 'light'])
  if (routes.includes('/')) {
    for (const width of [320, 360, 640, 768, 800, 960, 1024, 1440, 2560])
      for (const scheme of ['light', 'dark']) jobs.push(['/', width, scheme])
  }
  async function worker() {
    for (let args; (args = jobs.shift());) await capture(...args)
  }
  await Promise.all([worker(), worker(), worker()])
} finally { await browser.close() }
assert.deepEqual(failures.sort(), [], 'Site screenshot changes')
console.log((update ? 'Recorded ' : 'Verified ') + count + ' site screenshots across ' + routes.length + ' public pages.')
