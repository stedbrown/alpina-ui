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

function palette(accent: string, unit: number, mode: string) {
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
  return { values, button: contrast(label, accent), text: contrast(accent, bg) }
}

export const darkAccent = '#ff5252'

export function themeValues({ accent, unit, mode }: typeof defaultTheme, systemDark = false, useDefaultAccent = false) {
  const automatic = mode === 'auto'
  function resolve(scheme: string) {
    return palette(useDefaultAccent ? (scheme === 'dark' ? darkAccent : defaultTheme.accent) : accent, unit, scheme)
  }
  const css = (automatic ? ['light', 'dark'] : [mode]).map(scheme => {
    const selector = automatic ? '[data-al-theme="auto"]' : scheme === 'dark'
      ? '[data-al-theme="dark"]' : ':root:not([data-al-theme]), [data-al-theme="light"]'
    const media = '(forced-colors: none)' + (automatic ? ' and (prefers-color-scheme: ' + scheme + ')' : '')
    const rules = Object.entries(resolve(scheme).values).map(([key, value]) => '    ' + key + ': ' + value + ';')
    return ['@media ' + media + ' {', '  ' + selector + ' {', ...rules, '  }', '}'].join('\n')
  }).join('\n')
  return { ...resolve(automatic ? (systemDark ? 'dark' : 'light') : mode), css }
}
