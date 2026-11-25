import assert from 'node:assert/strict'
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { launchBrowser } from '../tests/launch-browser.mjs'

const project = await mkdtemp(fileURLToPath(new URL('./.button-check-', import.meta.url)))
const dist = join(project, 'dist')
try {
  await writeFile(join(project, 'index.html'), '<!doctype html><html lang="en"><title>Button check</title><main></main><script type="module" src="/entry.js"></script></html>')
  await writeFile(join(project, 'entry.js'), [
    "import { Button } from 'alpina-ui'",
    "import { createElement } from 'react'",
    "import { createRoot } from 'react-dom/client'",
    "createRoot(document.querySelector('main')).render(createElement(Button, {onClick: () => {document.title='Activated'}}, 'Continue'))",
  ].join('\n'))
  const chunks = []
  await build({ root: project, configFile: false, logLevel: 'error', plugins: [{
    name: 'measure-alpina-modules',
    generateBundle(_options, output) {
      for (const asset of Object.values(output)) {
        if (asset.type === 'chunk') chunks.push(asset)
      }
    },
  }] })
  assert.equal(chunks.length, 1, 'A Button-only Vite build should emit exactly one JS asset')
  const [chunk] = chunks
  assert.deepEqual(chunk.dynamicImports, [])
  assert.deepEqual(chunk.imports, [])
  const modules = Object.keys(chunk.modules).map(id => id.replaceAll('\\', '/'))
  assert.ok(modules.some(id => id.endsWith('/dist/ui/button.js')))
  assert.ok(!modules.some(id => id.includes('/dist/swiss/')), 'Swiss modules reached Button')
  const files = (await readdir(dist, { recursive: true, withFileTypes: true }))
    .filter(file => file.isFile()).map(file => relative(dist, join(file.parentPath, file.name)).replaceAll('\\', '/')).sort()
  assert.deepEqual(files, ['index.html', chunk.fileName].sort(), 'Vite wrote additional assets')
  const origin = 'https://button.test'
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage()
    const paths = []
    await page.route(origin + '/**', async route => {
      const path = new URL(route.request().url()).pathname.slice(1) || 'index.html'
      paths.push(path)
      if (!files.includes(path)) return route.abort()
      await route.fulfill({ contentType: path.endsWith('.html') ? 'text/html' : 'text/javascript',
        body: await readFile(join(dist, path)) })
    })
    await page.goto(origin)
    await page.getByRole('button', { name: 'Continue' }).click()
    assert.equal(await page.title(), 'Activated')
    assert.deepEqual(paths.toSorted(), files)
  } finally {
    await browser.close()
  }
  console.log('Verified the Vite module graph, all emitted files and browser requests for a root Button import.')
} finally {
  await rm(project, { recursive: true, force: true })
}
