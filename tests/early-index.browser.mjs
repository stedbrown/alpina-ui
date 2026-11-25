import assert from 'node:assert/strict'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const browser = await launchBrowser()
try {
  for (const action of ['click', 'Enter', 'Control+k', '/']) {
    const page = await openPublicPage(browser, { viewport: { width: 320, height: 750 } })
    let resume
    const gate = new Promise(resolve => { resume = resolve })
    await page.route('**/assets/catalog-*.js', async route => {
      await gate
      await route.fallback()
    })
    try {
      await page.goto(siteOrigin + '/docs/components/currency-chf/', { waitUntil: 'commit' })
      const trigger = page.getByRole('button', { name: 'Browse components' })
      await trigger.waitFor()
      if (action === 'click') await trigger.click()
      else if (action === 'Enter') await trigger.press('Enter')
      else await page.keyboard.press(action)
      resume()
      const search = page.getByRole('searchbox', { name: 'Search components' })
      await search.waitFor()
      if (action === 'Control+k' || action === '/') {
        await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Search components')
        await search.fill('Currency')
        await page.getByRole('button', { name: 'Close index' }).focus()
        await page.keyboard.press(action)
        await page.waitForFunction(() => {
          const input = document.activeElement
          return input?.getAttribute('aria-label') === 'Search components' &&
            input.selectionStart === 0 && input.selectionEnd === input.value.length
        })
      }
      await search.press('Escape')
      await trigger.waitFor()
      assert.equal(await trigger.getAttribute('aria-expanded'), 'false')
      assert.equal(await trigger.evaluate(element => element === document.activeElement), true)
    } finally {
      resume()
      await page.close()
    }
  }
  const desktop = await openPublicPage(browser, { viewport: { width: 1120, height: 750 } })
  await desktop.goto(siteOrigin + '/docs/components/currency-chf/')
  const search = desktop.getByRole('searchbox', { name: 'Search components' })
  await search.fill('CHF')
  await desktop.getByRole('button', { name: 'Preview', exact: true }).focus()
  await desktop.keyboard.press('Control+k')
  await desktop.waitForFunction(() => {
    const input = document.activeElement
    return input?.getAttribute('aria-label') === 'Search components' &&
      input.selectionStart === 0 && input.selectionEnd === 3
  })
  await desktop.close()
  console.log('Pointer, Enter and search shortcuts survive a delayed component catalog module.')
} finally {
  await browser.close()
}
