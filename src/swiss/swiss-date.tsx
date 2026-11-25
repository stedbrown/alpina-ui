import { LocalizedSwissDate } from './swiss-date-locale.internal.js'
import { forwardRef, type CSSProperties, type ComponentPropsWithoutRef } from 'react'
import { formatSwissDate, type SwissDateOptions } from './format-swiss-date.js'
import { type SwissLocale } from './locales.js'
import './figures.css'
import './swiss-date.css'

export interface SwissDateProps
  extends Omit<ComponentPropsWithoutRef<'time'>, 'children' | 'dateTime'>, SwissDateOptions {
  value: string | Date
  locale?: SwissLocale
}

export const SwissDate = forwardRef<HTMLTimeElement, SwissDateProps>(function SwissDate(input, ref) {
  if (input.locale === undefined) return <LocalizedSwissDate {...input} ref={ref} />
  const {
    value,
    locale,
    dateStyle,
    timeZone,
    className = '',
    ...props
  } = input
  const formatted = formatSwissDate(value, locale, { dateStyle, timeZone })
  return (
    <time ref={ref} lang={locale} {...props} dateTime={typeof value === 'string' ? value : value.toISOString()}
      className={('al-swiss-figures ' + className).trim()}>
      <bdi style={{ '--al-figure-length': formatted.length } as CSSProperties} dir="ltr">{formatted}</bdi>
    </time>
  )
})
