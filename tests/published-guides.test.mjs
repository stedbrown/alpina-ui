import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('the npm archive includes the published guides and excludes maintainer notes', async () => {
  const runner = process.env.npm_execpath
  const options = { encoding: 'utf8', maxBuffer: 8_000_000 }
  const args = ['pack', '--dry-run', '--ignore-scripts', '--json']
  const listing = runner ? execFileSync(process.execPath, [runner, ...args], options)
    : execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { ...options, shell: process.platform === 'win32' })
  const files = new Set(JSON.parse(listing)[0].files.map(file => file.path))
  const manifest = JSON.parse(await readFile('cli/public-guides.json', 'utf8'))
  for (const guide of manifest) {
    for (const prefix of ['', ...(guide.languages ?? []).map(language => language + '/')])
      assert.ok(files.has('docs/' + prefix + guide.file), prefix + guide.file)
  }
  for (const internal of ['readme.template', 'npm-release', 'package-quality', '1.0-checklist', 'visual-testing', 'portal', 'beta-review'])
    assert.ok(!files.has('docs/' + internal + '.md'), internal)
})
