export const swissLocales = ['de-CH', 'fr-CH', 'it-CH', 'rm-CH'] as const
export type SwissLocale = (typeof swissLocales)[number]
export type SwissMessageLocale = SwissLocale | 'en'

export const localeNames: Readonly<Record<SwissLocale, string>> = {
  'de-CH': 'Deutsch',
  'fr-CH': 'Français',
  'it-CH': 'Italiano',
  'rm-CH': 'Rumantsch',
}

export const defaultSwissLocale: SwissLocale = 'it-CH'

// Some runtimes ship a reduced ICU data set. Prefer another Swiss
// locale in that case before allowing Intl to choose its runtime default.
export function swissLocalePreferences(locale: SwissLocale): SwissLocale[] {
  return [locale, ...swissLocales.filter((other) => other !== locale)]
}
