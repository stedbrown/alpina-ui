import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { build } from 'esbuild'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { marked } from 'marked'

const origin = 'https://alpina-ui.vercel.app'
const siteName = 'Alpina UI'
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const sha = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
const render = (component, props) => renderToStaticMarkup(createElement(component, props))

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

export async function buildWebsite({ guides, guideFiles, apiReference, registry, script, css, notices }) {
  const { Landing, Examples, ComponentDirectory, ReferencePage, ExampleIntroduction, inventory, projects } = await loadPages()
  const paths = []
  const appJS = '/assets/catalog-' + sha(script) + '.js'
  const appCSS = '/assets/catalog-' + sha(css) + '.css'
  const core = await readFile('dist/styles.css', 'utf8')
  const coreCSS = '/assets/alpina-' + sha(core) + '.css'
  const specimenBuild = await build({
    entryPoints: ['web/type-specimen-controls.js'], bundle: true, format: 'esm',
    target: 'es2022', write: false, minify: true,
  })
  const specimen = specimenBuild.outputFiles[0].text
  const specimenJS = '/assets/type-specimen-' + sha(specimen) + '.js'
  const filter = await readFile('web/directory-filter.js', 'utf8')
  const filterJS = '/assets/component-filter-' + sha(filter) + '.js'
  const preview = await readFile('web/assets/alpina-preview.png')
  const previewURL = origin + '/assets/alpina-preview.png?v=' + sha(preview)
  await Promise.all([
    output(appJS, script), output(appCSS, css), output(coreCSS, core),
    output(specimenJS, specimen),
    output(filterJS, filter),
    output('third-party-notices.txt', notices.join('\n\n')),
    output('registry.json', JSON.stringify(registry)), output('reference/api.json', JSON.stringify(apiReference)),
    output('skills/alpina-ui/SKILL.md', await readFile('skills/alpina-ui/SKILL.md')),
    output('assets/alpina-preview.png', preview),
    output('assets/alpina-type-specimen.webp', await readFile('web/assets/alpina-type-specimen.webp')),
    output('assets/alpina-mark.png', await readFile('web/assets/alpina-mark.png')),
  ])

  async function page(route, title, description, body, options = {}) {
    const url = origin + route
    const caption = title === siteName ? 'Alpina UI — Swiss UI components for React' : title + ' · ' + siteName
    const tags = [
      '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff">',
      '<title>' + escape(caption) + '</title><meta name="description" content="' + escape(description) + '">',
      '<link rel="canonical" href="' + escape(url) + '"><link rel="icon" type="image/png" sizes="64x64" href="/assets/alpina-mark.png">',
      '<meta property="og:type" content="website"><meta property="og:site_name" content="Alpina UI">',
      '<meta property="og:title" content="' + escape(caption) + '"><meta property="og:description" content="' + escape(description) + '">',
      '<meta property="og:url" content="' + escape(url) + '"><meta property="og:image" content="' + previewURL + '">',
      '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
      '<meta name="twitter:card" content="summary_large_image"><meta property="og:image:alt" content="Alpina UI components for React beside a multilingual Swiss invoice">',
      '<link rel="license" href="/third-party-notices.txt"><link rel="stylesheet" href="' + (options.app ? appCSS : coreCSS) + '">',
    ]
    if (options.redirect) tags.push('<script>' + options.redirect + '</script>')
    if (options.specimen) tags.push('<script type="module" src="' + specimenJS + '"></script>')
    if (options.filter) tags.push('<script type="module" src="' + filterJS + '"></script>')
    const content = options.app ? '<div id="app">' + body + '</div><script defer src="' + appJS + '"></script>' : body
    await output(route + 'index.html', '<!doctype html>\n<html lang="en"><head>' + tags.join('\n') + '</head><body data-al-page>' + content + '</body></html>')
    paths.push(url)
  }

  // Translate only known bookmarks from the original single-file catalog. Leave local page anchors alone.
  const ids = JSON.stringify(registry.items.map((item) => item.name))
  const legacy = `(()=>{const h=location.hash.slice(1);if(!h)return;const p={rubrica:"client-directory","address-book":"client-directory","rubrica-bilingue":"bilingual-address-book","bilingual-address-book":"bilingual-address-book"};if(Object.hasOwn(p,h))location.replace("/examples/"+p[h]+"/");else if(h==="overview"||h.startsWith("guide/")||${ids}.includes(h.split("/")[0]))location.replace("/docs/#"+h)})();`
  await page('/', siteName, 'Open-source React and TypeScript components for forms, tables and multilingual interfaces on a Swiss typographic grid.',
    render(Landing, { version: registry.version, count: inventory.length }), { redirect: legacy, specimen: true })
  await page('/examples/', 'Example projects', 'Try workshop registration, invoice review, a bilingual studio address book and a client directory built with Alpina UI.', render(Examples))
  await page('/docs/components/', 'Component index', 'Find a React component by name, task or category and open its preview, source code and API.', render(ComponentDirectory), { filter: true })
  const agentsMarkdown = await readFile('docs/agents.md', 'utf8')
  const agentsHTML = await marked.parse(agentsMarkdown)
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

  for (const [slug, name, title, group, description] of inventory) {
    const { usage } = registry.items.find((entry) => entry.name === slug)
    const contracts = apiReference[slug].map((part) => {
      const props = part.props.map((p) => '<li><code>' + escape(p.name) + '</code> — ' + (p.required ? 'required' : 'optional') + ', <code>' + escape(p.type) + '</code></li>').join('')
      return '<h2>' + escape(part.name) + '</h2>' + (props ? '<ul>' + props + '</ul>' : '<p>Accepts the documented native element attributes.</p>')
    }).join('')
    const html = '<p>' + escape(group) + '</p><h1>' + escape(name) + '</h1><p>' + escape(description) + '</p><h2>Usage notes</h2><p>' + escape(usage) + '</p>' + contracts + '<p><a href="/docs/components/">Component index</a></p>'
    await page('/docs/components/' + slug + '/', name + ' — ' + title, description, render(ReferencePage, { html }), { app: true })
  }
  const index = [
    '# Alpina UI', '', '> React components for Swiss typography and multilingual interfaces. The current release is ' + registry.version + '.', '',
    '## Agent tools', '', '- [Agent setup](' + origin + '/reference/agents.md)', '- [Project skill](' + origin + '/skills/alpina-ui/SKILL.md)',
    '- [Component registry](' + origin + '/registry.json)', '- [TypeScript API reference](' + origin + '/reference/api.json)',
    '', '## Guides', '', ...guideLinks, '', '## Examples', '', ...projects.map((p) => '- [' + p.title + '](' + origin + '/examples/' + p.slug + '/): ' + p.description), '',
  ]
  await Promise.all([
    output('llms.txt', index.join('\n')),
    output('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n'),
    output('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map((url) => '<url><loc>' + escape(url) + '</loc></url>').join('') + '</urlset>\n'),
  ])
  console.log('Generated ' + paths.length + ' public pages.')
}
