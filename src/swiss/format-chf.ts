import { defaultSwissLocale, swissLocalePreferences, type SwissLocale } from './locales.js'

type CurrencyFormatter = (value: number | bigint) => string
const formatters = new Map<SwissLocale, CurrencyFormatter>()

function currencyFormatter(locale: SwissLocale): CurrencyFormatter {
  if (
    locale === 'rm-CH' &&
    !Intl.NumberFormat.supportedLocalesOf(locale, { localeMatcher: 'lookup' }).length
  ) {
    // CLDR 48, common/main/rm.xml. Unicode-3.0, see UNICODE-LICENSE.txt.
    // Intl still performs decimal rounding and exact BigInt conversion.
    const numeric = new Intl.NumberFormat('en', {
      numberingSystem: 'latn',
      useGrouping: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return (amount) => {
      const parts = numeric.formatToParts(amount)
      const integer = parts.find((part) => part.type === 'integer')!.value
      const fraction = parts.find((part) => part.type === 'fraction')!.value
      const sign = parts.some((part) => part.type === 'minusSign') ? '-' : ''
      const groups = []
      for (let end = integer.length; end > 0; end -= 3) {
        groups.push(integer.slice(Math.max(0, end - 3), end))
      }
      return sign + 'CHF\u00a0' + groups.reverse().join('\u202f') + ',' + fraction
    }
  }
  return new Intl.NumberFormat(swissLocalePreferences(locale), {
    style: 'currency',
    currency: 'CHF',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format
}

/** Format an amount expressed in francs, using two decimal places. */
export function formatCHF(amount: number | bigint, locale: SwissLocale = defaultSwissLocale): string {
  if (typeof amount !== 'bigint' && !Number.isFinite(amount)) {
    throw new RangeError('Expected a finite amount in CHF')
  }
  let formatter = formatters.get(locale)
  if (!formatter) {
    formatter = currencyFormatter(locale)
    formatters.set(locale, formatter)
  }
  return formatter(amount)
}
