'use client'
import { useSwissLocale } from './locale-context.internal.js'

import { forwardRef, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '../ui/button.js'
import { Select } from '../ui/select.js'
import { useControllable } from '../interactive/controllable.js'
import { addDays, addMonths, calendarLabels, calendarText, calendarWeekNames, clampDay, firstCivilDay, isoWeek, lastCivilDay, mondayIndex, monthLength, zurichToday } from './calendar-dates.js'
import { calendarMonthNames, calendarYears } from './calendar-menus.internal.js'
import { formatSwissDate, parseCivilDate } from './format-swiss-date.js'
import { type SwissLocale } from './locales.js'
import type { CantonCode } from './cantons.js'
import { swissHolidays, type SwissHolidayRegion, type SwissHolidayObservance } from './holidays.js'
import './calendar.css'

export interface CalendarProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  defaultMonth?: string
  min?: string
  max?: string
  locale?: SwissLocale
  showWeekNumbers?: boolean
  /** Return true to keep a civil date visible to keyboard users while preventing selection. */
  isDateDisabled?: (date: string) => boolean
  /** A full or closed day cannot be booked. The status is included in its accessible name. */
  dayStatus?: (date: string) => 'available' | 'full' | 'closed' | undefined
  /** Prevent selection of all holidays in the configured canton, region and observance. */
  disableHolidays?: boolean
  /** Highlight official holidays for this canton. */
  canton?: CantonCode
  /** Apply the named local holiday schedule within the canton. */
  holidayRegion?: SwissHolidayRegion
  /** Add documented customary office closure days to the statutory schedule. */
  observance?: SwissHolidayObservance
  /** `dropdown` lets people jump to a month and year from two menus. `label` shows the month as text. */
  captionLayout?: 'dropdown' | 'label'
  className?: string
}

