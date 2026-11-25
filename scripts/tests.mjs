import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
const names = await readdir(new URL('../tests/', import.meta.url))
const browser = process.argv[2] === 'browser'
const files = names.filter((name) =>
  browser ? name === 'browser.mjs' || name.endsWith('.browser.mjs') : name.endsWith('.test.mjs'),
)
for (const name of files) {
  console.log('Running ' + name)
  const result = spawnSync(process.execPath, [...(browser ? [] : ['--test']), 'tests/' + name], {
    stdio: 'inherit', timeout: (browser ? 300 : 120) * 1000, killSignal: 'SIGKILL',
  })
  if (result.error) throw new Error(name + ': ' + result.error.message, { cause: result.error })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
