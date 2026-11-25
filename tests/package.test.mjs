import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import * as library from 'alpina-ui'

const require = createRequire(import.meta.url)
const root = new URL('../', import.meta.url)
const source = new URL('src/', root)
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
const registry = JSON.parse(await readFile(require.resolve('alpina-ui/registry.json'), 'utf8'))

test('the ESM package server-renders UI, interactive and Swiss components with peer React', () => {
  for (const peer of ['react', 'react-dom']) {
    assert.ok(manifest.peerDependencies[peer])
    assert.equal(manifest.dependencies?.[peer], undefined)
  }
  const html = renderToStaticMarkup(
    createElement(
      'main',
      null,
      createElement(library.Button, null, 'Save'),
      createElement(library.Tabs, {
        label: 'Sections',
        items: [{ value: 'account', label: 'Account', content: 'Account details' }],
      }),
      createElement(library.CurrencyCHF, { amount: 47.5 }),
    ),
  )
  assert.match(html, /<button[^>]*>Save<\/button>/)
  assert.match(html, /role="tablist"/)
  assert.match(html, /role="tabpanel"/)
  assert.match(html, /<data lang="it-CH" value="47.5" class="al-swiss-figures">/)
  assert.equal(html.includes('<style'), false)
})

test('each registered entry and declaration is available through its public component path', async () => {
  for (const item of registry.items) {
    const publicPath = [manifest.name, item.group, item.name].join('/')
    const single = await import(publicPath)
    const names = Object.keys(single)
    assert.ok(names.length, publicPath)
    for (const name of names) assert.equal(library[name], single[name], publicPath + ' → ' + name)
    const mapping = manifest.exports['./' + item.group + '/*'].types
    const declaration = await readFile(new URL(mapping.replace('*', item.name), root), 'utf8')
    assert.ok(declaration.includes('export '), publicPath)
    assert.doesNotMatch(declaration, /import\s*["'][^"']+\.css["']/)
  }
})

test('the registry lists the complete transitive source closure for each copied component', async () => {
  const knownFiles = new Set(['theme.css'])
  for (const group of new Set(registry.items.map((item) => item.group))) {
    for (const file of await readdir(new URL(group + '/', source))) knownFiles.add(group + '/' + file)
  }
  const edges = new Map()
  for (const file of knownFiles) {
    if (!/\.tsx?$/.test(file)) continue
    const content = await readFile(new URL(file, source), 'utf8')
    const imports = ts.preProcessFile(content, true).importedFiles
    const dependencies = []
    for (const { fileName } of imports) {
      if (!fileName.startsWith('.')) continue
      const base = path.posix.join(path.posix.dirname(file), fileName)
      const candidates = [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx')]
      const target = candidates.find((name) => knownFiles.has(name))
      assert.ok(target, file + ' references ' + fileName)
      dependencies.push(target)
    }
    edges.set(file, dependencies)
  }
  const componentNames = new Set()
  for (const item of registry.items) {
    assert.equal(componentNames.has(item.name), false, item.name)
    componentNames.add(item.name)
    assert.ok(knownFiles.has(item.entry))
    const closure = new Set(['theme.css'])
    // These CLI entries also install their responsive, publicly exported companions.
    const companions = { steps: 'ui/form-steps.tsx', 'locale-select': 'swiss/language-switcher.tsx' }
    const stack = companions[item.name] ? [item.entry, companions[item.name]] : [item.entry]
    while (stack.length) {
      const file = stack.pop()
      if (closure.has(file)) continue
      closure.add(file)
      stack.push(...(edges.get(file) ?? []))
    }
    if (closure.has('swiss/format-chf.ts') || closure.has('swiss/format-swiss-date.ts') || closure.has('swiss/format-swiss-number.ts')) {
      closure.add('swiss/UNICODE-LICENSE.txt')
      const shippedNotice = await readFile(new URL('swiss/UNICODE-LICENSE.txt', source), 'utf8')
      assert.match(shippedNotice, /Copyright © 2004-2025 Unicode/)
    }
    assert.deepEqual(item.files.toSorted(), [...closure].sort(), item.name)
  }
})

test('global, theme and individual CSS assets resolve separately', async () => {
  const css = async (publicPath) => readFile(require.resolve('alpina-ui/' + publicPath), 'utf8')
  assert.match(await css('styles.css'), /\.al-button\b/)
  assert.match(await css('theme.css'), /--al-accent\s*:/)
  for (const { name } of registry.items) {
    const asset = require.resolve('alpina-ui/styles/' + name + '.css')
    assert.ok((await stat(asset)).isFile(), name)
  }
  const onlyButton = await css('styles/button.css')
  assert.match(onlyButton, /\.al-button\b/)
  assert.doesNotMatch(onlyButton, /\.al-tabs\b/)
  assert.match(await css('styles/locale-select.css'), /\.al-select\b/)
})
