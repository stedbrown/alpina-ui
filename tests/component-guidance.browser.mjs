import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { launchBrowser } from './launch-browser.mjs'
import { openPublicPage, siteOrigin } from './public-pages.mjs'

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8')
const entries = JSON.parse(await read('docs/component-guidance.json'))
const { items } = JSON.parse(await read('site/registry.json'))
const headings = ['When to use', 'When to avoid', 'Accessibility', 'Content']

// Exercise every generated record and the initial HTML an indexer or a reader without JS receives.
for (const { name } of items) {
  const html = await read('site/docs/components/' + name + '/index.html')
  const inline = html.match(/<script type="application\/json" id="component-guidance-data">([^<]+)<\/script>/)
  assert.ok(inline, name + ' has no page-local guidance')
  assert.deepEqual(JSON.parse(inline[1]), { slug: name, entry: entries[name] })
  assert.deepEqual(JSON.parse(await read('site/reference/components/' + name + '.json')), entries[name])
  assert.ok(html.includes('data-component-guidance="' + name + '"'), name + ' lacks initial content')
  assert.ok(html.includes('<caption>Keys</caption>'), name + ': keyboard reference missing before hydration')
  for (const heading of headings) assert.ok(html.includes('>' + heading + '</h2>'), name + ': ' + heading)
}

const browser = await launchBrowser()
try {
  async function checkView(page, slug) {
    const guide = page.locator('[data-component-guidance="' + slug + '"]')
    await guide.waitFor()
    const expected = entries[slug]
    assert.deepEqual(await guide.getByRole('heading', { level: 2 }).allTextContents(), headings)
    const notes = guide.locator('h2 + p')
    assert.deepEqual(await notes.allTextContents(), [expected.use, expected.avoid, expected.access, expected.content])
    const keys = guide.getByRole('table', { name: 'Keys', exact: true })
    assert.deepEqual(await keys.getByRole('rowheader').allTextContents(), expected.keys.map(([key]) => key))
    assert.deepEqual(await keys.getByRole('cell').allTextContents(), expected.keys.map(([, action]) => action))
    const examples = guide.locator('dl[aria-label="Editorial comparison"]')
    assert.deepEqual(await examples.locator('dt').allTextContents(), ['Use', 'Avoid'])
    assert.deepEqual(await examples.locator('dd').allTextContents(), [expected.example.good, expected.example.poor])
    for (const [tag, label] of Object.entries(expected.copy)) {
      assert.equal(await guide.locator('[lang="' + tag + '"]').textContent(), label, slug + ': ' + tag)
    }
  }

  for (const javaScriptEnabled of [false, true]) {
    const page = await openPublicPage(browser, { javaScriptEnabled })
    const guidanceRequests = []
    page.on('request', req => { if (req.url().includes('/reference/components/')) guidanceRequests.push(req.url()) })
    await page.goto(siteOrigin + '/docs/components/button/')
    if (javaScriptEnabled) {
      await page.getByRole('button', { name: 'API', exact: true }).click()
      await page.getByRole('heading', { name: 'API reference', exact: true }).waitFor()
      await page.getByRole('button', { name: 'Preview', exact: true }).click()
    }
    await checkView(page, 'button')
    assert.deepEqual(guidanceRequests, [], 'Canonical reference fetched data already in the document')
    if (javaScriptEnabled) {
      const scriptUrls = await page.locator('script[src]').evaluateAll(scripts => scripts.map(script => new URL(script.src).pathname))
      for (const path of scriptUrls) assert.ok(!(await read('site' + path)).includes(entries.resizable.avoid), path + ' includes the full reference corpus')
      await page.goto(siteOrigin + '/docs/#multilingual-field')
      await checkView(page, 'multilingual-field')
    }
    await page.close()
  }

  const offline = await browser.newPage()
  await offline.context().setOffline(true)
  await offline.goto(new URL('../site/catalog.html#swiss-address-form', import.meta.url).href)
  await checkView(offline, 'swiss-address-form')
  await offline.evaluate(() => { location.hash = 'bar-chart' })
  await checkView(offline, 'bar-chart')
  console.log('Verified initial, interactive and offline component guidance across ' + items.length + ' references.')
} finally {
  await browser.close()
}
