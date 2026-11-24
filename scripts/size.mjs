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
console.log('ESM minificato + gzip (byte), React e React DOM esterni')
for (const name of ['Button', 'CurrencyCHF', 'Dialog', '*']) console.log(name, await size(name))
console.log('CSS completo', gzipSync(await readFile('dist/styles.css')).length)
console.log('CSS button', gzipSync(await readFile('dist/styles/button.css')).length)
