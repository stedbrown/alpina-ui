import { formatCHF } from './format-chf.js'
import type { SwissLocale } from './locales.js'

/** Preserve centimes even when the corresponding fractional number exceeds binary64 precision. */
export function formatCentimes(cents: bigint, locale: SwissLocale): string {
  const francs = cents / 100n
  const whole = formatCHF(cents < 0n && francs === 0n ? -0 : francs, locale)
  const fraction = (cents < 0n ? -cents % 100n : cents % 100n).toString().padStart(2, '0')
  return whole.replace(/([.,])00(?=(?:\u00a0CHF)?$)/, (_, separator) => separator + fraction)
}
