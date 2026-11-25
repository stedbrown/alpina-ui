import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const project = new URL('../', import.meta.url)
const modal = ['[aria-haspopup="dialog"]', 'Enter', 'dialog[open]']
export const galleryOverlays = {
  dialog: modal, sheet: modal, drawer: modal, command: modal,
  'alert-dialog': modal, 'date-picker': modal,
  'dropdown-menu': ['[aria-haspopup="menu"]', 'Enter', '[role="menu"]'],
  menubar: ['[aria-haspopup="menu"]', 'ArrowDown', '[role="menu"]'],
  'context-menu': ['[aria-keyshortcuts]', 'Shift+F10', '[role="menu"]'],
  combobox: ['input[role="combobox"]', 'ArrowDown', '[role="listbox"]'],
  'canton-combobox': ['input[role="combobox"]', 'ArrowDown', '[role="listbox"]'],
  popover: ['[aria-haspopup="dialog"]', 'Enter', '.al-popover-panel'],
  'hover-card': ['button', 'Enter', '.al-hover-panel'],
  tooltip: ['button[aria-describedby]', 'focus', '[role="tooltip"]'],
  toast: ['button:text-is("Save preferences")', 'Enter', '.al-toast-dismiss'],
}
const files = (await readdir(new URL('catalog/', project))).filter(name => name.endsWith('.tsx'))
const examples = []
for (const file of files) {
  const text = await readFile(new URL('catalog/' + file, project), 'utf8')
  const names = Array.from(text.matchAll(/export function (\w+Example)\(/g), match => match[1])
  if (names.length) examples.push({ file, names })
}
const imports = examples.map(({ file, names }) => 'import { ' + names.join(', ') + ' } from "./catalog/' + file + '"')
const bundle = await build({
  stdin: {
    contents: `
      import { createRoot } from 'react-dom/client'
      import { inventory } from './catalog/inventory'
      import 'alpina-ui/styles.css'
      import 'alpina-ui/fonts.css'
      ${imports.join('\n')}
      const demos = { ${examples.flatMap(({ names }) => names).join(', ')} }
      createRoot(document.getElementById('gallery')).render(inventory.filter(([id]) => !window.galleryIds || window.galleryIds.includes(id)).map(([id, name]) => {
        const Example = demos[name + 'Example']
        return <section key={id} data-component={id}><Example /></section>
      }))
    `,
    resolveDir: fileURLToPath(project), loader: 'tsx',
  },
  bundle: true, write: false, outdir: 'gallery', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' }, loader: { '.woff2': 'dataurl', '.webp': 'dataurl' },
})

/** Mount the actual catalog examples with the distributed stylesheet and local font. */
export async function mountComponentGallery(page, componentIds, { portalPage = true } = {}) {
  const body = portalPage ? '<body data-al-page>' : '<body>'
  await page.setContent('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1">' + body + '<main id="gallery"></main></body></html>')
  if (componentIds) await page.evaluate(ids => { window.galleryIds = ids }, componentIds)
  await page.addStyleTag({ content: bundle.outputFiles.find(file => file.path.endsWith('.css')).text })
  await page.addScriptTag({ content: bundle.outputFiles.find(file => file.path.endsWith('.js')).text })
  await page.locator('[data-component]').last().waitFor({ state: 'attached' })
  await page.evaluate(() => document.fonts.ready)
}
