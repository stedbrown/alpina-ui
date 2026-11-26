import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const origin = 'https://alpina.test'
const site = new URL('../site/', import.meta.url)
const executablePath = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(executablePath ? { executablePath }
  : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' })

async function openThemePage(options) {
  const page = await browser.newPage(options)
  await page.route(origin + '/**', route => {
    const { pathname } = new URL(route.request().url())
    const file = pathname.endsWith('/') ? pathname + 'index.html' : pathname
    return route.fulfill({ path: fileURLToPath(new URL('.' + file, site)) })
  })
  await page.goto(origin + '/themes/')
  return page
}

try {
  const host = await browser.newPage({ colorScheme: 'dark' })
  await host.setContent('<!doctype html><html><body>Webview invoice</body></html>')
  await host.addStyleTag({ path: fileURLToPath(new URL('../dist/styles.css', import.meta.url)) })
  for (const [theme, bg, ink] of [
    ['light', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)'],
    ['dark', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)'],
  ]) {
    const colors = await host.evaluate(theme => {
      document.documentElement.dataset.alTheme = theme
      return [getComputedStyle(document.documentElement).backgroundColor, getComputedStyle(document.body).color]
    }, theme)
    assert.deepEqual(colors, [bg, ink])
  }
  await host.close()
  const automatic = await openThemePage({ colorScheme: 'dark' })
  const themeButton = automatic.locator('[data-site-appearance]')
  const background = () => automatic.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)
  const modeOnPage = () => automatic.locator('html').getAttribute('data-al-theme')
  assert.equal(await modeOnPage(), 'auto')
  assert.equal(await background(), 'rgb(0, 0, 0)')
  await themeButton.click()
  assert.equal(await background(), 'rgb(255, 255, 255)')
  await automatic.goto(origin + '/docs/components/button/')
  await themeButton.waitFor()
  assert.equal(await modeOnPage(), 'light')
  await themeButton.click()
  await automatic.reload()
  assert.equal(await modeOnPage(), 'dark')
  await themeButton.click()
  await automatic.emulateMedia({ colorScheme: 'light' })
  assert.equal(await background(), 'rgb(255, 255, 255)')
  await automatic.emulateMedia({ colorScheme: 'dark' })
  assert.equal(await background(), 'rgb(0, 0, 0)')
  await automatic.goto(origin + '/')
  assert.equal(await modeOnPage(), 'auto')
  assert.equal(await background(), 'rgb(0, 0, 0)')
  await automatic.close()
  const fallback = await openThemePage({ javaScriptEnabled: false })
  assert.ok(await fallback.getByRole('link', { name: /Review invoice/ }).first().isVisible())
  const defaults = await fallback.getByRole('textbox', { name: 'CSS variables' }).inputValue()
  assert.match(defaults, /--al-unit: 0\.25rem/)
  assert.match(defaults, /--al-accent: #eb0000/)
  assert.match(defaults, /--al-accent: #ff5252/)
  assert.equal(await fallback.getByRole('button', { name: 'Copy CSS' }).count(), 0)
  await fallback.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  assert.equal(await fallback.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(0, 0, 0)')
  assert.equal(await fallback.locator('[data-theme-preview="light"]').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
  assert.equal(await fallback.locator('[data-theme-preview="dark"]').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(0, 0, 0)')
  assert.equal(await fallback.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--al-duration-fast').trim()), '0ms')
  await fallback.close()

  const page = await openThemePage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  const color = page.getByRole('textbox', { name: 'Accent color' })
  const dark = page.getByRole('textbox', { name: 'Dark accent' })
  const unit = page.getByRole('combobox', { name: 'Grid unit' })
  const copy = page.getByRole('button', { name: 'Copy CSS' })
  const reset = page.getByRole('button', { name: 'Restore defaults' })
  const css = page.getByRole('textbox', { name: 'CSS variables' })
  const light = page.getByRole('region', { name: 'Light preview' })
  const night = page.getByRole('region', { name: 'Dark preview' })
  const rendered = preview => preview.getByRole('link', { name: /Review invoice/ }).evaluate(el => {
    const style = getComputedStyle(el)
    return [style.color, style.backgroundColor, style.minBlockSize]
  })
  const cell = id => page.locator('#' + id).innerText()
  await color.waitFor()

  assert.equal(await css.inputValue(), defaults)
  assert.ok(await reset.isDisabled())
  await unit.selectOption('6')
  await color.fill('#ffffff')
  assert.deepEqual(await rendered(light), ['rgb(0, 0, 0)', 'rgb(255, 255, 255)', '66px'])
  assert.equal(await cell('contrast-light-button'), '21.00:1 · Pass')
  assert.equal(await cell('contrast-light-text'), '1.00:1 · Fail')
  // White already reads on black, so the suggested dark accent keeps it.
  assert.equal(await dark.inputValue(), '#ffffff')
  // The unrounded contrast against white is 4.498535... : display rounds to 4.50.
  await color.fill('#807474')
  assert.equal(await cell('contrast-light-text'), '4.50:1 · Fail')
  assert.equal((await rendered(light))[0], 'rgb(0, 0, 0)')
  await color.fill('#767676')
  assert.equal(await cell('contrast-light-text'), '4.54:1 · Pass')
  assert.equal((await rendered(light))[0], 'rgb(255, 255, 255)')
  assert.equal(await cell('contrast-dark-text'), '4.62:1 · Pass')
  // A dark accent that fails on black is lightened until it reads.
  await color.fill('#123456')
  const suggested = await dark.inputValue()
  assert.notEqual(suggested, '#123456')
  assert.match(await cell('contrast-dark-text'), /^4\.\d\d:1 · Pass$/)
  await color.fill('#767676')
  // Once edited, the dark accent no longer follows the light one.
  await dark.fill('#a0a0a0')
  await color.fill('#5a5a5a')
  assert.equal(await dark.inputValue(), '#a0a0a0')
  assert.deepEqual((await rendered(night)).slice(0, 2), ['rgb(0, 0, 0)', 'rgb(160, 160, 160)'])
  assert.equal(await night.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(0, 0, 0)')
  const custom = await css.inputValue()
  assert.match(custom, /\[data-al-theme="dark"\] \{[^}]*--al-accent: #a0a0a0/)
  assert.match(custom, /prefers-color-scheme: dark\) \{\s*\[data-al-theme="auto"\] \{[^}]*--al-accent: #a0a0a0/)
  assert.match(custom, /--al-unit: 0\.375rem/)
  assert.match(custom, /--al-accent: #5a5a5a/)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))

  // The address carries the theme to another visit.
  assert.deepEqual(Object.fromEntries(new URL(page.url()).searchParams), { accent: '5a5a5a', dark: 'a0a0a0', unit: '6' })
  await page.reload()
  await color.waitFor()
  assert.equal(await color.inputValue(), '#5a5a5a')
  assert.equal(await dark.inputValue(), '#a0a0a0')
  assert.equal(await unit.inputValue(), '6')
  assert.equal(await css.inputValue(), custom)

  // A starting color sets both accents and lets the dark accent follow the light one again.
  const blue = page.getByRole('button', { name: 'Lake blue' })
  await blue.click()
  assert.equal(await blue.getAttribute('aria-pressed'), 'true')
  assert.equal(await color.inputValue(), '#0057b8')
  assert.equal(await dark.inputValue(), '#6aa9ff')
  await color.fill('#123456')
  assert.equal(await blue.getAttribute('aria-pressed'), 'false')
  assert.equal(await dark.inputValue(), suggested)

  await page.emulateMedia({ forcedColors: 'active' })
  await page.waitForFunction(() => !document.querySelector('[data-theme-preview="light"]').style.getPropertyValue('--al-accent'))
  await page.emulateMedia({ forcedColors: 'none' })
  await page.waitForFunction(() => !!document.querySelector('[data-theme-preview="light"]').style.getPropertyValue('--al-accent'))
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async text => { window.testCss = text } },
  }))
  const feedback = page.getByRole('status').filter({ hasText: 'CSS' })
  await copy.press('Enter')
  assert.equal(await feedback.innerText(), 'CSS copied')
  assert.equal(await page.evaluate(() => window.testCss), await css.inputValue())
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: async () => { throw new DOMException('Clipboard unavailable', 'NotAllowedError') } },
  }))
  await copy.press('Space')
  assert.ok(await css.evaluate(el => el === document.activeElement && el.selectionStart === 0 && el.selectionEnd === el.value.length))
  assert.match(await feedback.innerText(), /CSS selected/)
  await reset.press('Enter')
  assert.ok(await reset.isDisabled())
  assert.equal(await css.inputValue(), defaults)
  assert.equal(await unit.inputValue(), '4')
  assert.equal(new URL(page.url()).search, '')
  assert.ok(await color.evaluate(el => el === document.activeElement))

  // A malformed color keeps the last valid theme and explains the format after leaving the field.
  await color.fill('#12')
  await color.press('Tab')
  assert.ok(await page.getByText('Enter a color in the form #rrggbb.').isVisible())
  assert.equal(await css.inputValue(), defaults)
  assert.deepEqual(errors, [])
  console.log('Theme builder passed contrast boundaries, light and dark accents, starting colors, shared addresses, clipboard fallback, reset and no-JS checks.')
} finally {
  await browser.close()
}
