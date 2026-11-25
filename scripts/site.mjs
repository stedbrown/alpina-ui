import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { build } from 'esbuild'
import { buildMigrationComparison } from './migration-comparison.mjs'
import { createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { Marked, marked } from 'marked'
import {
  CodeSample, GridOverlay, InlineCode, NavigationMenu, PageRegion, Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow, TextLink, Typography, parseCivilDate,
} from 'alpina-ui'
import { deploymentLinks, siteMetadata, siteUrl } from './site-config.mjs'
import { buildDesignerKit } from './designer-kit.mjs'

const render = (component, props) => renderToStaticMarkup(createElement(component, props))
// Allow prose and code examples to wrap around document identifiers while preserving each identifier.
const documentId = /(?<![A-Za-z0-9])([A-Z]{1,8}[-‑]\d{2,}(?:[.-]\d+)*)(?![A-Za-z0-9])/g
function keepDocumentIds(text) {
  return text.split(documentId).map((part, index) => index % 2
    ? createElement(Typography, { key: index, as: 'span', variant: 'inherit', numeric: true }, part)
    : part)
}
const guideMarkdown = new Marked({ renderer: {
  code({ text, lang }) { return render(CodeSample, { code: text, language: lang }) },
  codespan({ text }) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      try {
        parseCivilDate(text)
        return render(InlineCode, { children: createElement('time', { dateTime: text }, text) })
      } catch { /* A non-date example is still valid inline code. */ }
    }
    return render(InlineCode, { children: keepDocumentIds(text), unbroken: /^(?:CHE-\d{3}\.\d{3}\.\d{3}|\+41(?:[ \u00a0]?\d){9})$/.test(text) })
  },
  link({ href, title, tokens }) {
    if (tokens.length === 1 && tokens[0].type === 'text' && !tokens[0].tokens && tokens[0].text.search(documentId) >= 0)
      return render(TextLink, { href, title, children: keepDocumentIds(tokens[0].text) })
    return render(TextLink, { href, title, dangerouslySetInnerHTML: { __html: this.parser.parseInline(tokens) } })
  },
  table({ header, rows }) {
    // A hard hyphen is a browser line-break opportunity, even with hyphens: none.
    // Keep editorial compounds intact in headings and preserve the original copyable text.
    const headerText = tokens => tokens.map(token => {
      if (token.type !== 'text' || token.tokens) return this.parser.parseInline([token])
      return token.text.split(/([\p{L}\p{N}]+(?:[-‑][\p{L}\p{N}]+)+)/gu).map((text, index) => index % 2
        ? render(Typography, { as: 'span', variant: 'inherit', 'data-unbroken': true, children: text })
        : this.parser.parseInline([{ ...token, text }])).join('')
    }).join('')
    const cells = (entries, Cell) => entries.map((cell, index) => createElement(Cell, {
      key: index, scope: Cell === TableHead ? 'col' : undefined, textAlign: cell.align ?? undefined,
      dangerouslySetInnerHTML: { __html: Cell === TableHead ? headerText(cell.tokens) : this.parser.parseInline(cell.tokens) },
    }))
    return render(Table, { tabIndex: 0, children: [
      createElement(TableHeader, { key: 'head' }, createElement(TableRow, null, cells(header, TableHead))),
      createElement(TableBody, { key: 'body' }, rows.map((row, index) =>
        createElement(TableRow, { key: index }, cells(row, TableCell)))),
    ] })
  },
} })
export function renderGuide(markdown) { return guideMarkdown.parse(deploymentLinks(markdown)) }

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
export const appearanceHead = '<script>(' + initializeAppearance.toString() + ')()</script>'

const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

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

