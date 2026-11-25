import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { Marked, marked } from 'marked'
import { GridOverlay, parseCivilDate } from 'alpina-ui'
import { buildDesignerKit } from './designer-kit.mjs'

const guideMarkdown = new Marked({ renderer: {
  codespan({ text }) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false
    try { parseCivilDate(text) } catch { return false }
    return '<code class="al-swiss-figures"><time datetime="' + text + '">' + text + '</time></code>'
  },
} })

export async function renderGuide(markdown) {
  return (await guideMarkdown.parse(markdown)).replace(/<pre>/g, '<pre tabindex="0">')
}

// Apply the saved catalog appearance before the first paint on every public page.
function initializeAppearance() {
  const key = 'alpina-catalog-theme'
  const root = document.documentElement
  function apply(mode) {
    root.dataset.alTheme = mode === 'dark' || mode === 'light' ? mode : 'auto'
  }
  try { apply(localStorage.getItem(key)) } catch { apply('auto') }
  document.addEventListener('click', event => {
    if (!event.target.closest?.('[data-site-appearance]')) return
    const next = { auto: 'light', light: 'dark', dark: 'auto' }[root.dataset.alTheme]
    apply(next)
    try { localStorage.setItem(key, next) } catch { /* Storage can be disabled. */ }
  })
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue)
  })
}
export const appearanceHead = '<script>(' + initializeAppearance.toString() + ')()</script>' +
  '<style>[data-site-appearance]{flex-shrink:0}[data-site-appearance] span{display:none}' +
  ['auto', 'light', 'dark'].map(mode => 'html[data-al-theme="' + mode + '"] [data-site-appearance] [data-mode="' + mode + '"]{display:block;position:absolute;clip-path:inset(50%);width:1px;height:1px;overflow:hidden;white-space:nowrap}').join('') +
  '</style><noscript><style>[data-site-appearance]{display:none}</style></noscript>'

const origin = 'https://alpina-ui.vercel.app'
const siteName = 'Alpina UI'
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
const render = (component, props) => renderToStaticMarkup(createElement(component, props))

// Remember actions on the prerendered catalog until its React listeners are ready.
function rememberCatalogIntent() {
  const root = document.getElementById('app')
  const trigger = root.querySelector('.al-app-mobile button[aria-expanded]')
  const listeners = new AbortController()
  const options = { capture: true, signal: listeners.signal }
  root.addEventListener('click', event => {
    const button = event.target.closest?.('button')
    if (button?.dataset.componentView) {
      event.stopPropagation()
      root.dataset.viewIntent = button.dataset.componentView
      return
    }
    if (!button || button !== trigger) return
    event.stopPropagation()
    root.dataset.indexIntent = root.dataset.indexIntent ? '' : 'browse'
  }, options)
  window.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || document.querySelector('dialog[open]')) return
    const command = event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)
    const slash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
      !event.target.closest?.('input,textarea,select,[contenteditable=true]')
    if (!command && !slash) return
    event.preventDefault()
    event.stopPropagation()
    root.dataset.indexIntent = 'search'
  }, options)
  root.addEventListener('alpina-index-ready', () => listeners.abort(), { once: true })
}
const indexIntentScript = '<script>(' + rememberCatalogIntent.toString() + ')()</script>'

// Keep the proofing layer outside the app root so it works on static and hydrated routes.
const overlay = render(GridOverlay, { hidden: true, 'data-site-grid': '' })
function listenForGridShortcut() {
  document.addEventListener('keydown', event => {
    if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey ||
        event.key.toLowerCase() !== 'g' || event.repeat || event.isComposing || event.defaultPrevented) return
    const layer = document.querySelector('[data-site-grid]')
    if (!layer) return
    event.preventDefault()
    layer.hidden = !layer.hidden
  })
}
export const siteGrid = overlay + '<script>(' + listenForGridShortcut.toString() + ')()</script>'

async function output(name, data) {
  const target = path.join('site', name)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, data)
}

