import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { chromium } from 'playwright-core'
import { mountComponentGallery } from './component-gallery.mjs'

// macOS uses the pinned Linux browser environment so native rasterizers do not
// turn font substitution into an apparent design regression.
if (process.platform === 'darwin' || process.argv.includes('--linux-container')) {
  const { version } = createRequire(import.meta.url)('playwright-core/package.json')
  const root = fileURLToPath(new URL('../', import.meta.url))
  const args = process.argv.slice(2).filter(arg => arg !== '--linux-container')
  const result = spawnSync('docker', [
    'run', '--rm', '--init', '--platform', 'linux/amd64', '--shm-size', '1g',
    '--mount', 'type=bind,source=' + root + ',target=/workspace',
    '--mount', 'type=tmpfs,target=/workspace/node_modules', '--workdir', '/workspace',
    'mcr.microsoft.com/playwright:v' + version + '-noble',
    'sh', '-ec', 'npm ci --no-audit --no-fund && node tests/visual-regression.browser.mjs "$@"', 'visual', ...args,
  ], { stdio: 'inherit' })
  if (result.error) throw new Error('Start Docker to run the pinned Linux visual suite. See docs/visual-testing.md.', { cause: result.error })
  process.exit(result.status ?? 1)
}
const platform = process.platform === 'win32' ? 'windows' : 'linux'
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

function difference(expectedBytes, actualBytes) {
  if (expectedBytes.equals(actualBytes)) return
  const expected = PNG.sync.read(expectedBytes), actual = PNG.sync.read(actualBytes)
  if (actual.width !== expected.width || actual.height !== expected.height) {
    return { reason: `expected ${expected.width}×${expected.height}, received ${actual.width}×${actual.height}` }
  }
  const { width, height } = actual
  const diff = new PNG({ width, height })
  const changed = pixelmatch(expected.data, actual.data, diff.data, width, height, {
    threshold: 0.14, includeAA: false, alpha: 0.3,
  })
  const allowed = Math.max(5, Math.min(128, Math.floor(width * height * 0.001)))
  if (changed > allowed) return { reason: `${changed} pixels differ (limit ${allowed})`, image: PNG.sync.write(diff) }
}

const results = []
const browser = await chromium.launch({
  args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'],
  // Inter comes from Alpina itself. Limit native fallback to the same DejaVu
  // families across Linux distributions, including the QR slip and mono code.
  env: platform === 'linux' ? { ...process.env, FONTCONFIG_FILE: fileURLToPath(new URL('./visual-fonts.conf', import.meta.url)) } : process.env,
})
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
