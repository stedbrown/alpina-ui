import { formatCentimes as formatExactCentimes } from './format-centimes.internal.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'

/** Format an integer amount in centimes as CHF, retaining every minor unit. */
export function formatCentimes(cents: number | bigint, locale: SwissLocale = defaultSwissLocale): string {
  if (typeof cents !== 'bigint' && !Number.isSafeInteger(cents)) {
    throw new RangeError('Pass a safe integer or a bigint number of centimes.')
  }
  return formatExactCentimes(BigInt(cents), locale)
}
