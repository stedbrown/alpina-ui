import assert from 'node:assert/strict'
import test from 'node:test'
import { renderGuide } from '../scripts/site.mjs'

test('inline ISO dates stay atomic and copyable while code examples retain their source', async () => {
  const html = await renderGuide([
    'On `2026-04-05`, compare `2026-02-30` and `format("2026-04-05")`.',
    '', '```js', 'const date = "2026-04-05"', '```',
  ].join('\n'))
  assert.equal(html.match(/<time\b/g)?.length, 1)
  assert.ok(html.includes('<code class="al-swiss-figures"><time datetime="2026-04-05">2026-04-05</time></code>'))
  assert.ok(html.includes('<code>2026-02-30</code>'))
  assert.match(html, /<code>format\([^<]*2026-04-05[^<]*\)<\/code>/)
  assert.match(html, /<pre tabindex="0"><code class="language-js">const date = [^<]*2026-04-05/)
})
