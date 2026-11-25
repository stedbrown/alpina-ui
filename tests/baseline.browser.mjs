import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { mountComponentGallery } from './component-gallery.mjs'

const registry = JSON.parse(await readFile(new URL('../registry.json', import.meta.url)))
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })

function measureRhythm(root) {
  const errors = []
  const siblingBaselines = new WeakMap()
  const unit = parseFloat(getComputedStyle(document.documentElement).fontSize) / 4
  function check(label, value) {
    // Blink lays out in 1/64 CSS pixel increments.
    if (Number.isFinite(value) && Math.abs(value - unit * Math.round(value / unit)) > 1 / 32)
      errors.push(label + ' = ' + value + 'px')
  }
  const selector = '[class*="al-"], [class*="al-"] *'
  const elements = [root, ...root.querySelectorAll(selector)]
  for (const element of elements) {
    if (!(element instanceof HTMLElement) || !element.checkVisibility({ visibilityProperty: true })) continue
    const style = getComputedStyle(element)
    const box = element.getBoundingClientRect()
    if (!box.height || element.matches('option') || element.closest('.al-bill-slip')) continue
    // Ink-only geometry (icons, visually hidden announcements and column guides) has no line box.
    if ((element.closest('[aria-hidden="true"]') && !element.textContent.trim()) ||
        style.clipPath.startsWith('inset(50%') || style.clip.startsWith('rect(0px')) continue
    const name = (element.closest('[data-component]')?.dataset.component ?? 'overlay') +
      ' ' + (element.className || element.localName)
    check(name + ' padding start', parseFloat(style.paddingBlockStart))
    check(name + ' padding end', parseFloat(style.paddingBlockEnd))
    const ownText = [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
    if (ownText.length || element.matches('button,input,select,textarea'))
      check(name + ' line height', parseFloat(style.lineHeight))
    // An inline element's bounding rectangle is font ink. An aspect-ratio frame and the
    // payment slip have an external size contract. Their sibling controls are still audited.
    const parent = element.parentElement
    const parentStyle = getComputedStyle(parent)
    const intrinsic = element.matches('.al-aspect-ratio') || element.querySelector('.al-bill-slip')
    if (style.display !== 'inline' && style.display !== 'contents' && !intrinsic &&
        (element !== root || root.matches('[role=menu],[role=listbox],dialog,.al-popover-panel,.al-combo-popup')))
      check(name + ' border-box height', box.height)
    // Centering two odd numbers of modules can put the ink half a module from an
    // edge. This still catches a one-pixel translation, including on a fixed-height control.
    const centered = ['center', 'safe center'].includes(style.alignSelf === 'auto' ? parentStyle.alignItems : style.alignSelf)
    const inlineLine = style.display.startsWith('inline') && !['grid', 'flex', 'inline-flex', 'inline-grid'].includes(parentStyle.display)
    if (element !== root && !inlineLine && !intrinsic && !element.closest('.al-aspect-ratio') &&
        !['absolute', 'fixed'].includes(style.position) && style.display !== 'contents' && parentStyle.display !== 'inline') {
      const start = box.top - parent.getBoundingClientRect().top
      check(name + ' block-start alignment', centered ? 2 * start : start)
    }
    // Check actual laid-out glyph runs as well as computed leading. Baseline offsets
    // depend on the font's ascent, but consecutive lines must advance in whole modules.
    for (const node of ownText) {
      const range = document.createRange()
      range.selectNodeContents(node)
      const lines = [...range.getClientRects()]
      for (const line of lines.slice(1)) check(name + ' baseline advance', line.bottom - lines[0].bottom)
      if (lines[0] && !inlineLine && !intrinsic && ['grid', 'flex', 'block'].includes(parentStyle.display)) {
        const siblings = siblingBaselines.get(parent) ?? new Map()
        siblingBaselines.set(parent, siblings)
        const face = style.fontFamily + '/' + style.fontSize + '/' + style.lineHeight + '/' + style.fontWeight
        if (siblings.has(face)) {
          const advance = lines[0].bottom - siblings.get(face)
          check(name + ' sibling baseline', centered ? 2 * advance : advance)
        } else siblings.set(face, lines[0].bottom)
      }
    }
  }
  return [...new Set(errors)]
}

try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await mountComponentGallery(page)
  const sections = page.locator('#gallery > [data-component]')
  assert.deepEqual((await sections.evaluateAll(items => items.map(item => item.dataset.component))).sort(),
    registry.items.map(item => item.name).sort())
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 })
    for (const section of await sections.all()) {
      const failures = await section.evaluate(measureRhythm)
      assert.deepEqual(failures, [], width + 'px: ' + failures.join(', '))
    }
    for (const [component, trigger, panel] of [
      ['dialog', '[aria-haspopup=dialog]', 'dialog[open]'],
      ['sheet', '[aria-haspopup=dialog]', 'dialog[open]'],
      ['alert-dialog', '[aria-haspopup=dialog]', 'dialog[open]'],
      ['drawer', '[aria-haspopup=dialog]', 'dialog[open]'],
      ['command', '[aria-haspopup=dialog]', 'dialog[open]'],
      ['dropdown-menu', '[aria-haspopup=menu]', '[role=menu]'],
      ['menubar', '[aria-haspopup=menu]', '[role=menu]'],
      ['popover', '[aria-haspopup=dialog]', '.al-popover-panel'],
      ['combobox', 'input[role=combobox]', '.al-combo-popup'],
      ['canton-combobox', 'input[role=combobox]', '[role=listbox]'],
    ]) {
      const control = page.locator('[data-component="' + component + '"] ' + trigger).first()
      await control.click()
      if (component.includes('combobox')) await control.press('ArrowDown')
      const surface = page.locator(panel + ':visible').last()
      await surface.waitFor()
      const failures = await surface.evaluate(measureRhythm)
      assert.deepEqual(failures, [], width + 'px ' + component + ': ' + failures.join(', '))
      await page.keyboard.press('Escape')
      await surface.waitFor({ state: 'hidden' })
    }
  }
  // Exercise the audit itself with a one-pixel layout regression, without changing height.
  const iban = page.locator('[data-component="iban-input"]')
  await iban.locator('input').evaluate(el => { el.style.position = 'relative'; el.style.top = '1px' })
  assert.ok((await iban.evaluate(measureRhythm)).some(error => error.includes('block-start alignment')))
  const origin = 'https://alpina.test'
  await page.route(origin + '/**', route => route.fulfill({
    path: fileURLToPath(new URL('../site' + new URL(route.request().url()).pathname, import.meta.url)),
  }))
  for (const url of [new URL('../site/catalog.html#button', import.meta.url).href, origin + '/themes/index.html']) {
    await page.goto(url)
    const overlay = page.locator('[data-site-grid]')
    assert.equal(await overlay.isVisible(), false)
    await page.keyboard.press('Control+Shift+g')
    assert.equal(await overlay.isVisible(), true)
    for (const [width, columns, margin] of [[320, 4, 16], [768, 8, 24], [1280, 12, 32]]) {
      await page.setViewportSize({ width, height: 800 })
      const guides = overlay.locator('.al-grid-guides')
      assert.equal(await guides.locator('i:visible').count(), columns)
      assert.equal((await guides.boundingBox()).x, margin)
      assert.match(await guides.evaluate(el => getComputedStyle(el).backgroundImage), /repeating-linear-gradient/)
    }
    await page.keyboard.press('Control+Shift+g')
    assert.equal(await overlay.isVisible(), false)
  }
  assert.deepEqual(errors, [])
  console.log('Measured ' + registry.items.length + ' component previews on the baseline at 320, 768 and 1280 px.')
} finally {
  await browser.close()
}
