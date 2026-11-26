import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { readableLabelIssues } from './readable-labels.mjs'
import { publicRoutes, openPublicPage, siteOrigin } from './public-pages.mjs'

// CSS pixels. Fractional glyph bearings can extend a pixel beyond a line box.
function layoutIssues() {
  const tolerance = 1.1
  const errors = new Set()
  const canvas = document.createElement('canvas').getContext('2d')
  if (document.documentElement.scrollWidth > innerWidth + 1) errors.add('Page scrolls horizontally')
  for (const nav of document.querySelectorAll('header nav, nav[data-project-nav], nav.al-app-mobile')) {
    if (!nav.checkVisibility({ contentVisibilityAuto: true })) continue
    const menu = nav.querySelector('button[popovertarget], summary')
    if (menu?.checkVisibility()) continue
    const links = [...nav.querySelectorAll('a')].filter(a => a.checkVisibility())
    if (links.length < 2) continue
    const first = links[0].getBoundingClientRect()
    if (links.some(link => {
      const box = link.getBoundingClientRect()
      return Math.abs(box.top + box.height / 2 - first.top - first.height / 2) > 2
    })) {
      errors.add(nav.ariaLabel + ' wraps')
    }
  }
  // Inspect the painted text, including values that stay inside the page but wrap inside a card.
  function checkLines(range, label) {
    const runs = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0)
    if (runs.some(rect => rect.top > (runs[0]?.top ?? rect.top) + tolerance)) errors.add('Split value: ' + label)
  }
  if (location.pathname === '/blocks/public-service/') {
    const visible = selector => [...document.querySelectorAll(selector)].filter(el => el.checkVisibility())
    const buttons = visible('main button[aria-pressed]')
    const steps = visible('main ol[aria-label] > li')
    const compactLanguage = visible('main select').length
    const compactProgress = visible('main p[aria-current=step]').length
    if (!(buttons.length === 5 && !compactLanguage || !buttons.length && compactLanguage === 1))
      errors.add('Expected one usable language picker')
    if (!(steps.length === 4 && !compactProgress || !steps.length && compactProgress === 1))
      errors.add('Expected one progress indicator')
    for (const row of [buttons, steps]) {
      for (const item of row) {
        if (item.offsetTop !== row[0].offsetTop) errors.add('Service navigation breaks into rows')
        const text = document.createRange()
        text.selectNodeContents(item)
        checkLines(text, item.textContent)
      }
    }
    if (innerWidth === 800 && !(compactLanguage && compactProgress)) errors.add('Expected compact English navigation at 800px')
  }
  if (location.pathname === '/docs/components/table/') {
    for (const header of document.querySelectorAll('.al-preview-content thead th')) {
      const text = document.createRange()
      text.selectNodeContents(header)
      checkLines(text, 'print-run table heading ' + header.textContent)
    }
  }
  for (const value of document.querySelectorAll('time, .al-swiss-figures bdi, .al-type[data-numeric], .al-table-value, .al-bill-number, a[href^="tel:"], .al-chart-value, .al-series-bars li > :last-child, .al-series-scale span, .al-series-table td:last-child')) {
    if (!value.checkVisibility() || value.matches(':has(.al-swiss-figures)')) continue
    const range = document.createRange()
    range.selectNodeContents(value)
    checkLines(range, value.textContent.trim())
    const line = value.closest('.al-type[data-numeric]')
    if (line && range.getBoundingClientRect().right > line.getBoundingClientRect().right + tolerance)
      errors.add('Numeric value overflows: ' + value.textContent.trim())
  }
  for (const button of document.querySelectorAll('header [data-site-appearance]')) {
    const header = button.closest('header')
    const menu = header.querySelector('button[popovertarget], summary')
    if (menu?.checkVisibility() && menu.getBoundingClientRect().right > button.getBoundingClientRect().left + tolerance)
      errors.add('Appearance control overlaps the menu')
  }
  const heading = document.querySelector('.al-reference-heading h1')
  const preview = document.querySelector('.al-preview:not([hidden]) .al-preview-content')
  if (heading && preview && Math.abs(heading.getBoundingClientRect().left - preview.getBoundingClientRect().left) > tolerance)
    errors.add('Live example is off the component heading column')
  for (const el of document.querySelectorAll('input:placeholder-shown, textarea:placeholder-shown')) {
    if (!el.placeholder || !el.checkVisibility()) continue
    const style = getComputedStyle(el)
    const text = getComputedStyle(el, '::placeholder')
    canvas.font = [text.fontStyle, text.fontWeight, text.fontSize, text.fontFamily].join(' ')
    canvas.letterSpacing = text.letterSpacing
    // A multiline placeholder can wrap at spaces within a textarea.
    const lines = el.tagName === 'TEXTAREA' ? el.placeholder.split(/\s+/) : [el.placeholder]
    const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    if (lines.some(line => canvas.measureText(line).width > available + tolerance)) {
      errors.add('Placeholder clipped: ' + el.placeholder)
    }
  }
  for (const select of document.querySelectorAll('select:not([multiple])')) {
    if (!select.checkVisibility() || !select.selectedOptions.length) continue
    const style = getComputedStyle(select)
    canvas.font = [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily].join(' ')
    canvas.letterSpacing = style.letterSpacing
    const label = select.selectedOptions[0].label
    const arrow = style.appearance === 'none' ? 0 : 16
    const available = select.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - arrow
    if (canvas.measureText(label).width > available + tolerance) errors.add('Option clipped: ' + label)
  }
  const boxes = new WeakMap()
  function ancestors(el) {
    if (!el || el === document.body) return []
    if (boxes.has(el)) return boxes.get(el)
    const style = getComputedStyle(el)
    let clips = ancestors(el.parentElement)
    if (el.matches('script, style, option, textarea, template, [aria-hidden=true]') ||
        style.clipPath === 'inset(50%)' || style.clip !== 'auto') clips = null
    if (clips && ['hidden', 'clip'].some(v => v === style.overflowX || v === style.overflowY)) {
      const r = el.getBoundingClientRect()
      clips = clips.concat({ r, x: ['hidden','clip'].includes(style.overflowX), y: ['hidden','clip'].includes(style.overflowY) })
    }
    boxes.set(el, clips)
    return clips
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (!node.textContent.trim()) continue
    const el = node.parentElement
    if (!el.closest('pre,script,style,template,textarea') && el.checkVisibility()) {
      // Check tokens embedded in prose as well as semantically marked numeric fields.
      const tokens = /(?:CHF[\s\u202f]*[−-]?\d[\d’'.,\u202f]*|[−-]?\d[\d’'.,\u202f]*[ \u00a0\u202f]+CHF|(?:CH|LI)\d{2}(?:[ \u00a0]?\d){17}|\+41(?:[ \u00a0]?\d){9}|\b(?:\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2}|(?:[A-Z]{1,4}[-‑])\d{2,}(?:[.-]\d+)*|\d{2,}[.,]\d{2,})\b)/gu
      for (const match of node.textContent.matchAll(tokens)) {
        range.setStart(node, match.index)
        range.setEnd(node, match.index + match[0].length)
        checkLines(range, match[0])
      }
    }
    const clips = ancestors(el)
    if (!clips?.length || !el.checkVisibility()) continue
    range.selectNodeContents(node)
    for (const rect of range.getClientRects()) {
      if (!rect.width || !rect.height) continue
      if (clips.some(({r,x,y}) => (x && (rect.left < r.left - tolerance || rect.right > r.right + tolerance)) ||
          (y && (rect.top < r.top - tolerance || rect.bottom > r.bottom + tolerance)))) {
        errors.add('Text clipped: ' + node.textContent.trim().slice(0, 70))
      }
    }
  }
  const bill = document.querySelector('.al-preview-content .al-qr-bill')
  if (bill) {
    const box = bill.getBoundingClientRect(), slip = bill.firstElementChild.getBoundingClientRect()
    if (Math.abs(slip.width - box.width) > tolerance || Math.abs(slip.height - box.height) > tolerance ||
        Math.abs(slip.width / slip.height - 2) > .01) errors.add('Payment slip does not fit the preview')
  }
  return [...errors]
}

