import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { platform, difference, launchVisualBrowser } from './visual-tools.mjs'
import { mountComponentGallery } from './component-gallery.mjs'
const references = new URL('./visual-reference/' + platform + '/', import.meta.url)
const diagnostics = new URL('../test-results/visual/', import.meta.url)
const { items } = JSON.parse(await readFile(new URL('../registry.json', import.meta.url), 'utf8'))
const widths = [320, 768, 1024, 1440]
const themes = ['light', 'dark']
const update = process.argv.includes('--update')
const requested = process.argv.find(arg => arg.startsWith('--component='))?.slice('--component='.length)
const names = items.map(item => item.name).filter(name => !requested || name === requested)
assert.ok(names.length, 'Unknown component ' + requested)

// Capture floating surfaces in use. The viewport includes anchored menus,
// backdrops, drawers and notifications that extend outside a trigger's box.
const modal = ['[aria-haspopup="dialog"]', 'Enter', 'dialog[open]']
const overlays = {
  dialog: modal, sheet: modal, drawer: modal, command: modal,
  'alert-dialog': modal, 'date-picker': modal,
  'dropdown-menu': ['[aria-haspopup="menu"]', 'Enter', '[role="menu"]'],
  menubar: ['[aria-haspopup="menu"]', 'ArrowDown', '[role="menu"]'],
  'context-menu': ['[aria-keyshortcuts]', 'Shift+F10', '[role="menu"]'],
  combobox: ['input[role="combobox"]', 'ArrowDown', '[role="listbox"]'],
  'canton-combobox': ['input[role="combobox"]', 'ArrowDown', '[role="listbox"]'],
  popover: ['[aria-haspopup="dialog"]', 'Enter', '.al-popover-panel'],
  'hover-card': ['button', 'Enter', '.al-hover-panel'],
  tooltip: ['button[aria-describedby]', 'focus', '[role="tooltip"]'],
  toast: ['footer button', 'Enter', '.al-toast-dismiss'],
}

const results = []
const browser = await launchVisualBrowser()
try {
  const jobs = widths.flatMap(width => themes.map(theme => ({ width, theme })))
  async function capture() {
    for (let job; (job = jobs.shift());) {
      const { width, theme } = job
      const context = await browser.newContext({
        viewport: { width, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1,
        colorScheme: theme, locale: 'en-GB', timezoneId: 'Europe/Zurich',
      })
      const page = await context.newPage()
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
        const actual = await page.screenshot({ ...framing, animations: 'disabled', caret: 'hide', scale: 'css' })
        if (overlay) {
          await page.keyboard.press('Escape')
          await page.evaluate(() => document.activeElement?.blur())
        } else {
          assert.ok(actual.readUInt32BE(20) >= Math.floor(rect.height), name + ' screenshot cropped the component')
        }
        const path = name + '/' + theme + '-' + width
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
} finally {
  await browser.close()
}
assert.deepEqual(results.sort(), [], 'Visual regressions (PNG diagnostics in test-results/visual)')
console.log(`${update ? 'Updated' : 'Verified'} ${names.length * widths.length * themes.length} component screenshots.`)
