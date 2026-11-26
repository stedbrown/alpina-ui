export const darkAccent = '#ff5252'
export const defaultTheme = { accent: '#eb0000', dark: darkAccent, unit: 4 }
export type Theme = typeof defaultTheme

/** Starting points that pass WCAG AA as text on white (light) and on black (dark). */
export const presets = [
  { name: 'Alpina red', accent: '#eb0000', dark: darkAccent },
  { name: 'Lake blue', accent: '#0057b8', dark: '#6aa9ff' },
  { name: 'Pine green', accent: '#00703c', dark: '#3ecf82' },
  { name: 'Violet', accent: '#6b3fc4', dark: '#b59cff' },
  { name: 'Graphite', accent: '#3d3d3d', dark: '#c4c4c4' },
] as const

export const hexColor = /^#[a-f0-9]{6}$/i

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

/** A dark-mode partner for a custom accent: the accent itself when it reads on black, otherwise the first lighter tint that does. */
export function suggestDark(accent: string) {
  const preset = presets.find(item => item.accent === accent)
  if (preset) return preset.dark
  const channels = [1, 3, 5].map(index => Number.parseInt(accent.slice(index, index + 2), 16))
  for (let step = 0; step <= 100; step++) {
    const tint = '#' + channels.map(value => Math.round(value + (255 - value) * step / 100).toString(16).padStart(2, '0')).join('')
    if (contrast(tint, '#000000') >= 4.5) return tint
  }
  return '#ffffff'
}

export function palette(accent: string, unit: number, scheme: 'light' | 'dark') {
  const bg = scheme === 'dark' ? '#000000' : '#ffffff'
  const ink = scheme === 'dark' ? '#ffffff' : '#000000'
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

function block(media: string, selector: string, values: Record<string, string>) {
  const rules = Object.entries(values).map(([key, value]) => '    ' + key + ': ' + value + ';')
  return ['@media ' + media + ' {', '  ' + selector + ' {', ...rules, '  }', '}'].join('\n')
}

/** Both palettes and the CSS that applies them to light, dark and device-following containers. */
export function themeValues({ accent, dark, unit }: Theme) {
  const light = palette(accent, unit, 'light')
  const night = palette(dark, unit, 'dark')
  const css = [
    block('(forced-colors: none)', ':root:not([data-al-theme]), [data-al-theme="light"]', light.values),
    block('(forced-colors: none)', '[data-al-theme="dark"]', night.values),
    block('(forced-colors: none) and (prefers-color-scheme: light)', '[data-al-theme="auto"]', light.values),
    block('(forced-colors: none) and (prefers-color-scheme: dark)', '[data-al-theme="auto"]', night.values),
  ].join('\n')
  return { light, dark: night, css }
}

/** Read a shared theme from the page address. Unknown or malformed values keep the defaults. */
export function themeFromSearch(search: string): Theme {
  const params = new URLSearchParams(search)
  const color = (name: string) => {
    const value = '#' + (params.get(name) ?? '').toLowerCase()
    return hexColor.test(value) ? value : undefined
  }
  const accent = color('accent') ?? defaultTheme.accent
  const unit = Number(params.get('unit'))
  return { accent, dark: color('dark') ?? suggestDark(accent), unit: [3, 4, 5, 6].includes(unit) ? unit : defaultTheme.unit }
}

/** The address for a theme, without the values that match the defaults. */
export function themeSearch(theme: Theme) {
  const params = new URLSearchParams()
  if (theme.accent !== defaultTheme.accent) params.set('accent', theme.accent.slice(1))
  if (theme.dark !== suggestDark(theme.accent)) params.set('dark', theme.dark.slice(1))
  if (theme.unit !== defaultTheme.unit) params.set('unit', String(theme.unit))
  const query = params.toString()
  return query ? '?' + query : ''
}
