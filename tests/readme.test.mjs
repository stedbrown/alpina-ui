import { execFileSync } from 'node:child_process'
import test from 'node:test'

test('GitHub README matches all public catalog entries, blocks and the package version', () => {
  execFileSync(process.execPath, ['scripts/readme.mjs', '--check'], { stdio: 'inherit' })
})