export const Calendar = forwardRef<HTMLElement, CalendarProps>(function Calendar(
  { value, defaultValue = '', onValueChange, defaultMonth, min = firstCivilDay, max = lastCivilDay, locale: requestedLocale,
    showWeekNumbers = false, isDateDisabled, dayStatus, disableHolidays = false, canton, holidayRegion, observance,
    captionLayout = 'dropdown', className = '' },
  ref,
) {
  const locale = useSwissLocale(requestedLocale)
  const [selection, select] = useControllable(value, defaultValue, onValueChange)
  const today = zurichToday()
  parseCivilDate(min)
  parseCivilDate(max)
  if (min > max) throw new RangeError('Calendar min must be on or before max')
  if (selection) parseCivilDate(selection)
  const [cursor, setCursor] = useState(() => {
    const initial = defaultMonth ? (defaultMonth.length === 7 ? defaultMonth + '-01' : defaultMonth) : selection || today
    parseCivilDate(initial)
    return clampDay(initial, min, max)
  })
  const previousSelection = useRef(selection)
  // External controlled updates navigate to the newly selected day.
  useEffect(() => {
    if (selection && previousSelection.current !== selection) setCursor(clampDay(selection, min, max))
    previousSelection.current = selection
  }, [selection, min, max])
  const current = clampDay(cursor, min, max)
  const month = current.slice(0, 7)
  const first = month + '-01'
  const labels = useMemo(() => calendarLabels(first, locale), [first, locale])
  const year = Number(month.slice(0, 4))
  const holidays = useMemo(() => canton ? swissHolidays(year, canton, { locale, region: holidayRegion, observance }) : [], [year, canton, locale, holidayRegion, observance])
  const monthHolidays = holidays.filter(holiday => holiday.date.startsWith(month))
  const id = useId()
  const grid = useRef<HTMLTableElement>(null)
  const pendingFocus = useRef(false)
  useEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current = false
      grid.current?.querySelector<HTMLButtonElement>('[data-day="' + current + '"]')?.focus()
    }
  }, [current])
  const start = mondayIndex(first)
  const count = monthLength(first)
  const rows = Math.ceil((start + count) / 7)
  const text = calendarText[locale]
  const [weekShort, weekLabel] = calendarWeekNames[locale]

  function navigate(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    if (event.altKey || event.metaKey || event.ctrlKey) return
    let next: string
    switch (event.key) {
      case 'ArrowLeft': next = addDays(day, -1); break
      case 'ArrowRight': next = addDays(day, 1); break
      case 'ArrowUp': next = addDays(day, -7); break
      case 'ArrowDown': next = addDays(day, 7); break
      case 'Home': next = addDays(day, -mondayIndex(day)); break
      case 'End': next = addDays(day, 6 - mondayIndex(day)); break
      case 'PageUp': next = addMonths(day, event.shiftKey ? -12 : -1); break
      case 'PageDown': next = addMonths(day, event.shiftKey ? 12 : 1); break
      default: return
    }
    event.preventDefault()
    const bounded = clampDay(next, min, max)
    if (bounded !== current) {
      pendingFocus.current = true
      setCursor(bounded)
    }
  }

  // Keep the day of the month when jumping, as PageUp and PageDown do, within the bounds.
  function jump(targetYear: number, targetMonth: number) {
    const target = String(targetYear).padStart(4, '0') + '-' + String(targetMonth).padStart(2, '0') + '-01'
    const day = clampDay(target.slice(0, 8) + String(Math.min(Number(current.slice(8)), monthLength(target))).padStart(2, '0'), min, max)
    setCursor(day)
  }
  const monthNames = useMemo(() => calendarMonthNames(locale), [locale])
  const years = useMemo(() => calendarYears(year, min, max, today), [year, min, max, today])
  const monthNumber = Number(month.slice(5))

  function moveMonth(offset: number) {
    const day = clampDay(addMonths(current, offset), min, max)
    const boundary = offset < 0 ? min : max
    if (day.slice(0, 7) === boundary.slice(0, 7)) pendingFocus.current = true
    setCursor(day)
  }

  return (
    <section ref={ref} className={('al-calendar ' + className).trim()} lang={locale} aria-labelledby={id}>
      <div className="al-calendar-head">
        <strong id={id} aria-live="polite" aria-atomic="true" className={captionLayout === 'dropdown' ? 'al-calendar-caption-hidden' : undefined}>{labels.month}</strong>
        {captionLayout === 'dropdown' && <span className="al-calendar-pickers">
          <Select className="al-calendar-select" aria-label={text.month} value={monthNumber}
            onChange={event => jump(year, Number(event.currentTarget.value))}>
            {monthNames.map((name, i) => { const value = String(year).padStart(4, '0') + '-' + String(i + 1).padStart(2, '0')
              return <option key={i} value={i + 1} disabled={value < min.slice(0, 7) || value > max.slice(0, 7)}>{name}</option> })}
          </Select>
          <Select className="al-calendar-select" aria-label={text.year} value={year}
            onChange={event => jump(Number(event.currentTarget.value), monthNumber)}>
            {years.map(option => <option key={option} value={option}>{option}</option>)}
          </Select>
        </span>}
        <Button size="sm" variant="ghost" aria-label={text.prev} disabled={month <= min.slice(0, 7)} onClick={() => moveMonth(-1)}>‹</Button>
        <Button size="sm" variant="ghost" aria-label={text.next} disabled={month >= max.slice(0, 7)} onClick={() => moveMonth(1)}>›</Button>
      </div>
      <table ref={grid} role="grid" aria-labelledby={id}>
        <thead><tr>{(showWeekNumbers ? [{ full: weekLabel, short: weekShort }, ...labels.days] : labels.days).map(({ full, short }) =>
          <th key={full} scope="col" aria-label={full}>
            <span className="al-calendar-short">{short}</span><span className="al-calendar-narrow">{short[0]}</span>
          </th>)}</tr></thead>
        <tbody>{Array.from({ length: rows }, (_, row) => (
          <tr key={row}>{showWeekNumbers && <th scope="row">{isoWeek(addDays(first, row * 7 - start)).week}</th>}{Array.from({ length: 7 }, (_, column) => {
            const n = row * 7 + column - start + 1
            if (n < 1 || n > count) return <td key={column} />
            const day = month + '-' + String(n).padStart(2, '0')
            const holidayNames = monthHolidays.filter(holiday => holiday.date === day)
              .map(holiday => holiday.name + (holiday.duration === 'afternoon' ? ' (' + text.afternoon + ')' : '')).join(', ')
            const excluded = (disableHolidays && !!holidayNames) || isDateDisabled?.(day)
            const status = excluded ? 'closed' : dayStatus?.(day)
            const unavailable = status === 'closed' || status === 'full'
            const statusLabel = status && text[status]
            return <td key={column} aria-selected={day === selection} data-weekend={column >= 5 || undefined}>
              <button type="button" data-day={day} data-holiday={holidayNames ? '' : undefined} tabIndex={day === current ? 0 : -1}
                data-status={status} aria-disabled={unavailable || undefined}
                title={[holidayNames, statusLabel].filter(Boolean).join(', ') || undefined}
                aria-label={[formatSwissDate(day, locale, { dateStyle: 'full' }), holidayNames, statusLabel].filter(Boolean).join(', ')}
                aria-current={day === today ? 'date' : undefined}
                disabled={day < min || day > max}
                onKeyDown={(event) => navigate(event, day)}
                onClick={() => {
                  if (unavailable) return
                  setCursor(day)
                  if (day === selection) onValueChange?.(day)
                  else select(day)
                }}>{n}</button>
            </td>
          })}</tr>
        ))}</tbody>
      </table>
      {monthHolidays.length > 0 && <ul className="al-calendar-holidays" aria-label={text.holidays}>
        {monthHolidays.map(holiday => <li key={holiday.id}><time dateTime={holiday.date}>{Number(holiday.date.slice(-2))}</time>
          <span>{holiday.name}{holiday.duration === 'afternoon' && ' (' + text.afternoon + ')'}</span></li>)}
      </ul>}
    </section>
  )
})
