import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { iconNames } from 'alpina-ui/ui/icon'

const origin = 'https://alpina.test'
const site = new URL('../site/', import.meta.url)
const executable = process.env.CHROME_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const browser = await chromium.launch(
  executable ? { executablePath: executable } : existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' },
)

async function openPage(options) {
  const page = await browser.newPage(options)
  await page.route(origin + '/**', route => {
    const { pathname } = new URL(route.request().url())
    const file = pathname.endsWith('/') ? pathname + 'index.html' : pathname
    return route.fulfill({ path: fileURLToPath(new URL('.' + file, site)) })
  })
  return page
}

try {
  const staticPage = await openPage({ javaScriptEnabled: false })
  await staticPage.goto(origin + '/icons/')
  const labels = await staticPage.locator('[data-icon-name]:visible').allTextContents()
  assert.deepEqual(labels.sort(), [...iconNames].sort())
  const paths = await staticPage.locator('[data-icon-drawing] path').evaluateAll(
    drawings => drawings.map(drawing => drawing.getAttribute('d')),
  )
  assert.equal(paths.length, iconNames.length)
  assert.equal(new Set(paths.filter(Boolean)).size, iconNames.length)
  assert.equal(await staticPage.getByRole('button', { name: /Copy JSX/ }).count(), 0)
  assert.ok(await staticPage.getByRole('link', { name: 'Icon usage and API' }).isVisible())

  for (const width of [390, 1440]) {
    const page = await openPage({ viewport: { width, height: 850 }, hasTouch: width === 390 })
    await page.goto(origin)
    const header = page.getByRole('banner')
    const repo = header.getByRole('link', { name: 'GitHub', exact: true })
    assert.equal(await repo.getAttribute('href'), 'https://github.com/stedbrown/alpina-ui')
    assert.equal(await repo.locator('svg').getAttribute('aria-hidden'), 'true')
    await header.getByRole('link', { name: 'Icons', exact: true }).click()
    const search = page.getByRole('searchbox', { name: 'Find an icon' })
    const count = page.locator('[data-icon-count]')
    await search.fill('development git branch')
    assert.equal(await count.innerText(), '1 icon')
    const tile = page.locator('[data-icon-entry="git-branch"]')
    assert.ok(await tile.isVisible())
    await page.getByRole('combobox', { name: 'Preview size' }).selectOption('48')
    assert.equal(await tile.locator('[data-icon-drawing]').getAttribute('width'), '48')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))

    // Exercise clipboard success and denial without writing to the developer's system clipboard.
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async text => { window.copiedIconSource = text } },
    }))
    const copy = tile.getByRole('button', { name: 'Copy JSX for git-branch' })
    const snippet = '<Icon name="git-branch" size={48} />'
    await copy.press('Enter')
    assert.equal(await tile.locator('[data-icon-name]').innerText(), 'Copied JSX')
    assert.equal(await page.evaluate(() => window.copiedIconSource), snippet)
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => { throw new DOMException('Permission denied', 'NotAllowedError') } },
    }))
    await copy.press('Enter')
    const fallback = tile.getByRole('textbox', { name: 'JSX for git-branch' })
    assert.equal(await fallback.inputValue(), snippet)
    assert.ok(await fallback.evaluate(input =>
      document.activeElement === input && input.selectionStart === 0 && input.selectionEnd === input.value.length,
    ))
    await search.fill('no-such-alpina-icon')
    assert.match(await count.innerText(), /^No matches/)
    assert.equal(await page.locator('[data-icon-entry]:visible').count(), 0)
    await page.getByRole('button', { name: 'Clear', exact: true }).click()
    assert.equal(await page.locator('[data-icon-entry]:visible').count(), iconNames.length)
    assert.ok(await search.evaluate(input => document.activeElement === input))
    await page.close()
  }
  console.log('Icon directory passed desktop, mobile, clipboard, search and static rendering checks.')
} finally {
  await browser.close()
}
