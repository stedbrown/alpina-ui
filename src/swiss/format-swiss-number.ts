import { defaultSwissLocale, type SwissLocale } from './locales.js'

export interface SwissNumberOptions {
  /** Pad the fractional part. Additional significant digits are retained. */
  minimumFractionDigits?: number
}

/** Format a decimal quantity without losing precision in decimal strings or BigInt inputs. */
export function formatSwissNumber(
  value: number | bigint | string,
  locale: SwissLocale | 'en' = defaultSwissLocale,
  { minimumFractionDigits = 0 }: SwissNumberOptions = {},
): string {
  if (!Number.isInteger(minimumFractionDigits) || minimumFractionDigits < 0 || minimumFractionDigits > 100)
    throw new RangeError('minimumFractionDigits must be an integer between 0 and 100.')
  const raw = Object.is(value, -0) ? '-0' : String(value)
  const parts = /^([+-]?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(raw)
  if (!parts || (parts[4] !== undefined && typeof value !== 'number')) throw new RangeError('Expected a finite decimal quantity.')
  const digits = parts[2] + (parts[3] ?? '')
  const point = parts[2].length + Number(parts[4] ?? 0)
  const split = Math.max(0, point)
  const whole = digits.slice(0, split).padEnd(split, '0').replace(/^0+(?=\d)/, '') || '0'
  const fractionalDigits = '0'.repeat(Math.max(0, -point)) + digits.slice(split)
  const fraction = fractionalDigits.replace(/0+$/, '').padEnd(minimumFractionDigits, '0')
  // CLDR 48 rm.xml uses a comma decimal and a narrow no-break space for grouping.
  const spaced = locale === 'rm-CH' || locale === 'fr-CH'
  const firstGroup = whole.length % 3 || 3
  const groups = [whole.slice(0, firstGroup)]
  for (let i = firstGroup; i < whole.length; i += 3) groups.push(whole.slice(i, i + 3))
  const grouped = groups.join(spaced ? '\u202f' : '’')
  return (parts[1] === '-' ? '−' : '') + grouped + (fraction ? (spaced ? ',' : '.') + fraction : '')
}
