import { parseCivilDate } from '../swiss/format-swiss-date.js'

export type AccountingValue = string | number | bigint

function checkDigits(digits: number) {
  if (!Number.isInteger(digits) || digits < 0 || digits > 20) throw new RangeError('Fraction digits must be between 0 and 20.')
}

/** Interpret the numeric source once, rounding half away from zero to the column precision. */
export function minorUnits(value: AccountingValue, digits: number): bigint {
  checkDigits(digits)
  let text = String(value).trim().replaceAll('−', '-')
  const accounting = text.startsWith('(') && text.endsWith(')')
  if (accounting) text = text.slice(1, -1).trim()
  text = text.replace(/^CHF\s*|\s*CHF$/u, '').trim()
  // Swiss group separators are apostrophes or spaces. A full stop or comma introduces decimals.
  const match = /^([+-]?)(\d{1,3}(?:['’\u202f\u00a0 ]\d{3})+|\d+)(?:[.,](\d+))?(?:[eE]([+-]?\d{1,3}))?$/.exec(text)
  if (!match || (accounting && match[1])) throw new RangeError('Expected a Swiss decimal amount.')
  const fraction = match[3] ?? ''
  const coefficient = BigInt(match[2].replace(/\D/g, '') + fraction)
  const shift = digits + Number(match[4] ?? 0) - fraction.length
  const scale = 10n ** BigInt(Math.abs(shift))
  const minor = shift >= 0 ? coefficient * scale : (2n * coefficient + scale) / (2n * scale)
  return accounting || match[1] === '-' ? -minor : minor
}

export function decimalFromMinor(minor: bigint, digits: number): string {
  checkDigits(digits)
  const absolute = (minor < 0n ? -minor : minor).toString().padStart(digits + 1, '0')
  return (minor < 0n ? '-' : '') + (digits ? absolute.slice(0, -digits) + '.' + absolute.slice(-digits) : absolute)
}

export function accountingDate(value: string): string {
  const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value)
  const iso = dotted ? dotted[3] + '-' + dotted[2].padStart(2, '0') + '-' + dotted[1].padStart(2, '0') : value
  parseCivilDate(iso)
  return iso
}
