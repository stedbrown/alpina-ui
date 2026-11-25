import { addDays, mondayIndex } from './calendar-dates.js'
import { parseCivilDate } from './format-swiss-date.js'
import { defaultSwissLocale, swissLocales, type SwissLocale } from './locales.js'
import type { CantonCode } from './cantons.js'

// Geographic profiles and statutory sources are recorded in docs/swiss.md.
const names = {
  newYear: ['Neujahr', 'Nouvel An', 'Capodanno', 'Bumaun'],
  berchtold: ['Berchtoldstag', 'Lendemain du Nouvel An', 'Secondo Capodanno', 'Di suenter Bumaun'],
  epiphany: ['Dreikönigstag', 'Épiphanie', 'Epifania', 'Bavania'],
  republicNE: ['Tag der Republik Neuenburg', 'Instauration de la République', 'Festa della Repubblica di Neuchâtel', 'Festa da la republica da Neuchâtel'],
  joseph: ['Josefstag', 'Saint-Joseph', 'San Giuseppe', 'Son Giusep'],
  benedict: ['Benediktstag', 'Saint-Benoît', 'San Benedetto', 'Son Benedetg'],
  goodFriday: ['Karfreitag', 'Vendredi saint', 'Venerdì santo', 'Venderdi sontg'],
  easter: ['Ostersonntag', 'Pâques', 'Pasqua', 'Pasca'],
  easterMonday: ['Ostermontag', 'Lundi de Pâques', 'Lunedì di Pasqua', 'Glindesdi da Pasca'],
  naefels: ['Näfelser Fahrt', 'Commémoration de Näfels', 'Commemorazione di Näfels', 'Festa da Näfels'],
  labour: ['Tag der Arbeit', 'Fête du travail', 'Festa del lavoro', 'Di da la lavur'],
  ascension: ['Auffahrt', 'Ascension', 'Ascensione', 'Ascensiun'],
  pentecost: ['Pfingstsonntag', 'Pentecôte', 'Pentecoste', 'Tschuncaisma'],
  whitMonday: ['Pfingstmontag', 'Lundi de Pentecôte', 'Lunedì di Pentecoste', 'Glindesdi da Tschuncaisma'],
  corpus: ['Fronleichnam', 'Fête-Dieu', 'Corpus Domini', 'Sontgilcrest'],
  jura: ['Gedenktag der jurassischen Volksabstimmung', 'Commémoration du plébiscite jurassien', 'Commemorazione del plebiscito giurassiano', 'Festa dal Giura'],
  peterPaul: ['Peter und Paul', 'Saint-Pierre et Saint-Paul', 'Santi Pietro e Paolo', 'Son Peder e Son Paul'],
  national: ['Bundesfeiertag', 'Fête nationale', 'Festa nazionale', 'Festa naziunala'],
  assumption: ['Mariä Himmelfahrt', 'Assomption', 'Assunzione', 'Assumziun da Maria'],
  genevaFast: ['Genfer Bettag', 'Jeûne genevois', 'Digiuno ginevrino', 'Rogaziun genevrina'],
  federalFast: ['Eidgenössischer Bettag', 'Jeûne fédéral', 'Digiuno federale', 'Rogaziun federala'],
  fastMonday: ['Bettagsmontag', 'Lundi du Jeûne', 'Lunedì del Digiuno federale', 'Glindesdi da la rogaziun federala'],
  maurice: ['Mauritiustag', 'Saint-Maurice', 'San Maurizio', 'Son Murezi'],
  bruderKlaus: ['Bruderklausenfest', 'Saint Nicolas de Flüe', 'San Nicolao della Flüe', 'Son Clau da Flia'],
  allSaints: ['Allerheiligen', 'Toussaint', 'Ognissanti', 'Numnasontga'],
  immaculate: ['Mariä Empfängnis', 'Immaculée Conception', 'Immacolata Concezione', 'Immaculada Concepziun'],
  christmas: ['Weihnachten', 'Noël', 'Natale', 'Nadal'],
  stephen: ['Stephanstag', 'Saint-Étienne', 'Santo Stefano', 'Son Steffan'],
  restoration: ['Wiederherstellung der Republik Genf', 'Restauration de la République', 'Restaurazione della Repubblica di Ginevra', 'Restauraziun da la republica da Genevra'],
} as const

export type SwissHolidayId = keyof typeof names
export interface SwissHoliday {
  id: SwissHolidayId
  date: string
  name: string
  scope: 'federal' | 'cantonal' | 'regional' | 'sunday' | 'customary'
  duration: 'day' | 'afternoon'
}

