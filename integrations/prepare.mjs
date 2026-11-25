import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = fileURLToPath(new URL('../', import.meta.url))
const destination = fileURLToPath(new URL('./.alpina/', import.meta.url))
const scratch = await mkdtemp(join(tmpdir(), 'alpina-integration-'))
try {
  // npm supplies its JS entry point to lifecycle scripts on Windows and Unix.
  const result = execFileSync(process.execPath, [process.env.npm_execpath, 'pack', '--json',
    '--ignore-scripts', '--pack-destination', scratch], { cwd: repo, encoding: 'utf8' })
  const [{ filename }] = JSON.parse(result)
  await rm(destination, { recursive: true, force: true })
  await mkdir(destination, { recursive: true })
  execFileSync('tar', ['-xzf', join(scratch, filename), '--strip-components=1', '-C', destination])
  console.log('Prepared integration dependency from ' + filename)
} finally {
  await rm(scratch, { recursive: true, force: true })
}
