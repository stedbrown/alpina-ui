import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

test('the 1.0 guide exercises both font renames and public display examples against the installed package', async () => {
  const guide = await readFile(new URL('../docs/migrate-1-0.md', import.meta.url), 'utf8')
  const examples = [...guide.matchAll(/^```js\r?\n([\s\S]*?)^```/gm)]
  assert.equal(examples.length, 2)
  const target = await mkdtemp(join(tmpdir(), 'alpina-fonts-'))
  try {
    for (const [, source] of examples) {
      execFileSync(process.execPath, ['--input-type=module', '-', target], { input: source })
    }
    const sheet = await readFile(join(target, 'fonts.css'), 'utf8')
    const urls = [...sheet.matchAll(/url\('\.\/(fonts\/[^']+)'\)/g)]
    assert.equal(urls.length, 2)
    for (const [, url] of urls) assert.equal((await readFile(join(target, url))).toString('ascii', 0, 4), 'wOF2')
    assert.match(await readFile(join(target, 'fonts/OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE/)
  } finally {
    await rm(target, { recursive: true, force: true })
  }
})