const commonEastern = ['goodFriday', 'easterMonday', 'whitMonday', 'stephen'] as const
const alpine = ['goodFriday', 'corpus', 'assumption', 'allSaints', 'immaculate'] as const
const catholic = ['corpus', 'assumption', 'allSaints', 'immaculate'] as const
const schedules: Record<CantonCode, readonly SwissHolidayId[]> = {
  AG: ['goodFriday'],
  AI: [...commonEastern, ...catholic],
  AR: commonEastern,
  BE: [...commonEastern, 'berchtold'],
  BL: [...commonEastern, 'labour'],
  BS: [...commonEastern, 'labour'],
  FR: ['goodFriday'],
  GE: ['goodFriday', 'easterMonday', 'whitMonday', 'genevaFast', 'restoration'],
  GL: [...commonEastern, 'naefels', 'allSaints'],
  GR: commonEastern,
  JU: ['berchtold', 'goodFriday', 'easterMonday', 'labour', 'whitMonday', 'corpus', 'jura', 'assumption', 'allSaints'],
  LU: [...alpine, 'stephen'],
  NE: ['berchtold', 'republicNE', 'goodFriday', 'labour', 'stephen'],
  NW: [...alpine, 'joseph'],
  OW: [...alpine, 'bruderKlaus'],
  SG: [...commonEastern, 'allSaints'],
  SH: [...commonEastern, 'labour'],
  SO: ['goodFriday', 'labour'],
  SZ: [...commonEastern, ...catholic, 'epiphany', 'joseph'],
  TG: [...commonEastern, 'berchtold', 'labour'],
  TI: ['epiphany', 'joseph', 'easterMonday', 'labour', 'whitMonday', 'peterPaul', ...catholic, 'stephen'],
  UR: [...commonEastern, ...catholic, 'epiphany', 'joseph'],
  VD: ['berchtold', 'goodFriday', 'easterMonday', 'whitMonday', 'fastMonday'],
  VS: ['joseph', ...catholic],
  ZG: alpine,
  ZH: [...commonEastern, 'labour'],
}

const regions = {
  'AG-aarau': ['berchtold', 'easterMonday', 'whitMonday', 'stephen'],
  'AG-baden': ['easterMonday', 'whitMonday', 'corpus', 'stephen'],
  'AG-bremgarten': ['corpus', 'assumption', 'allSaints', 'stephen'],
  'AG-laufenburg': catholic,
  'AG-rheinfelden': ['easterMonday', 'whitMonday', 'allSaints', 'stephen'],
  'AG-zurzach': ['berchtold', 'corpus', 'allSaints', 'stephen'],
  'AI-inner': ['maurice'],
  'FR-catholic': catholic,
  'FR-reformed': ['berchtold', 'easterMonday', 'whitMonday', 'stephen'],
  'NE-le-landeron': ['corpus'],
  'OW-engelberg': ['benedict'],
  'SO-outside-bucheggberg': ['corpus', 'assumption', 'allSaints'],
} as const satisfies Record<string, readonly SwissHolidayId[]>

// Full-day, recurring office closures with documented cantonal evidence. See docs/swiss.md.
const officeDays = ['berchtold', 'easterMonday', 'whitMonday', 'stephen'] as const
const customary: Partial<Record<CantonCode, readonly SwissHolidayId[]>> = {
  AG: officeDays, FR: officeDays, LU: officeDays, NW: officeDays, OW: officeDays, SO: officeDays, ZG: officeDays,
  NE: ['easterMonday', 'whitMonday', 'fastMonday'],
  VS: ['goodFriday', 'easterMonday', 'whitMonday', 'stephen'],
  ZH: ['berchtold'],
}

export type SwissHolidayObservance = 'statutory' | 'common'
export type SwissHolidayRegion = keyof typeof regions
export interface SwissHolidayOptions {
  locale?: SwissLocale
  region?: SwissHolidayRegion
  observance?: SwissHolidayObservance
}

/** Western Easter in the Gregorian calendar (Meeus/Jones/Butcher computus). */
function easterSunday(year: number): string {
  const cycle = year % 19
  const century = Math.floor(year / 100)
  const withinCentury = year % 100
  const lunarCorrection = Math.floor((century - Math.floor((century + 8) / 25) + 1) / 3)
  const epact = (19 * cycle + century - Math.floor(century / 4) - lunarCorrection + 15) % 30
  const weekday = (32 + 2 * (century % 4) + 2 * Math.floor(withinCentury / 4) - epact - withinCentury % 4) % 7
  const adjustment = Math.floor((cycle + 11 * epact + 22 * weekday) / 451)
  const encoded = epact + weekday - 7 * adjustment + 114
  const month = Math.floor(encoded / 31)
  return String(year).padStart(4, '0') + '-0' + month + '-' + String(encoded % 31 + 1).padStart(2, '0')
}