export async function buildWebsite({ outputDir, guides, guideFiles, guideManifest, apiReference, componentGuidance, registry, script, css, notices, renderComponent }) {
  const { Landing, TypeProof, AccessProof, PrintDesk, InstallCommand, StartHere, Examples, DesignerKit, StaticApi, Icons, Themes, Principles, Blocks, BlockPage, blockDemos, blocks, ComponentDirectory, ComponentStatus, ReferencePage, GuideLanguages, downloadLabel, ExampleIntroduction, inventory, projects } = await loadPages()
  async function output(name, data) {
    const target = path.join(outputDir, name)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, data)
  }
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
    entryPoints: ['web/home-showcase-controls.js'], bundle: true, splitting: true, format: 'esm',
    target: 'es2022', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, write: false, minify: true,
    outdir: 'assets', entryNames: 'showcase-[hash]', chunkNames: 'sample-[hash]',
  })
  const showcaseJS = '/assets/' + path.basename(showcaseBuild.outputFiles.find(file => path.basename(file.path).startsWith('showcase-')).path)
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
  const previewURL = siteUrl + siteMetadata.imagePath + '?v=' + sha(preview)
  await Promise.all([
    output(appJS, script), output(appCSS, css), output(coreCSS, core),
    output(fontsURL, fontCSS),
    ...fontBuild.outputFiles.filter(file => file.path.endsWith('.woff2')).map(file => output('assets/' + path.basename(file.path), file.contents)),
    ...showcaseBuild.outputFiles.map(file => output('assets/' + path.basename(file.path), file.contents)), output(iconsJS, icons),
    output(themeJS, theme), output(pickerJS, picker),
    ...blockBuild.outputFiles.map(file => output('assets/' + path.basename(file.path), file.contents)),
    output(filterJS, filter),
    output('third-party-notices.txt', notices.join('\n\n')),
    output('registry.json', JSON.stringify({ ...registry, homepage: siteUrl + '/' })),
    output('reference/api.json', JSON.stringify(apiReference)),
    output('skills/alpina-ui/SKILL.md', deploymentLinks(await readFile('skills/alpina-ui/SKILL.md', 'utf8'))),
    output(siteMetadata.imagePath, preview),
    output('assets/alpina-type-specimen.webp', await readFile('web/assets/alpina-type-specimen.webp')),
    ...['logo.svg', 'logo-mono.svg', 'alpina-mark.png', 'icon-192.png', 'icon-512.png'].map(async name => output('assets/' + name, await readFile('web/assets/' + name))),
    ...['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'site.webmanifest'].map(async name => output(name, await readFile('web/assets/' + name))),
  ])

  async function page(route, title, description, body, options = {}) {
    const url = siteUrl + route
    const caption = route === '/' ? siteMetadata.title : title + ' · ' + siteMetadata.name
    const tags = [
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff">',
      '<title>' + escape(caption) + '</title><meta name="description" content="' + escape(description) + '">',
      '<link rel="canonical" href="' + escape(url) + '"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">',
      '<meta property="og:type" content="website"><meta property="og:site_name" content="' + escape(siteMetadata.name) + '">',
      '<meta property="og:title" content="' + escape(caption) + '"><meta property="og:description" content="' + escape(description) + '">',
      '<meta property="og:url" content="' + escape(url) + '"><meta property="og:image" content="' + previewURL + '">',
      '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
      '<meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="' + escape(siteMetadata.imageAlt) + '">',
      '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + escape(caption) + '">',
      '<meta name="twitter:description" content="' + escape(description) + '"><meta name="twitter:image" content="' + previewURL + '">',
      '<meta name="twitter:image:alt" content="' + escape(siteMetadata.imageAlt) + '">',
      '<link rel="preload" as="font" type="font/woff2" crossorigin href="' + latinFont + '">',
      '<link rel="license" href="/third-party-notices.txt"><link rel="stylesheet" href="' + (options.app ? appCSS : coreCSS) + '">',
      '<link rel="stylesheet" href="' + fontsURL + '">',
      appearanceHead,
    ]
    for (const [language, href] of Object.entries(options.alternates ?? {}))
      tags.push('<link rel="alternate" hreflang="' + escape(language) + '" href="' + escape(siteUrl + href) + '">')
    if (route === '/') {
      const source = {
        '@context': 'https://schema.org', '@type': 'SoftwareSourceCode', '@id': url + '#source',
        name: siteMetadata.name, url, description, image: previewURL, codeRepository: siteMetadata.repository,
        license: siteMetadata.repository + '/blob/main/LICENSE', programmingLanguage: 'TypeScript',
        runtimePlatform: 'React', version: registry.version, inLanguage: siteMetadata.language,
      }
      tags.push('<script type="application/ld+json">' + JSON.stringify(source).replace(/</g, '\\u003c') + '</script>')
    }
    if (options.guidance) {
      const json = JSON.stringify(options.guidance).replace(/</g, '\\u003c')
      tags.push('<script type="application/json" id="component-guidance-data">' + json + '</script>')
    }
    if (options.redirect) tags.push('<script>' + options.redirect + '</script>')
    if (options.showcase) tags.push(
      '<script type="module" src="' + showcaseJS + '"></script>')
    if (options.showcase || options.icons || options.theme) tags.push(
      '<script type="module">if (!CSS.supports("appearance", "base-select")) import(' + JSON.stringify(pickerJS) + ')</script>')
    if (options.icons) tags.push('<script type="module" src="' + iconsJS + '"></script>')
    if (options.theme) tags.push('<script type="module" src="' + themeJS + '"></script>')
    if (options.block) tags.push('<script type="module" src="' + blockJS + '"></script>')
    if (options.filter) tags.push('<script type="module" src="' + filterJS + '"></script>')
    const content = (options.guideBody ? '<template id="translated-guide">' + options.guideBody + '</template>' : '') + (options.app ? render(PageRegion, { id: 'app', 'data-prerendered': options.prerender ? '' : undefined, dangerouslySetInnerHTML: { __html: body } }) + (options.noScript ?? '') + (options.prerender ? indexIntentScript : '') + '<script type="module" src="' + appJS + '"></script>' : body)
    await output(route + 'index.html', '<!doctype html>\n<html lang="' + (options.language ?? siteMetadata.language) + '" data-al-theme="auto"><head>' + tags.join('\n') + '</head><body data-al-page>' + siteGrid + content + '</body></html>')
    paths.push(url)
  }

  // Translate only known bookmarks from the original single-file catalog. Leave local page anchors alone.
  const ids = JSON.stringify(registry.items.map((item) => item.name))
  const legacy = `(()=>{const h=location.hash.slice(1);if(!h)return;const p={rubrica:"client-directory","address-book":"client-directory","rubrica-bilingue":"bilingual-address-book","bilingual-address-book":"bilingual-address-book"};if(Object.hasOwn(p,h))location.replace("/examples/"+p[h]+"/");else if(h==="overview"||h.startsWith("guide/")||${ids}.includes(h.split("/")[0]))location.replace("/docs/#"+h)})();`
  const command = 'npm install ' + siteUrl + '/alpina-ui-' + registry.version + '.tgz'
  const migration = await buildMigrationComparison(output, { coreCSS, fontsURL })
  const typeProof = renderToString(createElement(TypeProof), { identifierPrefix: 'landing-type-' })
  const access = renderToString(createElement(AccessProof), { identifierPrefix: 'landing-access-' })
  const queue = renderToString(createElement(PrintDesk), { identifierPrefix: 'landing-queue-' })
  const installation = renderToString(createElement(InstallCommand, { command }), { identifierPrefix: 'landing-install-' })
  await page('/', siteMetadata.name, siteMetadata.description,
    render(Landing, { version: registry.version, count: inventory.length, queue, command, installation, access, typeProof, migration }), { redirect: legacy, showcase: true })
  await page('/start-here/', 'Start here', 'Choose a developer, designer or shadcn migration path into Alpina UI.', render(StartHere))
  await buildDesignerKit(output)
  await page('/kit/', 'Designer kit', 'Download editable column grids, an A4 type sheet and light and dark design tokens for your design tools.', render(DesignerKit))
  await page('/icons/', 'Alpina icons', 'Browse original SVG icons for navigation, actions, content and Git workflows. Preview sizes and copy React code.', render(Icons), { icons: true })
  await page('/themes/', 'Theme builder', 'Preview your accent, grid and light or dark appearance on Alpina components. Check text contrast and copy CSS variables.', render(Themes), { theme: true })
  await page('/principles/', 'Design principles', 'Eight Swiss design decisions demonstrated with working Alpina components and paired examples.', render(Principles))
  await page('/blocks/', 'Page blocks', 'Copy login, dashboard, account settings, CHF pricing and public service pages with the Alpina CLI.', render(Blocks))
  for (const block of blocks) {
    await page('/blocks/' + block.slug + '/', block.title + ' block', block.detail, render(BlockPage, { block, preview: renderToString(await blockDemos[block.slug]()) }), { block: true })
  }
  await page('/examples/', 'Example projects', 'Try workshop registration, invoice review, a bilingual studio address book and a client directory built with Alpina UI.', render(Examples, { directoryStory: await renderGuide((await readFile('docs/directory.md', 'utf8')).replace(/^#+ /gm, heading => '#' + heading)) }))
  await page('/docs/components/', 'Component index', 'Find a React component by name, task or category and open its preview, source code and API.', render(ComponentDirectory), { filter: true })
  const status = JSON.parse(await readFile('scripts/component-status.json', 'utf8'))
  const records = inventory.map(([slug, name]) => ({ ...status[slug], slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
  await page('/status/', 'Component status', 'Check the API maturity and latest source change for every Alpina component.', render(ComponentStatus, { records }))
  const agentsMarkdown = deploymentLinks(await readFile('docs/agents.md', 'utf8'))
  const agentsHTML = await renderGuide(agentsMarkdown)
  await page('/agents/', 'Agent tools', 'Install the Alpina UI skill or connect a read-only local MCP server to search components, inspect source, and read guides.', render(ReferencePage, { agents: true, html: agentsHTML }))
  await output('reference/agents.md', agentsMarkdown)

  const packageLink = render(Typography, { children: createElement(TextLink, {
    href: '/alpina-ui-' + registry.version + '.tgz', download: true,
  }, 'Download Alpina UI ' + registry.version) })
  const quickStart = guides.start.replace('<!-- alpina-download -->', packageLink)
  const componentLinks = inventory.map(([slug, label]) => ({ href: '/docs/components/' + slug + '/', label }))
  const guideLinksForIndex = await Promise.all(Object.entries(guideFiles).filter(([key]) => guideManifest.some(guide => guide.id === key && guide.navigation)).map(async ([key, file]) => ({
    href: '/docs/guides/' + key + '/', label: (await readFile(file, 'utf8')).match(/^#\s+(.+)$/m)[1],
  })))
  const docsIndex = quickStart + render(NavigationMenu, { label: 'Documentation directory',
    sections: [{ title: 'Guides', links: guideLinksForIndex }, { title: 'Components', links: componentLinks }] })
  await page('/docs/', 'Documentation', 'Install Alpina UI and browse component APIs, accessibility guidance, design research, and the Swiss localization guides.', render(ReferencePage, { html: docsIndex }), { app: true })
  for (const project of projects) {
    await page('/examples/' + project.slug + '/', project.title, project.description, render(ExampleIntroduction, project), { app: true })
  }

  const guideLinks = []
  for (const [key, file] of Object.entries(guideFiles)) {
    const markdown = deploymentLinks(await readFile(file, 'utf8'))
    const title = markdown.match(/^#\s+(.+)$/m)[1]
    await output('reference/' + key + '.md', markdown)
    const intro = marked.lexer(markdown).find((token) => token.type === 'paragraph')?.text ?? title
    const description = intro.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '').split(/(?<=[.!?])\s/)[0]
    const route = '/docs/guides/' + key + '/'
    const [id, language = 'en'] = key.split('/')
    const family = Object.keys(guideFiles).filter(candidate => candidate === id || candidate.startsWith(id + '/'))
    const alternates = family.length > 1 ? Object.fromEntries([...family.map(name => [name.split('/')[1] ?? 'en', '/docs/guides/' + name + '/']), ['x-default', '/docs/guides/' + id + '/']]) : undefined
    const selector = alternates ? render(GuideLanguages, { guide: id, language, hosted: true }) : ''
    const html = id === 'start' ? guides[key].replace('<!-- alpina-download -->', packageLink.replace('Download Alpina UI', downloadLabel[language] + ' Alpina UI')) : guides[key]
    await page(route, title, description, render(ReferencePage, { html: selector + html }), { app: true, language, alternates, guideBody: language === 'en' ? undefined : guides[key] })
    guideLinks.push('- [' + title + '](' + siteUrl + '/reference/' + key + '.md)')
  }

  for (const [slug, name, title, , description] of inventory) {
    const contracts = renderToStaticMarkup(createElement(StaticApi, { entries: apiReference[slug] }), {
      identifierPrefix: 'static-api-',
    })
    const entry = componentGuidance[slug]
    if (!entry) throw new Error('Missing editorial guidance for ' + slug)
    const guidance = { slug, entry }
    await output('reference/components/' + slug + '.json', JSON.stringify(entry))
    const route = '/docs/components/' + slug
    const body = renderComponent(route)
    await page(route + '/', name + ' — ' + title, description, body, { app: true, prerender: true, guidance, noScript: '<noscript>' + contracts + '</noscript>' })
  }
  const index = [
    '# Alpina UI', '', '> React components for Swiss typography and multilingual interfaces. The current release is ' + registry.version + '.', '',
    '## Agent tools', '', '- [Agent setup](' + siteUrl + '/reference/agents.md)', '- [Project skill](' + siteUrl + '/skills/alpina-ui/SKILL.md)',
    '- [Component registry](' + siteUrl + '/registry.json)', '- [TypeScript API reference](' + siteUrl + '/reference/api.json)', '- [Icon directory](' + siteUrl + '/icons/)',
    '', '## Guides', '', '- [Design principles](' + siteUrl + '/principles/)', ...guideLinks, '', '## Blocks', '', ...blocks.map(b => '- [' + b.title + '](' + siteUrl + '/blocks/' + b.slug + '/) — alpina add block/' + b.slug),
    '', '## Examples', '', ...projects.map((p) => '- [' + p.title + '](' + siteUrl + '/examples/' + p.slug + '/): ' + p.description), '',
  ]
  await Promise.all([
    output('llms.txt', index.join('\n')),
    output('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + siteUrl + '/sitemap.xml\n'),
    output('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map((url) => '<url><loc>' + escape(url) + '</loc></url>').join('') + '</urlset>\n'),
  ])
  console.log('Generated ' + paths.length + ' public pages.')
}
