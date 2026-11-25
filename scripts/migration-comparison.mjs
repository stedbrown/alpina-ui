import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { build } from 'esbuild'
import { compile } from 'tailwindcss'

const directory = 'fixtures/migration'
const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 12)

export async function buildMigrationComparison(output, { coreCSS, fontsURL }) {
  const options = {
    bundle: true, jsx: 'automatic', format: 'esm', write: false,
    alias: { '@/components/ui': path.resolve(directory, 'ui') },
    loader: { '.css': 'empty' },
  }
  const server = await build({
    ...options, platform: 'node', entryPoints: [directory + '/app.tsx'],
    plugins: [{ name: 'installed-components', setup(context) {
      context.onResolve({ filter: /^(?:react(?:\/jsx-runtime)?|alpina-ui)$/ }, ({ path: specifier }) =>
        ({ path: import.meta.resolve(specifier), external: true }))
    } }],
  })
  const { forms } = await import('data:text/javascript;base64,' + Buffer.from(server.outputFiles[0].contents).toString('base64'))
  const client = await build({
    ...options, entryPoints: [directory + '/client.tsx'], minify: true, target: 'es2022',
    define: { 'process.env.NODE_ENV': '"production"' },
  })
  const script = '/assets/edition-label-' + hash(client.outputFiles[0].contents) + '.js'
  await output(script.slice(1), client.outputFiles[0].contents)
  const migration = []
  for (const [library, Form] of Object.entries(forms)) {
    const markup = renderToString(createElement(Form))
    const code = (await readFile(directory + '/' + library + '-form.tsx', 'utf8')).replaceAll('\r\n', '\n')
    let style = '<link rel="stylesheet" href="' + fontsURL + '"><link rel="stylesheet" href="' + coreCSS + '">'
    if (library === 'shadcn') {
      const base = path.dirname(fileURLToPath(import.meta.resolve('tailwindcss/package.json')))
      const [theme, preflight] = await Promise.all(['theme.css', 'preflight.css'].map(file => readFile(path.join(base, file), 'utf8')))
      const colors = '@theme { --color-primary: oklch(.205 0 0); --color-primary-foreground: oklch(.985 0 0); --color-input: oklch(.922 0 0); --color-ring: oklch(.708 0 0); --radius-md: .5rem; }'
      const compiler = await compile('@layer theme,base,utilities; @layer theme {' + theme + colors + '} @layer base {' + preflight + '} @layer utilities { @tailwind utilities; }')
      const classes = [...markup.matchAll(/class="([^"]+)"/g)].flatMap(([, value]) =>
        value.replaceAll('&#x27;', "'").split(/\s+/))
      const css = compiler.build(classes)
      const sheet = '/assets/shadcn-new-york-' + hash(css) + '.css'
      await output(sheet.slice(1), css)
      style = '<link rel="stylesheet" href="' + sheet + '">'
    }
    // Serve a standalone document with its own cascade. No site styles enter the shadcn form.
    const name = library === 'alpina' ? 'Alpina UI' : 'shadcn/ui'
    const doc = '<!doctype html><html lang="en" data-al-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + name + ' edition label</title>' + style + '</head><body style="margin:0;background:white;color:#171717"><main id="form" data-library="' + library + '">' + markup + '</main><script type="module" src="' + script + '"></script></body></html>'
    const url = '/assets/edition-label-' + library + '-' + hash(doc) + '.html'
    await output(url.slice(1), doc)
    migration.push({ library, name, code: code.trimEnd(), url })
  }
  await output('assets/shadcn-license.txt', await readFile(directory + '/ui/LICENSE.md', 'utf8'))
  return migration.reverse()
}
