'use client'
import { forwardRef } from 'react'
import { SwissDate, type SwissDateProps } from './swiss-date.js'
import { useSwissLocale } from './locale-context.internal.js'

export const LocalizedSwissDate = forwardRef<HTMLTimeElement, SwissDateProps>(function LocalizedSwissDate(props, ref) {
  const locale = useSwissLocale(props.locale)
  return <SwissDate {...props} locale={locale} ref={ref} />
})