const widths = [320, 360, 640, 768, 800, 960, 1024, 1440]
const selected = process.argv.find(arg => arg.startsWith('--route='))?.slice('--route='.length)
const routes = (await publicRoutes()).filter(route => !selected || selected === route)
assert.ok(routes.length, 'Unknown public route ' + selected)
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })
try {
  const pages = await Promise.all(Array.from({ length: 3 }, () => openPublicPage(browser)))
  const failures = []
  await Promise.all(pages.map(async (page, worker) => {
    for (let i = worker; i < routes.length; i += pages.length) {
      const route = routes[i]
      await page.goto(siteOrigin + route)
      await page.getByRole('heading', { level: 1 }).first().waitFor()
      if (/^\/docs\/components\/.+\/$/.test(route)) await page.locator('.al-preview-content').waitFor()
      await page.evaluate(() => document.fonts.ready)
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 })
        if (route === '/blocks/public-service/')
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const issues = [...await page.evaluate(layoutIssues), ...await page.evaluate(readableLabelIssues)]
        if (issues.length) failures.push(route + ' ' + width + 'px: ' + issues.join(', '))
        const menu = page.locator('nav[data-collapsible] button[popovertarget]:visible').first()
        if (await menu.count()) {
          await menu.press('Enter')
          const menuIssues = await page.evaluate(layoutIssues)
          if (menuIssues.length) failures.push(route + ' ' + width + 'px (menu open): ' + menuIssues.join(', '))
          await page.keyboard.press('Escape')
        }
      }
      if (route === '/themes/') assert.match(await page.locator('[data-theme-preview="light"] time').innerText(), /March/)
    }
  }))
  assert.deepEqual(failures.sort(), [], 'Public page layout regressions')
  console.log(routes.length + ' public pages fit ' + widths.join(', ') + ' px, including navigation, text and placeholders.')
} finally { await browser.close() }
