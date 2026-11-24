import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../', import.meta.url))
const result = await build({
  absWorkingDir: root,
  entryPoints: ['src/main.tsx'],
  bundle: true,
  minify: true,
  charset: 'utf8',
  write: false,
  outdir: 'dist',
  target: 'es2022',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'inline',
})
const script = result.outputFiles
  .find((f) => f.path.endsWith('.js'))
  .text.replace(/<\/script/gi, '<\\/script')
const css = result.outputFiles.find((f) => f.path.endsWith('.css')).text
const notices = await Promise.all(
  ['alpina-ui', 'react', 'react-dom', 'scheduler'].map(
    async (name) =>
      name +
      '\n' +
      (await readFile(new URL('../node_modules/' + name + '/LICENSE', import.meta.url), 'utf8')),
  ),
)
notices.push(
  await readFile(
    new URL('../node_modules/alpina-ui/src/swiss/UNICODE-LICENSE.txt', import.meta.url),
    'utf8',
  ),
)
const html =
  '<!doctype html><html lang="it-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Rubrica degli atelier</title><style>' +
  css +
  '</style></head><body><div id="root"></div><script>' +
  script +
  '</script><script type="text/plain" id="notices">' +
  notices.join('\n') +
  '</script></body></html>'
await mkdir(new URL('../dist/', import.meta.url), { recursive: true })
await writeFile(new URL('../dist/rubrica-bilingue.html', import.meta.url), html)
console.log('dist/rubrica-bilingue.html · ' + Math.ceil(Buffer.byteLength(html) / 1024) + ' KiB')
