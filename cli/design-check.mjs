// A conservative review of React, CSS or HTML source against Alpina's typographic rules.
// It reports only patterns that the design guide asks authors to avoid, with the replacement.

const tailwindUtility = /^-?(?:bg|text|font|p[xytrbl]?|m[xytrbl]?|rounded|shadow|border|ring|gap|space-[xy]|leading|tracking|w|h|min-w|max-w|from|via|to|justify|items|grid-cols|flex|inline-flex|grid|hidden|block)(?:-|$)/

const rules = [
  {
    id: 'gradient',
    test: /\b(?:repeating-)?(?:linear|radial|conic)-gradient\(|\bbg-gradient-to-|\bbg-(?:linear|radial|conic)-/,
    message: 'Decorative gradient.',
    fix: 'Choose a solid paper, ink or red field: var(--al-surface), var(--al-ink) or var(--al-accent).',
  },
  {
    id: 'rounded-corners',
    test: /\bborder(?:-(?:top|bottom)-(?:left|right))?-radius\s*:(?!\s*(?:0(?:px)?\s*(?:[;}"']|$)|var\(--al-radius\)))|\bborderRadius\s*:(?!\s*(?:0\b|['"]0(?:px)?['"]|['"]var\(--al-radius\)['"]))|(?<![\w-])rounded(?:-(?!none\b)[\w[\]]+)?(?![\w-])/,
    message: 'Rounded corners.',
    fix: 'Alpina corners are square. Remove the radius or use var(--al-radius).',
  },
  {
    id: 'centered-text',
    test: /\btext-align\s*:\s*center|\btextAlign\s*:\s*['"]center['"]|(?<![\w-])text-center(?![\w-])/,
    message: 'Centered text.',
    fix: 'Keep headings and reading text flush left on a shared column edge. Center only a lone numeral or icon in a cell.',
  },
  {
    id: 'hard-coded-color',
    test: /(?:[:(,]\s*|['"`\[])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(\s*\d/,
    message: 'Hard-coded color.',
    fix: 'Use the theme tokens var(--al-ink), var(--al-surface), var(--al-muted), var(--al-line) and var(--al-accent), so dark mode and custom themes keep working.',
  },
  {
    id: 'soft-shadow',
    test: /\bbox-shadow\s*:(?!\s*(?:none\b|inset\b))|\bboxShadow\s*:\s*['"](?!none|inset)|(?<![\w-])shadow-(?:sm|md|lg|xl|2xl)(?![\w-])/,
    message: 'Floating shadow.',
    fix: 'Separate areas with a rule, whitespace or a solid field. A shadow belongs only to a surface that sits above the page, such as a menu.',
  },
  {
    id: 'font-family',
    test: /\bfont-family\s*:(?!\s*(?:var\(--al-font|inherit\b))|\bfontFamily\s*:\s*['"](?!var\(--al-font|inherit)/,
    message: 'Separate typeface.',
    fix: 'Keep the Alpina grotesk through var(--al-font) and the Typography variants.',
  },
]

function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index; i++) if (source.charCodeAt(i) === 10) line++
  return line
}

function alpinaImports(source) {
  const names = new Set()
  for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]alpina-ui(?:\/[\w/-]+)?['"]/g))
    for (const part of match[1].split(',')) {
      const name = part.replace(/^\s*type\s+/, '').split(/\s+as\s+/).pop().trim()
      if (/^[A-Z]/.test(name)) names.add(name)
    }
  return names
}

/** Returns findings sorted by line. Each finding names a rule, the line, the problem and the replacement. */
export function checkDesign(source) {
  if (typeof source !== 'string') throw new TypeError('Expected source text.')
  const findings = []
  const lines = source.split('\n')
  lines.forEach((text, index) => {
    if (/alpina-design-ignore/.test(text)) return
    for (const rule of rules) {
      const match = rule.test.exec(text)
      if (match) findings.push({ rule: rule.id, line: index + 1, excerpt: text.trim().slice(0, 120), message: rule.message, fix: rule.fix })
    }
  })

  // Utility classes on an Alpina control override its tested variants.
  const components = alpinaImports(source)
  for (const match of source.matchAll(/<([A-Z]\w*)\b([^<>]*?)\bclassName=(?:"([^"]*)"|'([^']*)'|\{\s*['"`]([^'"`]*)['"`]\s*\})/g)) {
    if (!components.has(match[1])) continue
    const classes = (match[3] ?? match[4] ?? match[5]).split(/\s+/).map(name => name.replace(/^[\w-]+:/, ''))
    const utilities = classes.filter(name => tailwindUtility.test(name))
    if (utilities.length) findings.push({
      rule: 'utility-override', line: lineOf(source, match.index), excerpt: '<' + match[1] + ' className="' + utilities.join(' ') + '">',
      message: 'Utility classes restyle an Alpina component.',
      fix: 'Select a public variant or size, and place the component with Grid, GridItem or Stack.',
    })
  }

  // A card inside a card hides the hierarchy of the page.
  if (components.has('Card')) {
    let depth = 0
    for (const match of source.matchAll(/<(\/?)Card\b[^>]*?(\/?)>/g)) {
      if (match[1]) { depth = Math.max(0, depth - 1); continue }
      if (depth > 0) findings.push({
        rule: 'nested-card', line: lineOf(source, match.index), excerpt: match[0].slice(0, 120),
        message: 'Card inside a card.',
        fix: 'Group the inner task with a heading, a Separator and whitespace. Reserve Card for one unit that belongs together.',
      })
      if (!match[2]) depth++
    }
  }

  // One accent: more than one color fill competing for attention.
  const accents = new Set([...source.matchAll(/(?<![\w-])(?:bg|text|border)-(red|blue|green|yellow|orange|purple|pink|indigo|teal|emerald|sky|violet|amber|lime|cyan|fuchsia|rose)-\d{2,3}\b/g)].map(match => match[1]))
  if (accents.size > 1) findings.push({
    rule: 'several-accents', line: 1, excerpt: [...accents].join(', '),
    message: 'Several accent colors.',
    fix: 'Use paper, ink and one red accent. Give the red one job, such as the current section or the primary action.',
  })
  return findings.sort((a, b) => a.line - b.line)
}

export function formatFindings(findings, file = 'source') {
  if (!findings.length) return file + ': no design findings. The check looks for gradients, rounded corners, centered text, hard-coded colors, shadows, typefaces, utility overrides, nested cards and extra accents. Review rhythm, alignment and hierarchy yourself against the design guide.'
  return findings.map(item => file + ':' + item.line + '  ' + item.rule + '  ' + item.message + ' ' + item.fix + (item.excerpt ? '\n    ' + item.excerpt : '')).join('\n')
}
