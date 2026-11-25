import { readFile, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'esbuild'
import assert from 'node:assert/strict'

const root = process.cwd()
const recordPath = 'scripts/component-budgets.json'
const { items } = JSON.parse(await readFile('registry.json'))
const args = process.argv.slice(2)
const record = args[0] === '--record'
const selected = args.slice(1)
if (record && !selected.length) throw Error('Specify component slugs or --all to record budgets.')
for (const slug of selected) {
  assert.ok(slug === '--all' || items.some(item => item.name === slug), 'Unknown component ' + slug)
}
const budgets = JSON.parse(await readFile(recordPath, 'utf8'))

async function bundle(code, splitting = true, conditions) {
  return build({
    stdin: { contents: code, resolveDir: root, sourcefile: 'consumer.js' },
    bundle: true, splitting, conditions, format: 'esm', platform: 'browser', target: 'es2022',
    external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
    minify: true, write: false, metafile: true, outdir: 'measurement', entryNames: 'entry',
  })
}

function weights(result) {
  const { outputs } = result.metafile
  const eager = new Set()
  function visit(key) {
    if (eager.has(key)) return
    eager.add(key)
    for (const edge of outputs[key].imports) {
      if (!edge.external && edge.kind !== 'dynamic-import') visit(edge.path)
    }
  }
  visit('measurement/entry.js')
  let js = 0, lazy = 0
  for (const file of result.outputFiles) {
    const key = relative(root, file.path).replaceAll('\\', '/')
    const bytes = gzipSync(file.contents).length
    if (eager.has(key)) js += bytes
    else lazy += bytes
  }
  return { js, lazy, eager }
}

// A named import from the public barrel should emit only Button and its Slot helper.
// Inspect bytes in every output, including any async chunks, after tree-shaking.
const expected = ['dist/ui/button.js', 'dist/ui/slot.js']
function contributions(outputs) {
  const included = new Set()
  for (const output of outputs) {
    for (const [key, input] of Object.entries(output.inputs)) {
      if (input.bytesInOutput > 0 && key.startsWith('dist/')) included.add(key)
    }
  }
  return [...included].sort()
}
for (const [specifier, splitting] of [['alpina-ui', false], ['alpina-ui/ui/button', true], ['alpina-ui', true]]) {
  const button = await bundle('export { Button } from ' + JSON.stringify(specifier), splitting)
  const outputs = button.metafile.outputs
  const entry = outputs['measurement/entry.js']
  assert.deepEqual(contributions([entry]), expected, 'Unexpected modules in Button')
  assert.deepEqual(entry.imports.filter(edge => !edge.external), [], 'Button reaches another chunk')
  assert.equal(button.outputFiles.length, 1, 'Button emitted an orphan chunk')

}

const localLookup = await bundle("export { lookupSwissPostalCode } from 'alpina-ui'")
const { lookupSwissPostalCode } = await import('data:text/javascript;base64,' + Buffer.from(localLookup.outputFiles[0].contents).toString('base64'))
assert.ok((await lookupSwissPostalCode('6900')).some(entry => entry.locality === 'Massagno'))

const failures = []
for (const item of items.toSorted((a, b) => a.name.localeCompare(b.name))) {
  const code = 'export * from ' + JSON.stringify('alpina-ui/' + item.group + '/' + item.name)
  const result = await bundle(code, true, item.name === 'swiss-address-form' ? ['alpina-postal-chunk'] : item.name === 'qr-bill-scanner' ? ['alpina-scanner-chunk'] : undefined)
  const { js, lazy, eager } = weights(result)
  if (item.name === 'swiss-address-form') {
    const data = Object.entries(result.metafile.outputs).filter(([, output]) =>
      output.inputs['dist/swiss/postal-localities.data.js']?.bytesInOutput > 0)
    assert.equal(data.length, 1, 'Address autocomplete must include the directory')
    assert.ok(!eager.has(data[0][0]), 'Postal data must be deferred')
    const fallback = await bundle(code)
    assert.equal(fallback.outputFiles.length, 1, 'Zero-config esbuild should inline the address directory')
    assert.ok(weights(fallback).js <= budgets[item.name].js + budgets[item.name].lazy, 'Inline address directory exceeds total budget')
  }
  const actual = { js, lazy, css: gzipSync(await readFile('dist/styles/' + item.name + '.css')).length }
  if (record && (selected.includes('--all') || selected.includes(item.name))) {
    budgets[item.name] = Object.fromEntries(Object.entries(actual).map(([key, bytes]) =>
      [key, bytes ? Math.ceil(bytes * 1.1 / 64) * 64 : 0]))
  }
  const ceiling = budgets[item.name]
  if (!ceiling) {
    failures.push(item.name + ': missing budget')
    continue
  }
  for (const [key, bytes] of Object.entries(actual)) {
    if (!Number.isSafeInteger(ceiling[key]) || bytes > ceiling[key]) {
      failures.push(item.name + ' ' + key + ': ' + bytes + ' B exceeds ' + ceiling[key] + ' B')
    }
  }
  console.log(item.name.padEnd(24), actual.js, actual.lazy, actual.css)
}
for (const name of Object.keys(budgets)) if (!items.some(item => item.name === name)) failures.push('Unregistered budget: ' + name)
if (record) {
  const sorted = Object.entries(budgets).sort(([a], [b]) => a.localeCompare(b))
  await writeFile(resolve(recordPath), JSON.stringify(Object.fromEntries(sorted), null, 2) + '\n')
}
assert.deepEqual(failures, [], 'Component size budgets failed')
console.log(items.length + ' component budgets passed (gzip bytes: initial JS, deferred JS, component CSS).')
