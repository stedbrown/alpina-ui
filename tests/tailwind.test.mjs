import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { compile } from 'tailwindcss'

test('Tailwind v4 utilities read Alpina variables at the element where a theme is applied', async () => {
  const sheet = await readFile(new URL(import.meta.resolve('alpina-ui/tailwind.css')), 'utf8')
  const compiler = await compile(sheet + '\n@tailwind utilities;')
  const css = compiler.build(['bg-primary', 'text-primary-foreground', 'p-3', 'text-heading', 'font-sans', 'rounded-md'])
  assert.match(css, /background-color:\s*var\(--al-accent\)/)
  assert.match(css, /color:\s*var\(--al-on-accent\)/)
  assert.match(css, /padding:\s*calc\(var\(--al-unit\) \* 3\)/)
  assert.match(css, /font-size:\s*var\(--al-type-heading\)/)
  assert.match(css, /line-height:.*var\(--al-leading-heading\)/)
  assert.match(css, /font-family:\s*var\(--al-font\)/)
  assert.match(css, /border-radius:\s*var\(--al-radius\)/)
})
