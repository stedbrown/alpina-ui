import assert from 'node:assert/strict'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'
import { mountComponentGallery } from './component-gallery.mjs'

// Apply user font preferences and the four simultaneous WCAG 1.4.12 overrides.
// Local scrollports (tables, code and physical documents) retain reachable content.
const spacing = '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important } p { margin-block-end: 2em !important }'
function inspect(root) {
  const failures = new Set()
  const result = new Map()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let text; (text = walker.nextNode());) {
    if (!text.data.trim()) continue
    const parent = text.parentElement
    if (parent.closest('option,script,style,textarea,[hidden],[aria-hidden="true"]') || !parent.checkVisibility()) continue
    const svg = parent.closest('svg')
    if (svg) continue // The chart's data table supplies these values at adjustable text size.
    const label = text.data.trim().slice(0, 55)
    const id = parent.closest('[data-component]')?.dataset.component ?? location.pathname
    range.selectNodeContents(text)
    const runs = [...range.getClientRects()].filter(r => r.width && r.height)
    if (!runs.length) continue
    let xScrollable = false, screenReaderOnly = false
    const clips = []
    for (let ancestor = parent; ancestor && ancestor !== root.parentElement; ancestor = ancestor.parentElement) {
      const css = getComputedStyle(ancestor)
      if (css.clipPath === 'inset(50%)' || css.clip !== 'auto') { screenReaderOnly = true; break }
      if (css.overflowX === 'auto' || css.overflowX === 'scroll') xScrollable = true
      if (['hidden','clip'].includes(css.overflowX) || ['hidden','clip'].includes(css.overflowY)) {
        clips.push({ box: ancestor.getBoundingClientRect(), x: ['hidden','clip'].includes(css.overflowX), y: ['hidden','clip'].includes(css.overflowY) })
      }
    }
    if (screenReaderOnly) continue
    for (const run of runs) {
      if (!xScrollable && (run.left < -1.5 || run.right > innerWidth + 1.5)) failures.add(id + ' outside viewport: ' + label)
      if (clips.some(({box,x,y}) => (x && (run.left < box.left - 1.5 || run.right > box.right + 1.5)) ||
          (y && (run.top < box.top - 1.5 || run.bottom > box.bottom + 1.5)))) failures.add(id + ' clips: ' + label)
    }
    result.set(id, (result.get(id) ?? 0) + 1)
  }
  return { failures: [...failures], counts: Object.fromEntries(result) }
}

async function checkNarrowDatePicker(page, requireFullWeek = false) {
  const sample = page.locator('[data-component="date-picker"]')
  await sample.locator('[aria-haspopup="dialog"]').press('Enter')
  const calendar = sample.locator('dialog[open] .al-calendar')
  await calendar.waitFor()
  await calendar.locator('[data-day][tabindex="0"]').press('End')
  const bounds = await calendar.evaluate(el => {
    const grid = el.getBoundingClientRect()
    const sunday = el.querySelector('[data-day]:focus')
    const box = sunday.getBoundingClientRect()
    const header = el.querySelector('thead th:last-child')
    const runs = document.createRange()
    runs.selectNodeContents([...header.children].find(label => label.checkVisibility()))
    return {
      weekday: sunday.closest('td').cellIndex,
      lastColumn: sunday.closest('tr').cells.length - 1,
      fullyVisible: box.left >= grid.left - 1 && box.right <= grid.left + el.clientWidth + 1,
      headerFits: runs.getClientRects().length === 1 && runs.getBoundingClientRect().right <= grid.left + el.clientWidth + 1,
      overflow: el.scrollWidth - el.clientWidth,
    }
  })
  assert.equal(bounds.weekday, bounds.lastColumn, 'End moves to Sunday')
  assert.ok(bounds.fullyVisible && bounds.headerFits, 'Sunday and its heading must be readable at 320px ')
  if (requireFullWeek) assert.ok(bounds.overflow <= 1, 'All seven days must fit without horizontal scrolling at 320px')
  await page.keyboard.press('Escape')
}