function holidayDates(year: number): Record<SwissHolidayId, string> {
  const prefix = String(year).padStart(4, '0') + '-'
  const easter = easterSunday(year)
  const april = prefix + '04-01'
  const firstThursday = addDays(april, (10 - mondayIndex(april)) % 7)
  const september = prefix + '09-01'
  const firstSunday = addDays(september, 6 - mondayIndex(september))
  return {
    newYear: prefix + '01-01', berchtold: prefix + '01-02', epiphany: prefix + '01-06',
    republicNE: prefix + '03-01', joseph: prefix + '03-19', benedict: prefix + '03-21',
    goodFriday: addDays(easter, -2), easter, easterMonday: addDays(easter, 1),
    naefels: firstThursday === addDays(easter, -3) ? addDays(firstThursday, 7) : firstThursday,
    labour: prefix + '05-01', ascension: addDays(easter, 39), pentecost: addDays(easter, 49),
    whitMonday: addDays(easter, 50), corpus: addDays(easter, 60), jura: prefix + '06-23',
    peterPaul: prefix + '06-29', national: prefix + '08-01', assumption: prefix + '08-15',
    genevaFast: addDays(firstSunday, 4), federalFast: addDays(firstSunday, 14),
    fastMonday: addDays(firstSunday, 15), maurice: prefix + '09-22', bruderKlaus: prefix + '09-25',
    allSaints: prefix + '11-01', immaculate: prefix + '12-08', christmas: prefix + '12-25',
    stephen: prefix + '12-26', restoration: prefix + '12-31',
  }
}

/** Current rules projected onto a Gregorian year. Only canton-wide dates apply without a region. */
export function swissHolidays(year: number, canton: CantonCode, { locale = defaultSwissLocale, region, observance = 'statutory' }: SwissHolidayOptions = {}): SwissHoliday[] {
  if (!Number.isInteger(year) || year < 1 || year > 9999) throw new RangeError('Expected a year from 1 to 9999')
  if (!Object.hasOwn(schedules, canton)) throw new RangeError('Unknown Swiss canton')
  if (region !== undefined && (!Object.hasOwn(regions, region) || !region.startsWith(canton + '-'))) {
    throw new RangeError('Holiday region must belong to the selected canton')
  }
  if (observance !== 'statutory' && observance !== 'common') throw new RangeError('Unknown holiday observance')
  const language = swissLocales.indexOf(locale)
  if (language < 0) throw new RangeError('Unknown Swiss locale')
  const dates = holidayDates(year)
  const holidays: SwissHoliday[] = []
  function include(id: SwissHolidayId, scope: SwissHoliday['scope']) {
    const date = dates[id]
    holidays.push({ id, date, name: names[id][language]!, scope, duration: id === 'labour' && canton === 'SO' ? 'afternoon' : 'day' })
  }
  include('national', 'federal')
  for (const id of ['newYear', 'ascension', 'christmas'] as const) include(id, 'cantonal')
  for (const id of ['easter', 'pentecost'] as const) include(id, 'sunday')
  if (canton !== 'GE') include('federalFast', 'sunday')
  for (const id of schedules[canton]) {
    if (canton === 'NE' && (id === 'berchtold' || id === 'stephen') && mondayIndex(dates[id]) !== 0) continue
    if ((canton === 'AR' || canton === 'AI') && id === 'stephen' && [0, 4].includes(mondayIndex(dates.christmas))) continue
    include(id, 'cantonal')
  }
  if (region) for (const id of regions[region]) include(id, 'regional')
  if (observance === 'common') {
    for (const id of customary[canton] ?? []) {
      if (!holidays.some(holiday => holiday.id === id)) include(id, 'customary')
    }
  }
  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}

/** Counts Monday to Friday, excluding whole-day public holidays. A zero offset preserves the input. */
export function addBusinessDays(start: string, amount: number, canton: CantonCode, options: SwissHolidayOptions = {}): string {
  const date = parseCivilDate(start)
  if (!Number.isSafeInteger(amount) || Math.abs(amount) > 3652059) throw new RangeError('Invalid business-day offset')
  const step = Math.sign(amount)
  let remaining = Math.abs(amount)
  let year = date.getUTCFullYear()
  const closures = (year: number) => new Set(swissHolidays(year, canton, options).filter(h => h.duration === 'day').map(h => h.date))
  let closed = closures(year)
  let day = start
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + step)
    if (date.getUTCFullYear() !== year) {
      year = date.getUTCFullYear()
      closed = closures(year)
    }
    day = date.toISOString().slice(0, 10)
    const weekday = date.getUTCDay()
    if (weekday !== 0 && weekday !== 6 && !closed.has(day)) remaining--
  }
  return day
}
