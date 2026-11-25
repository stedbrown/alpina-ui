import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../src/', import.meta.url))
const files = (await readdir(root, { recursive: true })).filter(file => file.endsWith('.css'))
let rules = 0
let declarations = 0
for (const file of files) {
  const text = (await readFile(path.join(root, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, body] of text.matchAll(/[^{}]+\{([^{}]*)\}/g)) {
    rules++
    declarations += body.split(';').filter(value => value.trim()).length
  }
}
console.log(JSON.stringify({ files, rules, declarations }, null, 2))