const browser = await launchBrowser()
try {
  const errors = []
  const narrow = await browser.newPage({ viewport: { width: 180, height: 600 }, isMobile: true, hasTouch: true })
  narrow.setDefaultTimeout(15_000)
  await mountComponentGallery(narrow)
  async function checkNarrowCalendar(calendar) {
    const headings = calendar.getByRole('columnheader')
    assert.equal(await headings.count(), 7, 'Week numbers require explicit opt-in')
    const next = calendar.locator('.al-calendar-head button').last()
    await next.click()
    const day = calendar.locator('[data-day][tabindex="0"]')
    await day.press('End')
    const sunday = calendar.locator('[data-day]:focus')
    assert.equal(await sunday.evaluate(el => el.closest('td').cellIndex), 6)
    const readable = await calendar.evaluate(el => {
      const box = el.getBoundingClientRect()
      return el.scrollWidth <= el.clientWidth + 1 && [...el.querySelectorAll('th[scope=col], button')].every(control => {
        const rect = control.getBoundingClientRect()
        return rect.left >= -1 && rect.right <= innerWidth + 1 && rect.left >= box.left - 1 && rect.right <= box.right + 1
      })
    })
    assert.ok(readable, 'Both month controls and seven weekday columns must fit 180 CSS pixels')
    await sunday.press('Enter')
  }
  await checkNarrowCalendar(narrow.locator('[data-component="calendar"] .al-calendar'))
  await narrow.locator('[data-component="date-picker"] [aria-haspopup="dialog"]').click()
  await checkNarrowCalendar(narrow.locator('[data-component="date-picker"] dialog .al-calendar'))
  await narrow.close()
  for (const width of [320, 640, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    page.setDefaultTimeout(15_000)
    await mountComponentGallery(page)
    await page.locator('.al-bill-reading summary, .al-series details summary').evaluateAll(nodes => {
      for (const summary of nodes) summary.parentElement.open = true
    })
    const root = page.locator('#gallery')
    const baseFont = await page.locator('.al-button').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))
    const baseline = await root.evaluate(inspect)
    if (width === 320) await checkNarrowDatePicker(page, true)
    for (const [mode, css] of [
      ['200% text', 'html { font-size: 200% !important }'],
      ['WCAG spacing', spacing],
      ['200% text with spacing', 'html { font-size: 200% !important } ' + spacing],
    ]) {
      const style = await page.addStyleTag({ content: css })
      if (mode.startsWith('200%')) {
        const font = await page.locator('.al-button').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))
        assert.ok(font >= baseFont * 2, 'Text zoom did not increase the font size')
      }
      if (width === 320) await checkNarrowDatePicker(page)
      const { failures, counts } = await root.evaluate(inspect)
      for (const issue of failures) errors.push(width + ' ' + mode + ' ' + issue)
      for (const [id, count] of Object.entries(baseline.counts)) {
        if (!counts[id] && count) errors.push(width + ' ' + mode + ' removed all text in ' + id)
      }
      await style.evaluate(el => el.remove())
    }
    await page.close()
  }
  const portal = await openPublicPage(browser, { viewport: { width: 800, height: 900 } })
  portal.setDefaultTimeout(15_000)
  for (const route of ['/', '/kit/', '/docs/components/swiss-address-form/', '/docs/components/data-table/', '/blocks/login/']) {
    await portal.goto(siteOrigin + route)
    await portal.locator('h1').first().waitFor()
    const enlarged = await portal.addStyleTag({ content: 'html { font-size: 200% !important } ' + spacing })
    await portal.evaluate(() => document.fonts.ready)
    const { failures } = await portal.locator('body').evaluate(inspect)
    errors.push(...failures.map(issue => 'Portal at 200% with spacing: ' + issue))
    await enlarged.evaluate(el => el.remove())
  }
  await portal.close()
  assert.deepEqual(errors, [], 'Text must remain visible or reachable in its named scroll region')
  console.log('Verified component text at 200% and with all four WCAG text-spacing overrides.')
} finally { await browser.close() }
