import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { checkDesign } from '../cli/design-check.mjs'

const rules = (source) => checkDesign(source).map((finding) => finding.rule)

test('the design check names each rule the guide asks authors to avoid', () => {
  const page = `import { Button, Card } from 'alpina-ui'
export function Page() {
  return <Card className="rounded-xl shadow-lg p-6">
    <h1 style={{ textAlign: 'center', fontFamily: 'Poppins', color: '#3b82f6' }}>Hi</h1>
    <Card><Button className="hover:bg-blue-500 text-white">Go</Button></Card>
    <div className="bg-gradient-to-r from-pink-500 bg-green-200" />
  </Card>
}`
  const found = checkDesign(page)
  assert.deepEqual([...new Set(found.map((finding) => finding.rule))].sort(), ['centered-text', 'font-family', 'gradient',
    'hard-coded-color', 'nested-card', 'rounded-corners', 'several-accents', 'soft-shadow', 'utility-override'])
  assert.ok(found.every((finding) => finding.line >= 1 && finding.fix.length > 20))
  assert.deepEqual(found.filter((finding) => finding.rule === 'nested-card').map((finding) => finding.line), [5])
  assert.deepEqual(rules('.hero { background: linear-gradient(red, black); border-top-left-radius: 8px; box-shadow: 0 4px 8px rgb(0 0 0 / 20%) }'),
    ['gradient', 'rounded-corners', 'hard-coded-color', 'soft-shadow'])
})

test('tokens, square corners, numbers in text and an ignore comment pass the design check', () => {
  assert.deepEqual(rules(`.x { border-radius: 0; border-radius: var(--al-radius); box-shadow: none; box-shadow: inset 0 1px var(--al-line);
  color: var(--al-ink); font-family: var(--al-font); background: var(--al-accent) }`), [])
  assert.deepEqual(rules(`import { Card, Separator } from 'alpina-ui'
export const A = () => <><Card /><Card><p>Order #123, issue #4521 and 50% off</p></Card><Separator /></>
const brand = '#eb0000' // alpina-design-ignore: the logo file needs the literal value
const plain = <div className="rounded-full" />`).filter(rule => rule !== 'rounded-corners'), [])
  assert.deepEqual(rules('<div className="grid gap-4" /><button className="bg-red-600" />'), [])
})

test('the library’s own blocks and examples pass the design check', () => {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const files = [
    ...readdirSync(join(root, 'blocks'), { recursive: true }).filter((file) => /\.(tsx|css)$/.test(file)).map((file) => join(root, 'blocks', file)),
    ...readdirSync(join(root, 'catalog')).filter((file) => /examples.*\.tsx$/.test(file)).map((file) => join(root, 'catalog', file)),
  ]
  assert.ok(files.length > 8)
  for (const file of files) assert.deepEqual(checkDesign(readFileSync(file, 'utf8')), [], file)
})

test('alpina check reports findings and sets the exit status', () => {
  const dir = mkdtempSync(join(fileURLToPath(new URL('../test-results/', import.meta.url)), 'design-check-'))
  const good = join(dir, 'good.tsx')
  const bad = join(dir, 'bad.css')
  writeFileSync(good, "import { Grid } from 'alpina-ui'\nexport const Page = () => <Grid />\n")
  writeFileSync(bad, '.card { border-radius: 12px }\n')
  const cli = fileURLToPath(new URL('../cli/alpina.mjs', import.meta.url))
  const pass = spawnSync(process.execPath, [cli, 'check', good], { encoding: 'utf8' })
  assert.equal(pass.status, 0, pass.stderr)
  assert.match(pass.stdout, /no design findings/)
  const fail = spawnSync(process.execPath, [cli, 'check', good, bad], { encoding: 'utf8' })
  assert.equal(fail.status, 1)
  assert.match(fail.stdout, /bad\.css:1 {2}rounded-corners/)
})
