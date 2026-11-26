import type { SwissLocale } from './locales.js'

const romansh = ['schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust', 'settember', 'october', 'november', 'december']

/** Month names in the nominative form used on their own, January first. */
export function calendarMonthNames(locale: SwissLocale): string[] {
  if (locale === 'rm-CH') return romansh
  const fmt = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC', calendar: 'gregory' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(Date.UTC(2024, i, 1))))
}

/** The selectable years: the bounds when they are close, otherwise a century back and twenty years ahead of today. */
export function calendarYears(shown: number, min: string, max: string, today: string): number[] {
  const current = Number(today.slice(0, 4))
  const first = Math.min(shown, Math.max(Number(min.slice(0, 4)), current - 100))
  const last = Math.max(shown, Math.min(Number(max.slice(0, 4)), current + 20))
  return Array.from({ length: last - first + 1 }, (_, i) => last - i)
}
