import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import { formatSwissDate, type SwissDateOptions } from './format-swiss-date.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'

export interface SwissDateProps
  extends Omit<ComponentPropsWithoutRef<'time'>, 'children' | 'dateTime'>, SwissDateOptions {
  value: string | Date
  locale?: SwissLocale
}

export function SwissDate({
  value,
  locale = defaultSwissLocale,
  dateStyle,
  timeZone,
  ...props
}: SwissDateProps): ReactElement {
  const formatted = formatSwissDate(value, locale, { dateStyle, timeZone })
  return (
    <time lang={locale} {...props} dateTime={typeof value === 'string' ? value : value.toISOString()}>
      {formatted}
    </time>
  )
}
