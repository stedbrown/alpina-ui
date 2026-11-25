import { parseCivilDate } from './format-swiss-date.js'
import type { SwissLocale } from './locales.js'

export const firstCivilDay = '0001-01-01'
export const lastCivilDay = '9999-12-31'

function iso(date: Date): string {
  if (date.getUTCFullYear() < 1) return firstCivilDay
  if (date.getUTCFullYear() > 9999) return lastCivilDay
  return date.toISOString().slice(0, 10)
}

export function clampDay(day: string, min: string, max: string): string {
  return day < min ? min : day > max ? max : day
}

export function addDays(day: string, delta: number): string {
  const date = parseCivilDate(day)
  date.setUTCDate(date.getUTCDate() + delta)
  return iso(date)
}

export function monthLength(day: string): number {
  const date = parseCivilDate(day)
  date.setUTCMonth(date.getUTCMonth() + 1, 0)
  return date.getUTCDate()
}

export function addMonths(day: string, delta: number): string {
  const date = parseCivilDate(day)
  const wanted = date.getUTCDate()
  date.setUTCMonth(date.getUTCMonth() + delta, 1)
  if (date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return iso(date)
  date.setUTCDate(Math.min(monthLength(iso(date)), wanted))
  return iso(date)
}

export function mondayIndex(day: string): number {
  return (parseCivilDate(day).getUTCDay() + 6) % 7
}

/** ISO 8601 assigns a week to the year containing its Thursday. */
export function isoWeek(day: string): { year: number; week: number } {
  const thursday = parseCivilDate(day)
  thursday.setUTCDate(thursday.getUTCDate() + 3 - (thursday.getUTCDay() + 6) % 7)
  const start = new Date(thursday)
  start.setUTCMonth(0, 1)
  return { year: thursday.getUTCFullYear(), week: 1 + Math.floor((thursday.getTime() - start.getTime()) / 604800000) }
}

export const calendarWeekNames = {
  'de-CH': ['KW', 'Kalenderwoche'], 'fr-CH': ['Sem.', 'Semaine'],
  'it-CH': ['Sett.', 'Settimana'], 'rm-CH': ['Emna', 'Emna'],
} as const

export function zurichToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now)
  return ['year', 'month', 'day'].map((key) => parts.find((part) => part.type === key)!.value).join('-')
}

const months = ['schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust', 'settember', 'october', 'november', 'december']
const weekdays = ['glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda', 'dumengia']
const compact = ['gli', 'ma', 'me', 'gie', 've', 'so', 'du']

export function calendarLabels(day: string, locale: SwissLocale) {
  const date = parseCivilDate(day)
  if (locale === 'rm-CH') return {
    month: months[date.getUTCMonth()] + ' ' + date.getUTCFullYear(),
    days: weekdays.map((full, i) => ({ full, short: compact[i]! })),
  }
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC', calendar: 'gregory' })
  const full = fmt({ weekday: 'long' })
  const short = fmt({ weekday: 'short' })
  return {
    month: fmt({ year: 'numeric', month: 'long' }).format(date),
    days: Array.from({ length: 7 }, (_, i) => {
      const mondayWeek = new Date(Date.UTC(2024, 0, 1 + i))
      return { full: full.format(mondayWeek), short: short.format(mondayWeek) }
    }),
  }
}

export const calendarText = {
  'it-CH': { prev: 'Mese precedente', next: 'Mese successivo', choose: 'Scegli una data', close: 'Chiudi', clear: 'Cancella la data' },
  'de-CH': { prev: 'Vorheriger Monat', next: 'Nächster Monat', choose: 'Datum wählen', close: 'Schliessen', clear: 'Datum entfernen' },
  'fr-CH': { prev: 'Mois précédent', next: 'Mois suivant', choose: 'Choisir une date', close: 'Fermer', clear: 'Effacer la date' },
  'rm-CH': { prev: 'Mais precedent', next: 'Mais suandant', choose: 'Tscherner ina data', close: 'Serrar', clear: 'Stizzar la data' },
} as const
