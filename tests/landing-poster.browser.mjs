import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH })
try {
  const page = await openPublicPage(browser, { reducedMotion: 'reduce' })
  await page.goto(siteOrigin)
  await page.evaluate(() => document.fonts.ready)
  const cover = page.getByRole('region', { name: 'Swiss design for React.' })
  const control = cover.getByRole('switch', { name: 'Column guides' })
  async function checkFigures(width) {
    const figures = await cover.locator('[data-role="title"][data-numeric]').evaluateAll(nodes => nodes.map(node => {
      const run = new Range()
      run.selectNodeContents(node)
      const text = run.getBoundingClientRect()
      const column = node.closest('.al-grid-item').getBoundingClientRect()
      return { value: node.textContent, fits: text.left >= column.left - 1 && text.right <= column.right + 1 }
    }))
    assert.equal(figures.length, 4)
    assert.deepEqual(figures.filter(figure => !figure.fits), [], 'Poster figures must stay in their columns at ' + width)
  }
  for (const width of [320, 576, 640, 768, 800, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 })
    await checkFigures(width)
    const poster = await cover.evaluate(section => {
      const title = section.querySelector('h1')
      const run = new Range()
      run.selectNodeContents(title.firstChild)
      const line = [...run.getClientRects()].filter(rect => rect.width)
      return {
        height: section.clientHeight,
        columns: [...section.querySelectorAll('.al-grid-guides > i')].filter(el => el.getBoundingClientRect().width).length,
        lines: line.length,
        fill: line[0].width / title.clientWidth,
        ratio: parseFloat(getComputedStyle(title).fontSize) / parseFloat(getComputedStyle(section.querySelector('#cover-intro')).fontSize),
      }
    })
    assert.ok(poster.height >= 900, 'Full-height cover at ' + width)
    assert.equal(poster.columns, width >= 864 ? 12 : width >= 576 ? 8 : 4)
    assert.equal(poster.lines, 1, 'The first line of the title fits at ' + width)
    assert.ok(poster.fill >= .73 && poster.fill <= 1.01, 'Headline fills its grid at ' + width + ': ' + poster.fill)
    assert.ok(poster.ratio >= 2.5, 'Display and reading type keep a distinct scale at ' + width)
  }
  await control.press('Space')
  assert.ok(await cover.locator('#cover-guides').isHidden())
  await control.press('Space')
  assert.ok(await cover.locator('#cover-guides').isVisible())
  for (const term of ['Components', 'Grid columns', 'National languages', 'WCAG AA target']) {
    assert.ok(await cover.getByText(term, { exact: true }).isVisible())
  }
  await page.setViewportSize({width: 800, height: 900})
  const enlarged = await page.addStyleTag({ content: 'html { font-size: 200% !important } * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important } p { margin-block-end: 2em !important }' })
  await checkFigures('800 px with enlarged type and spacing')
  await enlarged.evaluate(node => node.remove())
  console.log('The live cover fills the viewport, its headline fits the grid and its column guides work from the keyboard.')
} finally {
  await browser.close()
}
