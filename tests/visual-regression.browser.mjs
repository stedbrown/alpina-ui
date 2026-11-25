import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { platform, difference, launchVisualBrowser } from './visual-tools.mjs'
import { assertCaptureCanvas, assertPaintedProfile } from './display-profile.mjs'
import { mountComponentGallery, galleryOverlays as overlays } from './component-gallery.mjs'
const references = new URL('./visual-reference/' + platform + '/', import.meta.url)
const diagnostics = new URL('../test-results/visual/', import.meta.url)
const { items } = JSON.parse(await readFile(new URL('../registry.json', import.meta.url), 'utf8'))
const widths = [320, 768, 1024, 1440]
const themes = ['light', 'dark']
const contrastProfiles = [
  { width: 768, theme: 'light', appearance: 'forced-colors', media: { forcedColors: 'active' } },
  { width: 768, theme: 'dark', appearance: 'forced-colors-dark', media: { forcedColors: 'active' } },
  { width: 768, theme: 'light', appearance: 'contrast-more', media: { contrast: 'more' } },
  { width: 768, theme: 'dark', appearance: 'contrast-more-dark', media: { contrast: 'more' } },
]
const update = process.argv.includes('--update')
const requested = process.argv.find(arg => arg.startsWith('--component='))?.slice('--component='.length)
const names = items.map(item => item.name).filter(name => !requested || name === requested)
assert.ok(names.length, 'Unknown component ' + requested)

// Capture floating surfaces in use. The viewport includes anchored menus,
// backdrops, drawers and notifications that extend outside a trigger's box.
const results = []
const browser = await launchVisualBrowser()
const forcedBrowsers = []
try {
  const profiles = [...widths.flatMap(width => themes.map(theme => ({ width, theme, appearance: theme }))), ...contrastProfiles]
  const appearance = process.argv.find(arg => arg.startsWith('--appearance='))?.slice('--appearance='.length)
  const jobs = profiles.filter(profile => !appearance || profile.appearance === appearance)
  assert.ok(jobs.length, 'Unknown appearance ' + appearance)
  const comparisons = jobs.length * names.length
  async function capture() {
    for (let job; (job = jobs.shift());) {
      const { width, theme, appearance, media } = job
      const forced = media?.forcedColors === 'active'
      const instance = forced ? await launchVisualBrowser(theme) : browser
      if (forced) forcedBrowsers.push(instance)
      const context = await instance.newContext({
        viewport: { width, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1,
        colorScheme: theme, locale: 'en-GB', timezoneId: 'Europe/Zurich',
      })
      const page = await context.newPage()
      if (media) await page.emulateMedia(media)
      // Pin both the calendar and the transient loading states of asynchronous demos.
      await page.clock.install({ time: new Date('2026-11-25T10:00:00Z') })
      await page.clock.pauseAt(new Date('2026-11-25T10:01:00Z'))
      await mountComponentGallery(page)
      await page.evaluate(theme => document.documentElement.setAttribute('data-al-theme', theme), theme)
      await page.addStyleTag({ content: `
        [data-component] { display: none; }
        [data-component][data-capture] { display: flow-root; box-sizing: border-box; padding: 8px; }
      ` })
      for (const name of names) {
        const sample = page.locator('[data-component="' + name + '"]')
        await sample.evaluate(el => {
          document.querySelector('[data-capture]')?.removeAttribute('data-capture')
          el.setAttribute('data-capture', '')
        })
        await page.evaluate(() => document.fonts.ready)
        const rect = await sample.boundingBox()
        assert.ok(rect && Math.round(rect.width) === width && rect.height > 16, name + ' has no visible example')
        const overlay = overlays[name]
        if (overlay) {
          const [selector, activation, surface] = overlay
          const trigger = sample.locator(selector).first()
          if (activation === 'focus') await trigger.focus()
          else await trigger.press(activation)
          await page.clock.runFor(32)
          await sample.locator(surface).first().waitFor({ state: 'visible' })
        }
        const framing = overlay ? {} : { fullPage: true, clip: rect }
        await assertPaintedProfile(page, job)
        const actual = await page.screenshot({ ...framing, animations: 'disabled', caret: 'hide', scale: 'css' })
        if (overlay) {
          await page.keyboard.press('Escape')
          await page.evaluate(() => document.activeElement?.blur())
        } else {
          await assertCaptureCanvas(actual, job, sample, name)
          assert.ok(actual.readUInt32BE(20) >= Math.floor(rect.height), name + ' screenshot cropped the component')
        }
        const path = name + '/' + appearance + '-' + width
        const expected = new URL(path + '.png', references)
        if (update) {
          await mkdir(new URL(name + '/', references), { recursive: true })
          await writeFile(expected, actual)
          continue
        }
        const bytes = await readFile(expected).catch(error => {
          if (error.code !== 'ENOENT') throw error
        })
        const problem = bytes ? difference(bytes, actual) : { reason: 'reference missing' }
        if (problem) {
          await mkdir(new URL(name + '/', diagnostics), { recursive: true })
          await writeFile(new URL(path + '-actual.png', diagnostics), actual)
          if (problem.image) await writeFile(new URL(path + '-diff.png', diagnostics), problem.image)
          results.push(path + ': ' + problem.reason)
        }
      }
      await context.close()
    }
  }
  await Promise.all([capture(), capture(), capture()])
  assert.deepEqual(results.sort(), [], 'Visual regressions (PNG diagnostics in test-results/visual)')
  console.log((update ? 'Updated ' : 'Verified ') + comparisons + ' component screenshots.')
} finally { await Promise.all([browser, ...forcedBrowsers].map(instance => instance.close())) }
