import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Grid, GridItem, Typography } from 'alpina-ui'
import { launchBrowser } from './launch-browser.mjs'

const browser = await launchBrowser()
try {
  const page = await browser.newPage()
  const roles = ['poster', 'display', 'masthead']
  // The 1600px viewport is deliberately wider than the seven-column heading.
  const contents = roles.flatMap(role => [
    ['Launching ', h('em', {key:'em'}, 'tomorrow')],
    ['Ausstellungskalender ', h('em', {key:'em'}, 'WWW')],
  ].map((text, index) => h(GridItem, {key: role + index, large: 7, medium: 4, small: 3},
    h(Typography, {as:'h2', variant:role, responsive: index === 1}, text))))
  await page.setContent(renderToStaticMarkup(h(Grid, null, contents)))
  await page.addStyleTag({content: await readFile('dist/styles.css','utf8')})
  for (const width of [1600, 1024, 768, 360, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const scale of [100, 200]) {
      await page.evaluate(size => { document.documentElement.style.fontSize = size + '%' }, scale)
      if (width === 1600 && scale === 100) {
        const geometry = await page.locator('.al-grid-item').first().evaluate(item => ({
          tracks: getComputedStyle(item.parentElement).gridTemplateColumns.split(' ').length,
          span: getComputedStyle(item).gridColumnEnd,
          width: item.getBoundingClientRect().width,
        }))
        assert.equal(geometry.tracks, 12)
        assert.equal(geometry.span, 'span 7')
        assert.ok(geometry.width > 800 && geometry.width < 950)
      }
      const issues = await page.locator('h2').evaluateAll(headings => headings.flatMap(heading => {
        const column = heading.parentElement.getBoundingClientRect()
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT)
        const broken = []
        while (walker.nextNode()) {
          const text = walker.currentNode
          for (const token of text.nodeValue.matchAll(/\S+/g)) {
            const range = document.createRange()
            range.setStart(text, token.index)
            range.setEnd(text, token.index + token[0].length)
            const rects = [...range.getClientRects()].filter(rect => rect.width)
            if (new Set(rects.map(rect => rect.top)).size !== 1 ||
                rects.some(rect => rect.left < column.left - 1 || rect.right > column.right + 1))
              broken.push(heading.dataset.role + ' ' + token[0])
          }
        }
        return broken
      }))
      assert.deepEqual(issues, [], 'Words must fit in their local column at ' + width + 'px / ' + scale + '%')
    }
  }
  console.log('Poster, display and masthead preserved whole words across five local grid widths and 100–200% text size.')
} finally { await browser.close() }
