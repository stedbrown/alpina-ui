import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CardDescription, CurrencyCHF, Prose, SwissDate, Typography } from 'alpina-ui'
import { launchBrowser } from './launch-browser.mjs'

const browser = await launchBrowser()
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  const markup = renderToStaticMarkup(h(Prose, { lang: 'fr-CH' },
    h('h2', null, 'Ligne et espace'), h(Typography, null, 'Exposition en 2027.'),
    h(CardDescription, null, 'Programme de la saison.'),
    h(CurrencyCHF, { amount: 1200, locale: 'de-CH' }), h(SwissDate, { value: '2027-04-06', locale: 'it-CH' })))
  await page.setContent(markup)
  await page.addStyleTag({ content: await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8') })
  const style = (selector, property) => page.locator(selector).first().evaluate((el, key) => getComputedStyle(el)[key], property)
  assert.equal(await style('p', 'fontKerning'), 'normal')
  assert.equal(await style('.al-type', 'fontVariantNumeric'), 'proportional-nums')
  assert.equal(await style('p', 'hyphens'), 'auto')
  assert.equal(await style('p', 'textWrapStyle'), 'pretty')
  assert.equal(await style('h2', 'textWrapStyle'), 'balance')
  assert.match(await style('article', 'textAlign'), /^(start|left)$/)
  for (const selector of ['article', '.al-card-description']) {
    const width = await style(selector, 'maxInlineSize')
    await page.locator(selector).evaluate(el => el.style.setProperty('--al-measure', '48ch'))
    assert.ok(parseFloat(await style(selector, 'maxInlineSize')) < parseFloat(width))
    await page.locator(selector).evaluate(el => el.style.removeProperty('--al-measure'))
  }
  assert.equal(await page.locator('data').getAttribute('lang'), 'de-CH')
  assert.equal(await page.locator('time').getAttribute('lang'), 'it-CH')
  assert.match(await style('data', 'fontVariantNumeric'), /tabular-nums/)
  assert.match(await style('time', 'fontVariantNumeric'), /tabular-nums/)
  const sizes = [[24, -.52, 28], [32, -.96, 36], [48, -1.84, 48], [64, -2.72, 60],
    [96, -4.48, 88], [128, -6.24, 116], [192, -9.6, 176]]
  for (const variant of ['heading', 'display', 'title', 'poster']) {
    await page.locator('article').evaluate((article, html) => { article.innerHTML = html },
      renderToStaticMarkup(h(Typography, { as: 'h1', variant }, 'Édition publique')))
    for (const [size, tracking, leading] of sizes) {
      await page.locator('h1').evaluate((node, px) => { node.style.fontSize = px + 'px' }, size)
      assert.ok(Math.abs(parseFloat(await style('h1', 'letterSpacing')) - tracking) < .01, variant + ' at ' + size)
      assert.equal(parseFloat(await style('h1', 'lineHeight')), leading)
      assert.equal(await style('h1', 'fontOpticalSizing'), 'auto')
    }
  }
  console.log('Prose measure, wrapping, language, kerning and numeric roles passed.')
} finally { await browser.close() }
