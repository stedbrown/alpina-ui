import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { launchBrowser } from './launch-browser.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const archive = resolve(process.argv.find(arg => arg.startsWith('--archive='))?.slice(10)
  ?? join(root, 'recipes/rubrica/vendor', pkg.name + '-' + pkg.version + '.tgz'))
const directory = join(root, 'test-results')
await mkdir(directory, { recursive: true })
const consumer = await mkdtemp(join(directory, 'skill-consumer-'))
let browser
try {
  // Extract the real package under node_modules. React, TypeScript and esbuild are consumer tools.
  const installed = join(consumer, 'node_modules/alpina-ui')
  await mkdir(installed, { recursive: true })
  execFileSync('tar', ['-xzf', archive, '--strip-components=1', '-C', installed], { timeout: 30000 })
  await writeFile(join(consumer, 'package.json'), '{"name":"skill-consumer","private":true,"type":"module"}')
  assert.equal(createRequire(join(consumer, 'package.json')).resolve('alpina-ui/package.json'), join(installed, 'package.json'))
  const skillFile = 'skills/alpina-ui/SKILL.md'
  const normalized = file => readFile(file, 'utf8').then(text => text.replaceAll('\r\n', '\n'))
  const skill = await normalized(join(installed, skillFile))
  assert.equal(skill, await normalized(join(root, skillFile)), 'The archive must ship the current skill.')
  const parts = [...skill.matchAll(/^```(tsx?|jsx?)\s*\n([\s\S]*?)^```\s*$/gm)]
  assert.ok(parts.length, 'The published skill needs executable React examples.')
  const imports = []
  const names = []
  for (const [index, [, language, source]] of parts.entries()) {
    const name = source.match(/export function (\w+)/)?.[1]
    assert.ok(name, 'Give each runnable skill example a named component export.')
    await writeFile(join(consumer, 'example-' + index + '.' + language), source)
    imports.push('import { ' + name + ' } from "./example-' + index + '"')
    names.push(name)
  }
  const harness = await normalized(new URL('./skill-example-fixture.tsx.txt', import.meta.url))
  await writeFile(join(consumer, 'main.tsx'), imports.join('\n') + '\n' + harness)
  await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: {
    noEmit: true, strict: true, skipLibCheck: true, jsx: 'react-jsx', module: 'ESNext',
    moduleResolution: 'Bundler', target: 'ES2022', noUnusedLocals: true,
  }, include: ['*.tsx', '*.ts'] }))
  execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', consumer], {
    stdio: 'inherit', timeout: 45000,
  })
  const output = join(consumer, 'public')
  await build({ entryPoints: [join(consumer, 'main.tsx')], outdir: output, bundle: true, format: 'esm',
    splitting: true, jsx: 'automatic', loader: { '.woff2': 'dataurl' }, define: { 'process.env.NODE_ENV': '"production"' } })
  browser = await launchBrowser()
  const page = await browser.newPage({ viewport: { width: 1024, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.route('https://skill.test/**', route => {
    const path = new URL(route.request().url()).pathname
    if (path !== '/') return route.fulfill({ path: join(output, basename(path)) })
    return route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/main.css"></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>',
    })
  })
  await page.goto('https://skill.test/')
  for (const name of names) {
    await page.locator('[data-example="' + name + '"] > :visible').first().waitFor({timeout: 5000})
  }
  await page.getByRole('textbox', {name:'Email',exact:true}).fill('person@example.org')
  assert.equal(await page.getByRole('textbox', {name:'Email',exact:true}).getAttribute('aria-invalid'), 'true')
  await page.getByRole('button', {name:'Print invoice'}).waitFor()
  await page.getByRole('table', {name:'Journal des ventes'}).waitFor()
  assert.deepEqual(errors, [])
  console.log('Type-checked and rendered ' + names.length + ' published skill examples against ' + basename(archive) + '.')
} finally {
  await browser?.close()
  await rm(consumer, { recursive: true, force: true, maxRetries: 3 })
}
