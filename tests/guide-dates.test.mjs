import assert from 'node:assert/strict'
import test from 'node:test'
import { renderGuide } from '../scripts/site.mjs'

test('inline ISO dates stay atomic and copyable while code examples retain their source', async () => {
  const html = await renderGuide([
    'On `2026-04-05`, compare `2026-02-30` and `format("2026-04-05")`.',
    '', '```js', 'const date = "2026-04-05"', '```',
  ].join('\n'))
  assert.equal(html.match(/<time\b/g)?.length, 1)
  assert.ok(/<code class="al-inline-code"><time datetime="2026-04-05">2026-04-05<\/time><\/code>/i.test(html))
  assert.ok(html.includes('<code class="al-inline-code">2026-02-30</code>'))
  assert.match(html, /<code class="al-inline-code">format\([^<]*2026-04-05[^<]*\)<\/code>/)
  assert.match(html, /<pre tabindex="0" class="al-code-sample"><code class="language-js">const date = [^<]*2026-04-05/i)
})

test('Markdown headers and body cells preserve authored column alignment and inline content', async () => {
  const html = await renderGuide([
    '| Default | Start | Group | Value |',
    '| --- | :--- | :---: | ---: |',
    '| Uno | [Link](/docs/) | *Two* | `1.25 m²` |',
  ].join('\n'))
  const opening = html.match(/<table\b[^>]*>/)?.[0] ?? ''
  assert.match(opening, /\btabindex="0"/)
  assert.match(opening, /\bclass="al-table"/)
  for (const tag of ['th', 'td']) {
    const cells = [...html.matchAll(new RegExp('<' + tag + '\\b([^>]*)>', 'g'))]
    assert.deepEqual(cells.map(([, attributes]) => attributes.match(/data-text-align="(\w+)"/)?.[1]),
      [undefined, 'left', 'center', 'right'])
    if (tag === 'th') assert.ok(cells.every(([, attributes]) => attributes.includes('scope="col"')))
  }
  assert.ok(html.includes('<a href="/docs/" class="al-text-link" data-variant="inline">Link</a>'))
  assert.ok(html.includes('<em>Two</em>'))
  assert.ok(html.includes('<code class="al-inline-code">1.25 m²</code>'))
})
