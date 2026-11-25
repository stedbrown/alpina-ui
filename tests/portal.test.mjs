import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
const root = new URL('../', import.meta.url)
test('the homepage and new projects compose public controls without local presentation overrides', async () => {
  for (const path of ['web/pages.tsx', 'web/type-specimen.tsx', 'web/component-directory.tsx',
    'catalog/workshop-registration.tsx', 'catalog/invoice-review.tsx']) {
    const source = await readFile(new URL(path, root), 'utf8')
    assert.match(source, /from 'alpina-ui'/, path)
    assert.doesNotMatch(source, /\b(?:style|className)=|import\s+['"][^'"]+\.css['"]|<(?:button|select|input|textarea)\b/, path)
  }
})
test('the portal and all examples use the same public entry points as a consumer', async () => {
  for (const file of (await readdir(new URL('catalog/', root))).filter((name) =>
    name.endsWith('.tsx'),
  )) {
    const source = await readFile(new URL('catalog/' + file, root), 'utf8')
    assert.doesNotMatch(source, /['"]\.\.\/src\//, file)
    assert.match(source, /from ['"]alpina-ui['"]/, file)
    if (['app.tsx', 'overview.tsx', 'specimen.tsx'].includes(file))
      assert.doesNotMatch(source, /<(button|input|select|nav|aside)\b/, file)
  }
})
test('every explicit CSS pigment is black, white, red or a mixture of those inks', async () => {
  for (const directory of ['src', 'src/ui', 'src/portal', 'src/interactive', 'src/swiss', 'catalog']) {
    for (const file of (await readdir(new URL(directory + '/', root))).filter(
      (file) => file.endsWith('.css') || file.endsWith('.tsx'),
    )) {
      const source = await readFile(new URL(directory + '/' + file, root), 'utf8')
      for (const [, hex] of source.matchAll(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/gi)) {
        const [r, g, b] = (hex.length < 5 ? [...hex].map((x) => x + x) : hex.match(/../g)).map((x) =>
          parseInt(x, 16),
        )
        assert.ok(r >= g && g === b, file + ' #' + hex)
      }
      for (const [, r, g, b] of source.matchAll(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/gi))
        assert.ok(Number(r) >= Number(g) && Number(g) === Number(b), file + ' rgb ' + [r, g, b])
      assert.doesNotMatch(
        source,
        /(?:color|background|border(?:-color)?|fill|stroke)\s*:\s*(?:green|blue|navy|yellow|orange|purple|teal|olive|pink|brown|aqua|lime)\b/i,
        file,
      )
    }
  }
})
