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
  assert.ok(await fallback.getByRole('link', { name: /Review invoice/ }).isVisible())
  const defaults = await fallback.getByRole('textbox', { name: 'CSS variables' }).inputValue()
  assert.match(defaults, /--al-unit: 0\.25rem/)
  assert.match(defaults, /--al-accent: #eb0000/)
  assert.equal(await fallback.getByRole('button', { name: 'Copy CSS' }).count(), 0)
  await fallback.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  assert.equal(await fallback.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(0, 0, 0)')
  assert.equal(await fallback.locator('#theme-preview').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
  assert.equal(await fallback.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--al-duration-fast').trim()), '0ms')
  await fallback.close()

  const page = await openThemePage({ viewport: { width: 390, height: 844 } })
  const color = page.getByLabel('Accent color')
  const unit = page.getByRole('combobox', { name: 'Grid unit' })
  const mode = page.getByRole('combobox', { name: 'Appearance' })
  const copy = page.getByRole('button', { name: 'Copy CSS' })
  const reset = page.getByRole('button', { name: 'Restore defaults' })
  const css = page.getByRole('textbox', { name: 'CSS variables' })
  const preview = page.getByRole('region', { name: 'Live invoice preview' })
  const example = preview.getByRole('link', { name: /Review invoice/ })
  const rendered = () => example.evaluate(el => {
    const style = getComputedStyle(el)
    return [style.color, style.backgroundColor, style.minBlockSize]
  })
  async function setAccent(hex) {
    await color.evaluate((input, value) => {
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }, hex)
  }

  assert.equal(await css.inputValue(), defaults)
  assert.ok(await reset.isDisabled())
  await unit.selectOption('6')
  await setAccent('#ffffff')
  assert.deepEqual(await rendered(), ['rgb(0, 0, 0)', 'rgb(255, 255, 255)', '66px'])
  assert.equal(await page.locator('#button-contrast').innerText(), '21.00:1 · Pass')
  assert.equal(await page.locator('#text-contrast').innerText(), '1.00:1 · Fail')
  // The unrounded contrast against white is 4.498535... : display rounds to 4.50.
  await setAccent('#807474')
  assert.equal(await page.locator('#text-contrast').innerText(), '4.50:1 · Fail')
  assert.equal((await rendered())[0], 'rgb(0, 0, 0)')
  await setAccent('#767676')
  assert.equal(await page.locator('#text-contrast').innerText(), '4.54:1 · Pass')
  assert.equal((await rendered())[0], 'rgb(255, 255, 255)')
  await mode.selectOption('dark')
  assert.equal(await preview.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(0, 0, 0)')
  assert.equal(await page.locator('#text-contrast').innerText(), '4.62:1 · Pass')
  const custom = await css.inputValue()
  assert.match(custom, /\[data-al-theme="dark"\]/)
  assert.match(custom, /--al-unit: 0\.375rem/)
  assert.match(custom, /--al-accent: #767676/)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))

  await page.emulateMedia({ forcedColors: 'active' })
  await page.waitForFunction(() => !document.querySelector('#theme-preview').style.getPropertyValue('--al-accent'))
  await page.emulateMedia({ forcedColors: 'none' })
  await page.waitForFunction(() => !!document.querySelector('#theme-preview').style.getPropertyValue('--al-accent'))
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async text => { window.testCss = text } },
  }))
  await copy.press('Enter')
  assert.equal(await page.getByRole('status').innerText(), 'CSS copied')
  assert.equal(await page.evaluate(() => window.testCss), custom)
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: async () => { throw new DOMException('Clipboard unavailable', 'NotAllowedError') } },
  }))
  await copy.press('Space')
  assert.ok(await css.evaluate(el => el === document.activeElement && el.selectionStart === 0 && el.selectionEnd === el.value.length))
  assert.match(await page.getByRole('status').innerText(), /CSS selected/)
  await reset.press('Enter')
  assert.ok(await reset.isDisabled())
  assert.equal(await css.inputValue(), defaults)
  assert.equal(await mode.inputValue(), 'light')
  assert.equal(await unit.inputValue(), '4')
  assert.ok(await color.evaluate(el => el === document.activeElement))
  await mode.selectOption('auto')
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.waitForFunction(() => document.getElementById('theme-accent').value === '#ff5252')
  assert.deepEqual((await rendered()).slice(0, 2), ['rgb(0, 0, 0)', 'rgb(255, 82, 82)'])
  assert.match(await css.inputValue(), /prefers-color-scheme: light/)
  assert.match(await css.inputValue(), /prefers-color-scheme: dark/)
  await page.emulateMedia({ colorScheme: 'light' })
  await page.waitForFunction(() => document.getElementById('theme-accent').value === '#eb0000')
  console.log('Theme builder passed contrast boundaries, live controls, clipboard fallback, reset and no-JS checks.')
} finally {
  await browser.close()
}
