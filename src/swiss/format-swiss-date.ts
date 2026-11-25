import { defaultSwissLocale, swissLocalePreferences, type SwissLocale } from './locales.js'

export interface SwissDateOptions {
  dateStyle?: 'short' | 'medium' | 'long' | 'full' | undefined
  /** For Date instances. Civil dates are independent of time zones. */
  timeZone?: string | undefined
}

type DateStyle = NonNullable<SwissDateOptions['dateStyle']>
type DateFormatter = (value: Date) => string
const formatters = new Map<string, DateFormatter>()
const maxCachedFormatters = 32

// CLDR 48, Gregorian format context. Unicode-3.0, see UNICODE-LICENSE.txt.
const romanshMonths = [
  'da schaner',
  'da favrer',
  'da mars',
  'd’avrigl',
  'da matg',
  'da zercladur',
  'da fanadur',
  'd’avust',
  'da settember',
  'd’october',
  'da november',
  'da december',
]
const romanshWeekdays = ['dumengia', 'glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda']

function romanshDateFormatter(dateStyle: DateStyle, timeZone: string): DateFormatter {
  // Request only numeric date fields. This works with a reduced ICU locale set
  // while still using the runtime's time-zone database, including historical DST.
  const numeric = new Intl.DateTimeFormat('en', {
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return (date) => {
    const parts = numeric.formatToParts(date)
    const day = parts.find((part) => part.type === 'day')!.value
    const month = parts.find((part) => part.type === 'month')!.value
    const year = parts.find((part) => part.type === 'year')!.value
    if (dateStyle === 'medium') return day + '-' + month + '-' + year
    const long = Number(day) + ' ' + romanshMonths[Number(month) - 1] + ' ' + year
    if (dateStyle === 'long') return long
    if (dateStyle !== 'full') throw new RangeError('Invalid date style')
    // A zone shift can cross one midnight in either direction. Account for the
    // end of the month when mapping the UTC weekday to the local civil weekday.
    let dayShift = Number(day) - date.getUTCDate()
    if (dayShift > 1) dayShift = -1
    else if (dayShift < -1) dayShift = 1
    const weekday = (date.getUTCDay() + dayShift + 7) % 7
    return romanshWeekdays[weekday] + ', ils ' + long
  }
}

export function parseCivilDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) {
    throw new RangeError('Expected a Gregorian date in YYYY-MM-DD format')
  }
  const date = new Date(value + 'T00:00:00.000Z')
  // Date.parse normalizes dates such as 2025-02-30 in several engines.
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RangeError('Invalid Gregorian date')
  }
  return date
}

/** A string is a civil date. A Date represents an instant in time. */
export function formatSwissDate(
  value: string | Date,
  locale: SwissLocale = defaultSwissLocale,
  { dateStyle = 'short', timeZone = 'Europe/Zurich' }: SwissDateOptions = {},
): string {
  const civilDate = typeof value === 'string'
  const date = civilDate ? parseCivilDate(value) : value
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date')
  const zone = civilDate ? 'UTC' : timeZone
  const key = [locale, dateStyle, zone].join('/')
  let formatter = formatters.get(key)
  if (!formatter) {
    const needsRomansh =
      locale === 'rm-CH' &&
      !Intl.DateTimeFormat.supportedLocalesOf(locale, { localeMatcher: 'lookup' }).length
    if (dateStyle === 'short') {
      const numeric = new Intl.DateTimeFormat('de-CH', {
        calendar: 'gregory', numberingSystem: 'latn', timeZone: zone, day: '2-digit', month: '2-digit', year: 'numeric',
      })
      formatter = instant => {
        const parts = numeric.formatToParts(instant)
        const field = (name: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === name)!.value
        return field('day') + '.' + field('month') + '.' + field('year').padStart(4, '0')
      }
    } else formatter = needsRomansh
      ? romanshDateFormatter(dateStyle, zone)
      : new Intl.DateTimeFormat(swissLocalePreferences(locale), {
          dateStyle,
          timeZone: zone,
          calendar: 'gregory',
        }).format
    if (formatters.size >= maxCachedFormatters) formatters.clear()
    formatters.set(key, formatter)
  }
  return formatter(date)
}

/** Display a local 24-hour clock time, including midnight as 00:00. */
export function formatSwissTime(instant: Date, timeZone = 'Europe/Zurich'): string {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone, numberingSystem: 'latn', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(instant)
}
