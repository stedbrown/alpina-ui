import { defaultSwissLocale, swissLocalePreferences, type SwissLocale } from './locales.js'

export interface SwissCurrencyOptions {
  /** Round the displayed total to the nearest five centimes. Ties go away from zero. */
  cashRounding?: boolean
}

const formatters = new Map<SwissLocale, Intl.NumberFormat>()

// Use the number's decimal representation so 1.025 and its negative round symmetrically.
// Keeping the quotient in BigInt also preserves large amounts and exponent notation.
function cashCentimes(amount: number): bigint {
  const [coefficient, exponent = '0'] = Math.abs(amount).toString().split('e')
  const [integer, fraction = ''] = coefficient.split('.')
  const shift = Number(exponent) - fraction.length + 2
  const numerator = BigInt(integer + fraction) * 10n ** BigInt(Math.max(shift, 0))
  const denominator = 5n * 10n ** BigInt(Math.max(-shift, 0))
  return ((2n * numerator + denominator) / (2n * denominator)) * 5n
}

/** Format francs with Swiss digit grouping and two decimal places. */
export function formatCHF(
  amount: number | bigint,
  locale: SwissLocale = defaultSwissLocale,
  { cashRounding = false }: SwissCurrencyOptions = {},
): string {
  if (typeof amount !== 'bigint' && !Number.isFinite(amount)) throw new RangeError('Expected a finite amount in CHF')
  const romanshFallback = locale === 'rm-CH' && !Intl.NumberFormat.supportedLocalesOf(locale, { localeMatcher: 'lookup' }).length
  let formatter = formatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(romanshFallback ? 'en' : swissLocalePreferences(locale), {
      numberingSystem: 'latn', style: romanshFallback ? 'decimal' : 'currency',
      currency: 'CHF', currencyDisplay: 'code', useGrouping: true,
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    })
    formatters.set(locale, formatter)
  }
  const negative = amount < 0 || Object.is(amount, -0)
  const rounded = cashRounding && typeof amount === 'number' ? cashCentimes(amount) : undefined
  let value = amount
  if (rounded !== undefined) {
    const francs = rounded / 100n
    value = negative ? francs === 0n ? -0 : -francs : francs
  }
  const group = locale === 'fr-CH' || locale === 'rm-CH' ? '\u202f' : '’'
  const parts = formatter.formatToParts(value)
  const number = parts.map(part => {
    if (part.type === 'group') return group
    if (part.type === 'fraction' && rounded !== undefined) return String(rounded % 100n).padStart(2, '0')
    if (romanshFallback && part.type === 'decimal') return ','
    if (romanshFallback && part.type === 'minusSign') return ''
    return part.value
  }).join('')
  // CLDR 48 common/main/rm.xml. Unicode-3.0, see UNICODE-LICENSE.txt.
  return romanshFallback ? (negative ? '-' : '') + 'CHF\u00a0' + number : number
}
