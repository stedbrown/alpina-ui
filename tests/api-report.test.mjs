import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { declarationReport, requireApiNote } from '../scripts/api-report.mjs'

test('API report tracks transitive signatures, deprecations and client boundaries', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'alpina-api-'))
  const put = (name, text) => writeFile(path.join(dir, name), text)
  try {
    await put('index.d.ts', "export { Button } from './button.js'")
    await put('index.js', "export { Button } from './button.js'")
    await put('button.d.ts', "import type { Props } from './props.js'\nexport declare function Button(props: Props): string")
    await put('button.js', "export function Button() { return '' }")
    await put('props.js', 'export {}')
    await put('props.d.ts', 'export interface Props { size?: number }')
    const baseline = await declarationReport(dir)
    await put('button.js', "export function Button() { return 'Changed implementation' }")
    assert.equal(await declarationReport(dir), baseline)
    await put('props.d.ts', 'export interface Props { size: number }')
    assert.notEqual(await declarationReport(dir), baseline)
    await put('props.d.ts', 'export interface Props {\n/** @deprecated Use width. */\nsize?: number\n}')
    assert.match(await declarationReport(dir), /@deprecated Props.size Use width/)
    await put('button.js', "'use client';\nexport function Button() {}")
    assert.match(await declarationReport(dir), /button\.d\.ts\nClient entry\./)
    await put('index.d.ts', 'export {}')
    assert.doesNotMatch(await declarationReport(dir), /interface Props/)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('a reviewed API diff requires a new public changelog entry', () => {
  assert.throws(() => requireApiNote(' - **Public API** Old note.\n+Unrelated change.'))
  assert.doesNotThrow(() => requireApiNote('+- **Public API** FileInput accepts files from a picker.'))
})
