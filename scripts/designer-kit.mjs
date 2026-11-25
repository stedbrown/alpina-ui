import { readFile } from 'node:fs/promises'

const px = value => ({ value, unit: 'px' })
const alias = name => '{al.' + name + '}'
const families = css => css.split(/,\s*/).map(s => s.replaceAll("'", ''))
const parseHex = hex => (hex.length === 4 ? [...hex.slice(1)].map(c => c + c) : hex.slice(1).match(/../g)).map(c => parseInt(c, 16))
const color = rgb => ({ colorSpace: 'srgb', components: rgb.map(v => v / 255), alpha: 1 })

// Read the published CSS rather than keeping another palette or type scale in the portal.
export async function kitTokens(mode) {
  const theme = await readFile(new URL('../src/theme.css', import.meta.url), 'utf8')
  const fonts = await readFile(new URL('../src/fonts.css', import.meta.url), 'utf8')
  const grid = await readFile(new URL('../src/ui/grid.css', import.meta.url), 'utf8')
  const block = theme.match(/\[data-al-theme='light'\]\s*\{([^}]+)\}/)[1]
  const entries = block => Object.fromEntries([...block.matchAll(/--al-([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2]]))
  const declarations = entries(block)
  if (mode === 'dark') {
    const dark = entries(theme.match(/:is\(\[data-al-theme='auto'\], \[data-al-theme='dark'\]\)\s*\{([^}]+)\}/)[1])
    for (const [k, v] of Object.entries(dark)) declarations[k] = v.replace(/light-dark\([^,]+,\s*([^)]+)\)/, '$1')
  }
  const al = {}, dictionary = {}
  function add(name, type, value, css, description) {
    al[name] = { $type: type, $value: value, ...(description && { $description: description }) }
    dictionary[name] = { type, value: css }
  }
  for (const [name, css] of Object.entries(declarations)) {
    const ref = css.match(/^var\(--al-([\w-]+)\)$/)?.[1]
    if (ref) {
      add(name, al[ref].$type, alias(ref), alias(ref))
    } else if (css.startsWith('#')) {
      add(name, 'color', color(parseHex(css)), css)
    } else if (css.startsWith('color-mix')) {
      const mix = Number(css.match(/([\d.]+)%/)[1]) / 100
      const v = Math.round(255 * (mode === 'dark' ? mix : 1 - mix))
      add(name, 'color', color([v,v,v]), '#' + v.toString(16).padStart(2, '0').repeat(3))
    } else if (name === 'unit' || name === 'radius' || name.startsWith('space-') || name.startsWith('type-')) {
      const multiplier = css.match(/\* ([\d.]+)\)/)?.[1]
      const value = multiplier ? Number(multiplier) * al.unit.$value.value : parseFloat(css) * (css.endsWith('rem') ? 16 : 1)
      add(name, 'dimension', px(value), value + 'px')
    } else if (name.startsWith('duration-')) {
      add(name, 'duration', { value: parseFloat(css), unit: 'ms' }, css)
    } else if (name === 'ease') {
      add(name, 'cubicBezier', css.slice(css.indexOf('(') + 1, -1).split(',').map(Number), css)
    } else if (name === 'mono' || name === 'font') {
      const stack = name === 'font' ? entries(fonts)['font-family'] : css
      add(name, 'fontFamily', families(stack), stack, name === 'font' ? 'Portal stack with the optional Inter font pack.' : undefined)
    } else if (name === 'measure') {
      add(name, 'number', parseFloat(css), css, 'Maximum reading measure in ch.')
    } else if (name.startsWith('shadow')) {
      const raised = name === 'shadow-raised'
      add(name, 'shadow', { color: raised ? alias('ink') : { ...color([0,0,0]), alpha: 0 },
        offsetX: px(0), offsetY: px(raised ? 4 : 0), blur: px(0), spread: px(raised ? -1 : 0) },
        css.replace('var(--al-ink)', alias('ink')))
    } else throw Error('Designer kit needs a mapping for --al-' + name)
  }
  const media = [...grid.matchAll(/\.al-grid \{\s*--al-cols: (\d+);\s*--al-gutter:[^;]+\* (\d+)\);\s*--al-margin:[^;]+\* (\d+)\)/g)]
  const breaks = [0, ...[...grid.matchAll(/@container al-layout \(min-width:(\d+)rem\)/g)].slice(0, 2).map(m => Number(m[1]) * 16)]
  const grids = media.map((m, i) => ({ columns: +m[1], gutter: +m[2]*al.unit.$value.value, margin: +m[3]*al.unit.$value.value, minimum: breaks[i] }))
  for (const { columns, gutter, margin, minimum } of grids) {
    for (const [name, value] of Object.entries({ gutter, margin, minimum })) add('grid-' + columns + '-' + name, 'dimension', px(value), value + 'px')
    add('grid-' + columns + '-columns', 'number', columns, columns)
  }
  const config = { tokens: { al: dictionary }, platforms: { css: {
    transforms: ['name/kebab'], buildPath: 'build/', files: [{ destination: 'alpina-' + mode + '.css', format: 'css/variables' }],
  } } }
  return { tokens: { al }, config, grids }
}

export function tokenPixels(tokens, key) {
  const { $value } = tokens.al[key]
  return typeof $value === 'string' ? tokenPixels(tokens, $value.slice(4, -1)) : $value.value
}

// Screen templates keep gutters and margins in CSS pixels at a real viewport size.
export function screenGrid({ columns, gutter, margin }, width, height) {
  const track = (width - 2 * margin - (columns - 1) * gutter) / columns
  const rects = Array.from({ length: columns }, (_, i) => {
    const x = margin + i * (track + gutter)
    return '<rect x="' + x + '" width="' + track + '" height="' + height + '"/>'
  })
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">\n' +
    '<title>Alpina ' + columns + '-column grid at ' + width + ' px</title>\n' +
    '<g id="columns" fill="#eb0000" opacity="0.1">\n' + rects.join('\n') + '\n</g>\n</svg>\n'
}

export async function buildDesignerKit(output) {
  const light = await kitTokens('light'), dark = await kitTokens('dark')
  for (const [mode, kit] of Object.entries({ light, dark })) {
    await output('kit/alpina-' + mode + '.tokens.json', JSON.stringify(kit.tokens, null, 2) + '\n')
    await output('kit/alpina-' + mode + '.style-dictionary.json', JSON.stringify(kit.config, null, 2) + '\n')
  }
  const frames = [[390,844], [768,1024], [1440,900]]
  for (const [i, grid] of light.grids.entries()) {
    await output('kit/grid-' + grid.columns + '.svg', screenGrid(grid, ...frames[i]))
  }
  await output('kit/alpina-grid.svg', await readFile(new URL('../web/assets/alpina-grid.svg', import.meta.url)))
  await output('kit/alpina-grid.pdf', await readFile(new URL('../web/assets/alpina-grid.pdf', import.meta.url)))
}
