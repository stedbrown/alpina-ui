import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { publicRoutes, openPublicPage, siteOrigin } from './public-pages.mjs'

// CSS pixels. Fractional glyph bearings can extend a pixel beyond a line box.
function layoutIssues() {
  const tolerance = 1.1
  const errors = new Set()
  const canvas = document.createElement('canvas').getContext('2d')
  if (document.documentElement.scrollWidth > innerWidth + 1) errors.add('Page scrolls horizontally')
  for (const nav of document.querySelectorAll('header nav, nav.project-nav, nav.al-app-mobile')) {
    if (!nav.checkVisibility({ contentVisibilityAuto: true })) continue
    const menu = nav.querySelector('summary')
    if (menu?.checkVisibility()) continue
    const links = [...nav.querySelectorAll('a')].filter(a => a.checkVisibility())
    if (links.length < 2) continue
    const first = links[0].getBoundingClientRect()
    if (links.some(link => Math.abs(link.getBoundingClientRect().top - first.top) > 2)) {
      errors.add(nav.ariaLabel + ' wraps')
    }
  }
  const nav = document.querySelector('.al-app-bar > .site-nav')
  for (const button of document.querySelectorAll('header [data-site-appearance]')) {
    const header = button.closest('header')
    const menu = header.querySelector('summary')
    if (menu?.checkVisibility() && menu.getBoundingClientRect().right > button.getBoundingClientRect().left + tolerance)
      errors.add('Appearance control overlaps the menu')
  }
  const heading = document.querySelector('.component-hero h1')
  const preview = document.querySelector('.sample:not([hidden]) .preview-object')
  if (heading && preview && Math.abs(heading.getBoundingClientRect().left - preview.getBoundingClientRect().left) > tolerance)
    errors.add('Live example is off the component heading column')
  if (nav) {
    const control = nav.nextElementSibling
    const a = nav.getBoundingClientRect(), b = control.getBoundingClientRect()
    if (b.top >= a.bottom - tolerance || a.top >= b.bottom - tolerance) errors.add('Theme control wraps')
  }
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
  const bill = document.querySelector('.preview-object .al-qr-bill')
  if (bill) {
    const box = bill.getBoundingClientRect(), slip = bill.firstElementChild.getBoundingClientRect()
    if (Math.abs(slip.width - box.width) > tolerance || Math.abs(slip.height - box.height) > tolerance ||
        Math.abs(slip.width / slip.height - 2) > .01) errors.add('Payment slip does not fit the preview')
  }
  return [...errors]
}

const widths = [360, 768, 800, 1024, 1440]
const routes = await publicRoutes()
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
      if (/^\/docs\/components\/.+\/$/.test(route)) await page.locator('.preview-object').waitFor()
      await page.evaluate(() => document.fonts.ready)
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 })
        const issues = await page.evaluate(layoutIssues)
        if (issues.length) failures.push(route + ' ' + width + 'px: ' + issues.join(', '))
        const menu = page.locator('nav[data-collapsible] summary:visible').first()
        if (await menu.count()) {
          await menu.evaluate(el => { el.parentElement.open = true })
          const menuIssues = await page.evaluate(layoutIssues)
          if (menuIssues.length) failures.push(route + ' ' + width + 'px (menu open): ' + menuIssues.join(', '))
          await menu.evaluate(el => { el.parentElement.open = false })
        }
      }
      if (route === '/themes/') assert.match(await page.locator('#theme-preview time').innerText(), /March/)
    }
  }))
  assert.deepEqual(failures.sort(), [], 'Public page layout regressions')
  console.log(routes.length + ' public pages fit ' + widths.join(', ') + ' px, including navigation, text and placeholders.')
} finally { await browser.close() }
