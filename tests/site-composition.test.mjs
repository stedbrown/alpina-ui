import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
import { marked } from 'marked'

// Native form submission, option trees, text semantics and progressive-enhancement
// templates are part of the components' contracts. Styled UI comes from Alpina.
const content = new Set('abbr address b bdi br cite dd dl dt em form i li noscript ol optgroup option small span strong sub sup template time ul'.split(' '))
const slotHosts = new Set('a address article aside button div fieldset footer form header label li main nav ol section ul'.split(' '))
const textTags = new Set(['time', 'span', 'strong', 'em'])
const inlineHTML = /<(?:a|article|aside|button|code|details|fieldset|footer|h[1-6]|header|input|label|main|menu|nav|pre|section|select|style|summary|svg|table|textarea|ul)(?:\s|>)/i

function audit(name, source) {
  const file = ts.createSourceFile(name, source, ts.ScriptTarget.Latest, true,
    name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const errors = []
  const publicComponents = new Set()
  for (const stmt of file.statements) {
    if (!ts.isImportDeclaration(stmt) || !/^alpina-ui(?:\/|$)/.test(stmt.moduleSpecifier.text)) continue
    const bindings = stmt.importClause?.namedBindings
    if (bindings && ts.isNamedImports(bindings)) for (const part of bindings.elements) publicComponents.add(part.name.text)
  }
  function report(node, message) {
    errors.push(name + ':' + (file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1) + ' ' + message)
  }
  function check(node) {
    if (ts.isImportDeclaration(node)) {
      const spec = node.moduleSpecifier.text
      if (/\.css(?:$|\?)/.test(spec) && !/^alpina-ui\/(?:styles(?:\/[-\w]+)?|fonts|theme)\.css$/.test(spec))
        report(node, 'Import styles from the public package: ' + spec)
      if (/(?:^|\/)src\/(?:ui|portal|interactive|swiss)\/|\.internal(?:\.|$)/.test(spec))
        report(node, 'Use a public package export: ' + spec)
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file)
      const attrs = node.attributes.properties.filter(ts.isJsxAttribute).map(a => a.name.getText(file))
      if (attrs.includes('style') || attrs.includes('className') || attrs.includes('class'))
        report(node, 'Use component variants for styling <' + tag + '>')
      if (/^[a-z]/.test(tag)) {
        const parent = ts.isJsxOpeningElement(node) ? node.parent.parent : node.parent
        const slot = ts.isJsxElement(parent) && publicComponents.has(parent.openingElement.tagName.getText(file)) &&
          parent.openingElement.attributes.properties.some(a => ts.isJsxAttribute(a) && a.name.getText(file) === 'asChild')
        if (!content.has(tag) && !(slot && slotHosts.has(tag))) report(node, 'Use an Alpina component for <' + tag + '>')
        if (!slot && attrs.some(attr => /^on(?:Click|Key|Pointer)/.test(attr) || attr === 'tabIndex'))
          report(node, 'Use an Alpina interactive component for <' + tag + '>')
      }
    }
    if (ts.isCallExpression(node) && /(?:^|\.)createElement$/.test(node.expression.getText(file))) {
      const first = node.arguments[0]
      if (first && ts.isStringLiteralLike(first) && !textTags.has(first.text))
        report(node, 'Render a public component instead of creating ' + first.text)
    }
    if ((ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) &&
        name.startsWith('scripts/') && inlineHTML.test(node.text)) {
      // The distributable offline document embeds the public CSS and font bundle.
      if (!(name === 'scripts/catalog.mjs' && node.text === '<style>')) report(node, 'Render UI with public components')
    }
    if (ts.isPropertyAccessExpression(node)) {
      const assignment = ts.isBinaryExpression(node.parent) && node.parent.left === node &&
        node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
      if ((assignment && ['innerHTML', 'outerHTML', 'className', 'cssText'].includes(node.name.text)) ||
          node.name.text === 'insertAdjacentHTML') report(node, 'Render markup through public components')
    }
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'style') {
      const call = node.parent.parent
      // The theme preview applies and removes only the user's Alpina token selection.
      const themeOperation = name === 'web/theme-builder.tsx' && ts.isCallExpression(call) &&
        ['preview.style.removeProperty(key)', 'preview.style.setProperty(key, value)'].includes(call.getText(file))
      if (!themeOperation) report(node, 'Apply layout through component props')
    }
    ts.forEachChild(node, check)
  }
  check(file)
  return errors
}

async function filesUnder(dir) {
  const paths = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = dir + '/' + entry.name
    if (entry.isDirectory()) paths.push(...await filesUnder(name))
    else if (/\.(?:css|tsx?|m?js)$/.test(name) && !name.endsWith('.d.ts')) paths.push(name)
  }
  return paths
}

test('the portal, embedded catalog, projects and copyable blocks use the public library for UI', async () => {
  const dirs = ['web', 'catalog', 'blocks', 'recipes/rubrica/src']
  const files = (await Promise.all(dirs.map(filesUnder))).flat().concat('scripts/site.mjs', 'scripts/catalog.mjs')
  const errors = []
  for (const path of files.sort()) {
    if (path.endsWith('.css')) errors.push(path + ': move this stylesheet into the component that owns it')
    else errors.push(...audit(path, await readFile(path, 'utf8')))
  }
  assert.equal(errors.length, 0, errors.join("\n"))
})

test('the composition audit detects custom UI in JSX, scripts, markup generators and CSS imports', () => {
  for (const [file, source] of [
    ['web/page.tsx', 'export const Page = () => <button>Open</button>'],
    ['catalog/card.tsx', 'export const Card = () => <Stack className="new-card" />'],
    ['blocks/pricing.tsx', 'export const Price = () => <Stack style={{ padding: 9 }} />'],
    ['web/menu.js', 'root.innerHTML = "<nav>Actions</nav>"'],
    ['web/footer.ts', 'document.createElement("footer")'],
    ['scripts/site.mjs', 'const heading = "<nav><a href=\'/\'>Start</a></nav>"'],
    ['web/brand.tsx', 'import "./brand.css"'],
    ['web/shortcut.tsx', 'export const Shortcut = () => <span onClick={run}>Run</span>'],
    ['web/search.tsx', 'import { Search } from "../src/ui/search.internal.js"'],
  ]) assert.ok(audit(file, source).length > 0, source)
  assert.deepEqual(audit('web/page.tsx', "import { Button } from 'alpina-ui'; export const Page = () => <Button asChild><a href='/'>Home</a></Button>"), [])
})

test('guide authors use Markdown for UI so links, code and tables go through the shared renderer', async () => {
  const bad = []
  for (const filename of (await readdir('docs')).filter(file => file.endsWith('.md'))) {
    const tokens = marked.lexer(await readFile('docs/' + filename, 'utf8'))
    marked.walkTokens(tokens, token => {
      if (token.type === 'html' && (inlineHTML.test(token.raw) || /\s(?:style|class)=/i.test(token.raw))) {
        bad.push(filename + ': ' + token.raw)
      }
    })
  }
  assert.deepEqual(bad, [])
})
