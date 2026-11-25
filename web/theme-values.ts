export const defaultTheme = { accent: '#eb0000', unit: 4, mode: 'light' }

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(index => {
    const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return r * 0.2126 + g * 0.7152 + b * 0.0722
}

export function contrast(a: string, b: string) {
  const first = luminance(a), second = luminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

export function themeValues({ accent, unit, mode }: typeof defaultTheme) {
  const bg = mode === 'dark' ? '#000000' : '#ffffff'
  const ink = mode === 'dark' ? '#ffffff' : '#000000'
  // Prefer the existing white label whenever it passes WCAG AA.
  const label = contrast(accent, '#ffffff') >= 4.5 ? '#ffffff' : '#000000'
  const values = {
    '--al-bg': bg, '--al-surface': bg, '--al-ink': ink,
    '--al-accent': accent, '--al-on-accent': label,
    '--al-accent-hover': label === '#ffffff' ? '#000000' : '#ffffff',
    '--al-unit': unit / 16 + 'rem',
  }
  const selector = mode === 'dark' ? '[data-al-theme="dark"]' : ':root:not([data-al-theme="dark"]), [data-al-theme="light"]'
  const rules = Object.entries(values).map(([key, value]) => '    ' + key + ': ' + value + ';')
  const css = ['@media (forced-colors: none) {', '  ' + selector + ' {', ...rules, '  }', '}'].join('\n')
  return { values, css, button: contrast(label, accent), text: contrast(accent, bg) }
}