// Transpile only this site's TSX. React and Alpina resolve to the installed ESM packages.
async function loadPages() {
  const result = await build({
    entryPoints: ['web/reference.tsx'], bundle: true, platform: 'node', format: 'esm',
    target: 'node20', jsx: 'automatic', write: false,
    plugins: [{
      name: 'installed-packages',
      setup(ctx) {
        ctx.onResolve({ filter: /^(?:react(?:\/jsx-runtime)?|alpina-ui)$/ }, (args) => ({
          path: import.meta.resolve(args.path), external: true,
        }))
      },
    }],
  })
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].contents).toString('base64'))
}

export async function buildWebsite({ guides, guideFiles, apiReference, componentGuidance, registry, script, css, notices, renderComponent }) {
  const { Landing, Examples, DesignerKit, Icons, Themes, Principles, Blocks, BlockPage, blockDemos, blocks, ComponentDirectory, ComponentStatus, ReferencePage, ExampleIntroduction, inventory, projects } = await loadPages()
  const paths = []
  const appJS = '/assets/catalog-' + sha(script) + '.js'
  const appCSS = '/assets/catalog-' + sha(css) + '.css'
  const core = await readFile('dist/styles.css', 'utf8')
  const coreCSS = '/assets/alpina-' + sha(core) + '.css'
  const fontBuild = await build({
    entryPoints: ['src/fonts.css'], bundle: true, write: false, outdir: 'assets', minify: true,
    assetNames: '[name]-[hash]', loader: { '.woff2': 'file' },
  })
  // Public pages preload the Latin face. Optional display avoids a late font swap on a slow connection.
  const fontCSS = fontBuild.outputFiles.find(file => file.path.endsWith('.css')).text.replaceAll('font-display:swap', 'font-display:optional')
  const latinFont = '/assets/' + path.basename(fontBuild.outputFiles.find(file => /inter-latin-standard-normal-.*\.woff2$/.test(file.path)).path)
  const fontsURL = '/assets/fonts-' + sha(fontCSS) + '.css'
  const showcaseBuild = await build({
    entryPoints: ['web/home-showcase-controls.js'], bundle: true, format: 'esm',
    target: 'es2022', write: false, minify: true,
  })
  const showcase = showcaseBuild.outputFiles[0].text
  const showcaseJS = '/assets/showcase-' + sha(showcase) + '.js'
  const icons = await readFile('web/icon-controls.js', 'utf8')
  const iconsJS = '/assets/icons-' + sha(icons) + '.js'
  const pickerBuild = await build({ entryPoints: ['web/static-selects.ts'], bundle: true, format: 'esm', target: 'es2022', write: false, minify: true })
  const picker = pickerBuild.outputFiles[0].text
  const pickerJS = '/assets/picker-' + sha(picker) + '.js'
  const themeBuild = await build({ entryPoints: ['web/theme-controls.ts'], bundle: true, format: 'esm', target: 'es2022', write: false, minify: true })
  const theme = themeBuild.outputFiles[0].text
  const themeJS = '/assets/themes-' + sha(theme) + '.js'
  const blockBuild = await build({
    entryPoints: ['web/block-preview.tsx'], bundle: true, splitting: true, format: 'esm',
    target: 'es2022', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, minify: true,
    outdir: 'assets', entryNames: '[name]-[hash]', chunkNames: 'block-[hash]', write: false,
  })
  const blockJS = '/assets/' + path.basename(blockBuild.outputFiles.find(file => path.basename(file.path).startsWith('block-preview-')).path)
  const filter = await readFile('web/directory-filter.js', 'utf8')
  const filterJS = '/assets/component-filter-' + sha(filter) + '.js'
  const preview = await readFile('web/assets/alpina-preview.png')
  const previewURL = origin + '/assets/alpina-preview.png?v=' + sha(preview)
  await Promise.all([
    output(appJS, script), output(appCSS, css), output(coreCSS, core),
    output(fontsURL, fontCSS),
    ...fontBuild.outputFiles.filter(file => file.path.endsWith('.woff2')).map(file => output('assets/' + path.basename(file.path), file.contents)),
    output(showcaseJS, showcase), output(iconsJS, icons),
    output(themeJS, theme), output(pickerJS, picker),
    ...blockBuild.outputFiles.map(file => output('assets/' + path.basename(file.path), file.contents)),
    output(filterJS, filter),
    output('third-party-notices.txt', notices.join('\n\n')),
    output('registry.json', JSON.stringify(registry)), output('reference/api.json', JSON.stringify(apiReference)),
    output('skills/alpina-ui/SKILL.md', await readFile('skills/alpina-ui/SKILL.md')),
    output('assets/alpina-preview.png', preview),
    output('assets/alpina-type-specimen.webp', await readFile('web/assets/alpina-type-specimen.webp')),
    ...['logo.svg', 'logo-mono.svg', 'icon-192.png', 'icon-512.png'].map(async name => output('assets/' + name, await readFile('web/assets/' + name))),
    ...['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'site.webmanifest'].map(async name => output(name, await readFile('web/assets/' + name))),
  ])

  async function page(route, title, description, body, options = {}) {
    const url = origin + route
    const caption = title === siteName ? 'Alpina UI — Swiss UI components for React' : title + ' · ' + siteName
    const tags = [
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff">',
      '<title>' + escape(caption) + '</title><meta name="description" content="' + escape(description) + '">',
      '<link rel="canonical" href="' + escape(url) + '"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">',
      '<meta property="og:type" content="website"><meta property="og:site_name" content="Alpina UI">',
      '<meta property="og:title" content="' + escape(caption) + '"><meta property="og:description" content="' + escape(description) + '">',
      '<meta property="og:url" content="' + escape(url) + '"><meta property="og:image" content="' + previewURL + '">',
      '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
      '<meta name="twitter:card" content="summary_large_image"><meta property="og:image:alt" content="Alpina UI homepage with a print estimate, a Swiss invoice and a press-hours chart">',
      '<link rel="preload" as="font" type="font/woff2" crossorigin href="' + latinFont + '">',
      '<link rel="license" href="/third-party-notices.txt"><link rel="stylesheet" href="' + (options.app ? appCSS : coreCSS) + '">',
      '<link rel="stylesheet" href="' + fontsURL + '">',
      appearanceHead,
    ]
    if (options.guidance) {
      const json = JSON.stringify(options.guidance).replace(/</g, '\\u003c')
      tags.push('<script type="application/json" id="component-guidance-data">' + json + '</script>')
    }
    if (options.redirect) tags.push('<script>' + options.redirect + '</script>')
    if (options.showcase) tags.push(
      '<script>document.documentElement.dataset.showcaseJs=""</script>',
      '<style>html[data-showcase-js] [data-showcase-fallback],html:not([data-showcase-js]) [data-showcase-live]{display:none!important}</style>',
      '<script type="module" src="' + showcaseJS + '"></script>')
    if (options.showcase || options.icons || options.theme) tags.push(
      '<script type="module">if (!CSS.supports("appearance", "base-select")) import(' + JSON.stringify(pickerJS) + ')</script>')
    if (options.icons) tags.push('<script type="module" src="' + iconsJS + '"></script>')
    if (options.theme) tags.push('<script type="module" src="' + themeJS + '"></script>')
    if (options.block) tags.push('<script type="module" src="' + blockJS + '"></script>')
    if (options.filter) tags.push('<script type="module" src="' + filterJS + '"></script>')
    const content = options.app ? '<div id="app"' + (options.prerender ? ' data-prerendered' : '') + '>' + body + '</div>' + (options.noScript ?? '') + (options.prerender ? indexIntentScript : '') + '<script type="module" src="' + appJS + '"></script>' : body
    await output(route + 'index.html', '<!doctype html>\n<html lang="en" data-al-theme="auto"><head>' + tags.join('\n') + '</head><body data-al-page>' + siteGrid + content + '</body></html>')
    paths.push(url)
  }

  // Translate only known bookmarks from the original single-file catalog. Leave local page anchors alone.
  const ids = JSON.stringify(registry.items.map((item) => item.name))
  const legacy = `(()=>{const h=location.hash.slice(1);if(!h)return;const p={rubrica:"client-directory","address-book":"client-directory","rubrica-bilingue":"bilingual-address-book","bilingual-address-book":"bilingual-address-book"};if(Object.hasOwn(p,h))location.replace("/examples/"+p[h]+"/");else if(h==="overview"||h.startsWith("guide/")||${ids}.includes(h.split("/")[0]))location.replace("/docs/#"+h)})();`
  await page('/', siteName, 'Open-source React and TypeScript components for forms, tables and multilingual interfaces on a Swiss typographic grid.',
    render(Landing, { version: registry.version, count: inventory.length }), { redirect: legacy, showcase: true })
  await buildDesignerKit(output)
  await page('/kit/', 'Designer kit', 'Download editable column grids, an A4 type sheet and light and dark design tokens for your design tools.', render(DesignerKit))
  await page('/icons/', 'Alpina icons', 'Browse original SVG icons for navigation, actions, content and Git workflows. Preview sizes and copy React code.', render(Icons), { icons: true })
  await page('/themes/', 'Theme builder', 'Preview your accent, grid and light or dark appearance on Alpina components. Check text contrast and copy CSS variables.', render(Themes), { theme: true })
  await page('/principles/', 'Design principles', 'Eight Swiss design decisions demonstrated with working Alpina components and paired examples.', render(Principles))
  const reviewRoute = '/releases/0.11/'
  // Vercel may serve a dotted version path with its trailing slash removed.
  const review = (await renderGuide(await readFile('docs/release-0.11-design.md', 'utf8')))
    .replace(/(src|href)="images\//g, '$1="' + reviewRoute + 'images/')
  for (const surface of ['home', 'index', 'reference']) {
    for (const edition of ['before', 'after']) {
      const file = 'images/' + surface + '-' + edition + '.jpg'
      await output(reviewRoute + file, await readFile('docs/' + file))
    }
  }
  await page(reviewRoute, 'Portal design review', 'Compare the Alpina homepage, component directory and reference before and after the 0.11 release.', render(ReferencePage, { html: review }))
  await page('/blocks/', 'Page blocks', 'Copy login, dashboard, account settings, CHF pricing and public service pages with the Alpina CLI.', render(Blocks))
  for (const block of blocks) {
    await page('/blocks/' + block.slug + '/', block.title + ' block', block.detail, render(BlockPage, { block, preview: renderToString(await blockDemos[block.slug]()) }), { block: true })
  }
  await page('/examples/', 'Example projects', 'Try workshop registration, invoice review, a bilingual studio address book and a client directory built with Alpina UI.', render(Examples))
  await page('/docs/components/', 'Component index', 'Find a React component by name, task or category and open its preview, source code and API.', render(ComponentDirectory), { filter: true })
  const status = JSON.parse(await readFile('scripts/component-status.json', 'utf8'))
  const records = inventory.map(([slug, name]) => ({ ...status[slug], slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
  await page('/status/', 'Component status', 'Check the API maturity and latest source change for every Alpina component.', render(ComponentStatus, { records }))
  const agentsMarkdown = await readFile('docs/agents.md', 'utf8')
  const agentsHTML = await renderGuide(agentsMarkdown)
  await page('/agents/', 'Agent tools', 'Install the Alpina UI skill or connect a read-only local MCP server to search components, inspect source, and read guides.', render(ReferencePage, { agents: true, html: agentsHTML }))
  await output('reference/agents.md', agentsMarkdown)

  const packageLink = '<p><a href="/alpina-ui-' + registry.version + '.tgz" download>Download Alpina UI ' + registry.version + '</a></p>'
  const quickStart = guides.start.replace('<!-- alpina-download -->', packageLink)
  const componentLinks = inventory.map(([slug, name]) =>
    '<li><a href="/docs/components/' + slug + '/">' + escape(name) + '</a></li>',
  )
  const guideIndex = Object.entries(guides).map(([key, html]) => {
    const heading = html.match(/<h1>(.*?)<\/h1>/)?.[1] ?? escape(key)
    return '<li><a href="/docs/guides/' + key + '/">' + heading + '</a></li>'
  })
  const docsIndex = quickStart + '<h2>Guides</h2><ul>' + guideIndex.join('') +
    '</ul><h2>Components</h2><ul>' + componentLinks.join('') + '</ul>'
  await page('/docs/', 'Documentation', 'Install Alpina UI and browse component APIs, accessibility guidance, design research, and the Swiss localization guides.', render(ReferencePage, { html: docsIndex }), { app: true })
  for (const project of projects) {
    await page('/examples/' + project.slug + '/', project.title, project.description, render(ExampleIntroduction, project), { app: true })
  }

  const guideLinks = []
  for (const [key, file] of Object.entries(guideFiles)) {
    const markdown = await readFile(file, 'utf8')
    const title = markdown.match(/^#\s+(.+)$/m)[1]
    await output('reference/' + key + '.md', markdown)
    const intro = marked.lexer(markdown).find((token) => token.type === 'paragraph')?.text ?? title
    const description = intro.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '').split(/(?<=[.!?])\s/)[0]
    const route = '/docs/guides/' + key + '/'
    await page(route, title, description, render(ReferencePage, { html: key === 'start' ? quickStart : guides[key] }), { app: true })
    guideLinks.push('- [' + title + '](' + origin + '/reference/' + key + '.md)')
  }

  for (const [slug, name, title, , description] of inventory) {
    const contracts = apiReference[slug].map((part) => {
      const props = part.props.map((p) => '<li><code>' + escape(p.name) + '</code> — ' + (p.required ? 'required' : 'optional') + ', <code>' + escape(p.type) + '</code></li>').join('')
      return '<h2>' + escape(part.name) + '</h2>' + (props ? '<ul>' + props + '</ul>' : '<p>Accepts the documented native element attributes.</p>')
    }).join('')
    const entry = componentGuidance[slug]
    if (!entry) throw new Error('Missing editorial guidance for ' + slug)
    const guidance = { slug, entry }
    await output('reference/components/' + slug + '.json', JSON.stringify(entry))
    const route = '/docs/components/' + slug
    const body = renderComponent(route)
    await page(route + '/', name + ' — ' + title, description, body, { app: true, prerender: true, guidance, noScript: '<noscript><section aria-label="Component API">' + contracts + '</section></noscript>' })
  }
  const index = [
    '# Alpina UI', '', '> React components for Swiss typography and multilingual interfaces. The current release is ' + registry.version + '.', '',
    '## Agent tools', '', '- [Agent setup](' + origin + '/reference/agents.md)', '- [Project skill](' + origin + '/skills/alpina-ui/SKILL.md)',
    '- [Component registry](' + origin + '/registry.json)', '- [TypeScript API reference](' + origin + '/reference/api.json)', '- [Icon directory](' + origin + '/icons/)',
    '', '## Guides', '', '- [Design principles](' + origin + '/principles/)', ...guideLinks, '', '## Blocks', '', ...blocks.map(b => '- [' + b.title + '](' + origin + '/blocks/' + b.slug + '/) — alpina add block/' + b.slug),
    '', '## Examples', '', ...projects.map((p) => '- [' + p.title + '](' + origin + '/examples/' + p.slug + '/): ' + p.description), '',
  ]
  await Promise.all([
    output('llms.txt', index.join('\n')),
    output('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n'),
    output('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map((url) => '<url><loc>' + escape(url) + '</loc></url>').join('') + '</urlset>\n'),
  ])
  console.log('Generated ' + paths.length + ' public pages.')
}
