'use client'
import { useSwissLocale } from './locale-context.internal.js'

import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react'
import { Dialog } from '../interactive/dialog.js'
import { Button } from '../ui/button.js'
import { Calendar, type CalendarProps } from './calendar.js'
import { calendarText } from './calendar-dates.js'
import { SwissDate } from './swiss-date.js'
import { formatSwissDate } from './format-swiss-date.js'
import './date-picker.css'

export interface DatePickerProps extends CalendarProps {
  label?: string
  name?: string
  disabled?: boolean
  /** Allow the user to remove the selected day from the calendar dialog. */
  clearable?: boolean
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  { value, defaultValue = '', onValueChange, name, label, locale: requestedLocale, disabled = false, clearable = false, className = '', ...calendar },
  forwardedRef,
) {
  const locale = useSwissLocale(requestedLocale)
  const [local, setLocal] = useState(defaultValue)
  const selection = value ?? local
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useImperativeHandle(forwardedRef, () => root.current!, [])
  const text = calendarText[locale]

  useEffect(() => {
    const form = root.current?.closest('form')
    function reset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return
        if (value === undefined) setLocal(defaultValue)
        setOpen(false)
      })
    }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [defaultValue, value])

  useEffect(() => {
    if (disabled) setOpen(false)
    else if (open) root.current?.querySelector<HTMLButtonElement>('[data-day][tabindex="0"]')?.focus()
  }, [open, disabled])
  function choose(day: string) {
    if (value === undefined) setLocal(day)
    if (selection !== day) onValueChange?.(day)
    setOpen(false)
  }

  return <div ref={root} lang={locale} className={('al-date-picker ' + className).trim()}>
    {name && <input type="hidden" name={name} value={selection} disabled={disabled} />}
    {disabled ? <button type="button" disabled>{selection ? <SwissDate value={selection} locale={locale} /> : label ?? text.choose}</button> :
      <Dialog title={label ?? text.choose} closeLabel={text.close} open={open} onOpenChange={setOpen}
        footer={clearable && selection ? <Button variant="outline" onClick={() => choose('')}>{text.clear}</Button> : undefined}
        trigger={<>{selection ? <SwissDate value={selection} locale={locale} /> : label ?? text.choose}<span aria-hidden="true">▾</span></>}
        triggerLabel={selection ? (label ?? text.choose) + ', ' + formatSwissDate(selection, locale) : label ?? text.choose}>
        {open && <Calendar {...calendar} value={selection} defaultMonth={selection || calendar.defaultMonth} locale={locale} onValueChange={choose} />}
      </Dialog>}
  </div>
})
