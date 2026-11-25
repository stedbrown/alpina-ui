import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, publicRoutes, siteOrigin } from './public-pages.mjs'
import { siteUrl } from '../scripts/site-config.mjs'

const languages = ['en', 'de', 'fr', 'it']
const url = (name, language) => '/docs/guides/' + name + '/' + (language === 'en' ? '' : language + '/')
const routes = await publicRoutes()
const browser = await launchBrowser()
try {
  for (const name of ['start', 'swiss']) {
    const page = await openPublicPage(browser, { viewport: { width: 320, height: 760 } })
    const english = await readFile('docs/' + name + '.md', 'utf8')
    const sections = source => [...source.matchAll(/^(#{1,6}) /gm)].map(match => match[1])
    const officialLinks = source => [...source.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(match => match[1]).sort()
    await page.goto(siteOrigin + url(name, 'en'))
    for (const [index, language] of languages.entries()) {
      const route = url(name, language)
      const source = await readFile('docs/' + (language === 'en' ? '' : language + '/') + name + '.md', 'utf8')
      assert.ok(routes.includes(route), route)
      assert.deepEqual(sections(source), sections(english), route + ' translated section coverage')
      assert.deepEqual(officialLinks(source), officialLinks(english), route + ' translated sources')
      assert.equal(source.match(/^```/gm).length, english.match(/^```/gm).length, route + ' example coverage')
      if (index) await page.locator('main a[href="' + route + '"]').first().click()
      await page.getByRole('heading', { level: 1, name: /^# (.+)$/m.exec(source)[1], exact: true }).waitFor()
      assert.equal(await page.locator('html').getAttribute('lang'), language)
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), siteUrl + route)
      for (const alternate of [...languages, 'x-default'])
        assert.equal(await page.locator('link[hreflang="' + alternate + '"]').getAttribute('href'), siteUrl + url(name, alternate === 'x-default' ? 'en' : alternate))
      const selected = page.locator('main nav a[aria-current=page][href="' + route + '"]')
      await selected.waitFor()
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      if (name === 'start') assert.ok(await page.locator('main a[download]').first().isVisible())
    }
    const offline = await browser.newPage({ offline: true, viewport: { width: 320, height: 760 } })
    await offline.goto(new URL('../site/catalog.html#guide/' + name + '/it', import.meta.url).href)
    await offline.locator('main nav a[aria-current=page][href="#guide/' + name + '/it"]').waitFor()
    assert.equal(await offline.locator('html').getAttribute('lang'), 'it')
    await offline.locator('main nav a[href="#guide/' + name + '/fr"]').click()
    await offline.locator('main nav a[aria-current=page][href="#guide/' + name + '/fr"]').waitFor()
    assert.equal(await offline.locator('html').getAttribute('lang'), 'fr')
    await offline.close()
    await page.close()
  }
} finally { await browser.close() }
console.log('Verified eight translated guide editions, reciprocal alternates, download links and offline language changes.')
