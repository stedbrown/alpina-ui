import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
const names = await readdir(new URL('../tests/', import.meta.url))
const browser = process.argv[2] === 'browser'
const files = names.filter((name) =>
  browser ? name === 'browser.mjs' || name.endsWith('.browser.mjs') : name.endsWith('.test.mjs'),
)
for (const name of files) {
  const result = spawnSync(process.execPath, [...(browser ? [] : ['--test']), 'tests/' + name], {
    stdio: 'inherit',
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
