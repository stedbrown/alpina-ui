import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { formatSwissDate, type SwissDateOptions } from './format-swiss-date.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'

export interface SwissDateProps
  extends Omit<ComponentPropsWithoutRef<'time'>, 'children' | 'dateTime'>, SwissDateOptions {
  value: string | Date
  locale?: SwissLocale
}

export const SwissDate = forwardRef<HTMLTimeElement, SwissDateProps>(function SwissDate(
  {
    value,
    locale = defaultSwissLocale,
    dateStyle,
    timeZone,
    ...props
  },
  ref,
) {
  const formatted = formatSwissDate(value, locale, { dateStyle, timeZone })
  return (
    <time ref={ref} lang={locale} {...props} dateTime={typeof value === 'string' ? value : value.toISOString()}>
      <bdi dir="ltr">{formatted}</bdi>
    </time>
  )
})
