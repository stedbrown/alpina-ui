'use client'
import { forwardRef } from 'react'
import { CurrencyCHF, type CurrencyCHFProps } from './currency-chf.js'
import { useSwissLocale } from './locale-context.internal.js'

export const LocalizedCurrencyCHF = forwardRef<HTMLDataElement, CurrencyCHFProps>(function LocalizedCurrencyCHF(props, ref) {
  const locale = useSwissLocale(props.locale)
  return <CurrencyCHF {...props} locale={locale} ref={ref} />
})
