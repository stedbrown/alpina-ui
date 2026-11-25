import { build } from 'esbuild'
import { gzipSync } from 'node:zlib'
import { readFile } from 'node:fs/promises'

async function size(name) {
  const code = name === '*' ? 'export * from "alpina-ui"' : 'export {' + name + '} from "alpina-ui"'
  const result = await build({
    stdin: { contents: code, resolveDir: process.cwd() },
    bundle: true,
    write: false,
    external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
  })
  return gzipSync(result.outputFiles[0].contents).length
}
console.log('Minified and gzipped ESM in bytes, excluding React and React DOM')
for (const name of ['Button', 'CurrencyCHF', 'Dialog', 'Icon', '*']) console.log(name, await size(name))
console.log('Full stylesheet', gzipSync(await readFile('dist/styles.css')).length)
console.log('Button stylesheet', gzipSync(await readFile('dist/styles/button.css')).length)
