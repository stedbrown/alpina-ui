import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ThemeToggle } from 'alpina-ui/portal/app-shell'
import { themeInitializationScript } from 'alpina-ui/portal/theme-initialization'
import { Icon } from 'alpina-ui/ui/icon'
import { NavigationAction, NavigationBrand, NavigationMenu } from 'alpina-ui/portal/navigation-menu'
import { launchBrowser } from './launch-browser.mjs'

const links = [{ href: '#services', label: 'Services', current: true }, { href: '#fees', label: 'Fees' }]
const browser = await launchBrowser()
try {
  const page = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } })
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')
  for (const surface of ['paper', 'ink', 'accent']) {
    const nav = renderToStaticMarkup(createElement(NavigationMenu, {
      label: 'Office', orientation: 'horizontal', collapseLabel: 'Menu', surface, sections: [{ links }],
    }))
    await page.setViewportSize({ width: 320, height: 700 })
    await page.setContent('<meta name="viewport" content="width=device-width"><style>' + css + '</style>' + nav)
    const trigger = page.getByRole('button', { name: 'Menu', exact: true })
    const active = page.getByRole('link', { name: 'Services' })
    assert.equal(await active.count(), 0)
    await trigger.press('Enter')
    await active.waitFor()
    assert.equal(await active.getAttribute('aria-current'), 'page')
    await page.keyboard.press('Tab')
    assert.ok(await active.evaluate(el => el === document.activeElement))
    await page.keyboard.press('Escape')
    assert.equal(await active.count(), 0)
    assert.ok(await trigger.evaluate(el => el === document.activeElement))
    await page.setViewportSize({ width: 1100, height: 700 })
    await active.waitFor()
    assert.equal(await trigger.count(), 0)
    const [bar, ink, sheet] = await active.evaluate(el => [
      getComputedStyle(el, '::before').borderBottomWidth,
      getComputedStyle(el).color, getComputedStyle(el.closest('nav')).backgroundColor,
    ])
    assert.equal(bar, '3px')
    assert.deepEqual([ink, sheet], surface === 'paper' ? ['rgb(0, 0, 0)', 'rgb(255, 255, 255)']
      : ['rgb(255, 255, 255)', surface === 'ink' ? 'rgb(0, 0, 0)' : 'rgb(235, 0, 0)'])
  }
  const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 320, height: 700 } })
  const framed = renderToStaticMarkup(createElement(NavigationMenu, {
    label: 'Primary', collapseLabel: 'Menu', sections: [{ links }],
    brand: createElement(NavigationBrand, { href: '/', logo: '/logo.svg' }, 'Office'),
    actions: [
      createElement(NavigationAction, { key: 'version', href: '/releases/' }, 'v1.0.0'),
      createElement(NavigationAction, { key: 'repository', href: '/github/', icon: createElement(Icon, { name: 'github' }) }, 'GitHub'),
      createElement(ThemeToggle, { key: 'theme' }),
    ],
  }))
  await context.route('https://office.test/**', route => route.fulfill({ contentType: 'text/html', body:
    '<html data-al-theme="auto"><head><style>' + css + '</style><script>' + themeInitializationScript +
    '</script></head><body>' + framed + '</body></html>' }))
  const first = await context.newPage(), second = await context.newPage()
  await first.goto('https://office.test/')
  await second.goto('https://office.test/')
  assert.equal(await first.getByRole('link', { name: 'Office' }).locator('img[alt=""]').count(), 1)
  assert.ok(await first.getByRole('link', { name: 'GitHub' }).isVisible())
  assert.equal(await first.getByRole('link', { name: 'GitHub' }).locator('svg path').getAttribute('fill'), 'currentColor')
  await first.getByRole('button', { name: 'Automatic theme. Switch to light' }).press('Enter')
  await second.getByRole('button', { name: 'Light theme. Switch to dark' }).waitFor()
  await second.reload()
  await second.getByRole('button', { name: 'Light theme. Switch to dark' }).press('Space')
  await first.getByRole('button', { name: 'Dark theme. Follow device appearance' }).press('Enter')
  assert.equal(await first.locator('html').getAttribute('data-al-theme'), 'auto')
  assert.equal(await first.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await context.close()
  console.log('Navigation links, keyboard dismissal, focus return, no-script operation and all three surfaces passed.')
} finally { await browser.close() }
