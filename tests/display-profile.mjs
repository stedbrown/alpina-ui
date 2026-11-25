import assert from 'node:assert/strict'
import { PNG } from 'pngjs'

// Chromium's native palette is process-wide. Media emulation alone can match
// the forced-colors query while the compositor still paints authored colours.
export function forcedPaletteArgs(theme) {
  return theme ? ['--force-high-contrast', ...(theme === 'dark' ? ['--force-dark-mode'] : [])] : []
}

const accents = {
  light: 'eb0000', dark: 'ff5252',
  'contrast-more': 'a90000', 'contrast-more-dark': 'ff9292',
  'forced-colors': '000000', 'forced-colors-dark': 'ffffff',
}

// The first pixel must undergo the browser's own forced-colour substitution.
// The second checks the actual system ink or authored contrast token. A manual
// popover keeps the two-pixel witness above open dialogs without moving focus.
export async function assertPaintedProfile(page, { theme, appearance, media }) {
  const forced = media?.forcedColors === 'active'
  const more = media?.contrast === 'more'
  const state = await page.evaluate(({ theme, forced, more }) => {
    const probe = document.createElement('div')
    probe.setAttribute('popover', 'manual')
    probe.dataset.paletteWitness = ''
    probe.setAttribute('aria-hidden', 'true')
    probe.style.cssText = 'all:initial;position:fixed;inset:0 auto auto 0;margin:0;padding:0;border:0;width:2px;height:1px;display:flex;pointer-events:none;color-scheme:inherit'
    const author = document.createElement('i')
    author.style.cssText = 'display:block;width:1px;height:1px;background:#ff99aa'
    const ink = author.cloneNode()
    ink.style.forcedColorAdjust = 'none'
    ink.style.backgroundColor = forced ? 'CanvasText' : 'var(--al-accent)'
    probe.append(author, ink)
    const parent = document.querySelector(':modal') ?? document.body
    parent.append(probe)
    probe.showPopover()
    return {
      theme: document.documentElement.dataset.alTheme === theme && matchMedia('(prefers-color-scheme: ' + theme + ')').matches,
      forced: matchMedia('(forced-colors: active)').matches === forced,
      contrast: forced || matchMedia('(prefers-contrast: more)').matches === more,
    }
  }, { theme, forced, more })
  try {
    assert.deepEqual(state, { theme: true, forced: true, contrast: true }, 'Unexpected media state for ' + appearance)
    const probe = page.locator('[data-palette-witness]')
    const png = PNG.sync.read(await probe.screenshot({ scale: 'css', animations: 'disabled', caret: 'hide' }))
    assert.equal(png.width, 2)
    assert.equal(png.height, 1)
    const author = forced ? (theme === 'dark' ? '000000' : 'ffffff') : 'ff99aa'
    assert.equal(png.data.subarray(0, 3).toString('hex'), author, appearance + ' did not paint the expected system palette')
    assert.equal(png.data.subarray(4, 7).toString('hex'), accents[appearance], appearance + ' did not paint the expected ink or accent')
  } finally {
    await page.locator('[data-palette-witness]').evaluate(el => el.remove())
  }
}

export async function assertCaptureCanvas(bytes, { theme, media }, sample, name) {
  if (media?.forcedColors !== 'active') return
  // The gallery gives every in-flow example an uncovered 8 px margin.
  const { data, width } = PNG.sync.read(bytes)
  const canvas = theme === 'dark' ? '000000' : 'ffffff'
  assert.equal(data.subarray(0, 3).toString('hex'), canvas, name + ' was captured outside the native forced palette')
  if (name === 'swiss-qr-bill' || name === 'invoice-document') {
    // A clear patch inside the lower-right paper margin must follow the system
    // canvas too. The functional test decodes the adjacent unforced QR symbol.
    const position = await sample.evaluate(el => {
      const origin = el.getBoundingClientRect()
      const slip = el.querySelector('.al-bill-slip').getBoundingClientRect()
      return [Math.floor(slip.right - origin.left - 8), Math.floor(slip.bottom - origin.top - 8)]
    })
    const offset = (position[1] * width + position[0]) * 4
    assert.equal(data.subarray(offset, offset + 3).toString('hex'), canvas, name + ' paper does not match the native palette')
  }
}
