import assert from 'node:assert/strict'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const browser = await launchBrowser()
try {
  const page = await openPublicPage(browser)
  for (const width of [320, 800]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(siteOrigin + '/docs/guides/beta-review/')
    const review = page.getByRole('table').first()
    await review.waitFor()
    await page.evaluate(() => document.fonts.ready)
    const splits = await review.evaluate(table => {
      const issues = []
      for (const cell of table.querySelectorAll('th, td:first-child, td:nth-child(2)')) {
        const nodes = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
        for (let node; (node = nodes.nextNode());) {
          for (const word of node.textContent.matchAll(/[\p{L}\p{N}]+/gu)) {
            const range = document.createRange()
            range.setStart(node, word.index)
            range.setEnd(node, word.index + word[0].length)
            const rows = new Set([...range.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top)))
            if (rows.size > 1) issues.push(word[0])
          }
        }
      }
      return issues
    })
    assert.deepEqual(splits, [], 'Split table labels at ' + width + 'px')

    // A long identifier can enlarge the scrollable table without moving the page or hiding its ending.
    await review.locator('tbody a').first().evaluate(link => { link.textContent = 'Component'.repeat(30) })
    assert.ok(await review.evaluate(table => table.scrollWidth > table.clientWidth))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await review.focus()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.activeElement?.tagName === 'TABLE' && document.activeElement.scrollLeft > 0)
  }
  console.log('Table labels stay whole at 320px and 800px. Wide identifiers remain keyboard-scrollable.')
} finally {
  await browser.close()
}
