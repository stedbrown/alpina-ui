'use client'
import { forwardRef } from 'react'
import { TableAmount, type TableAmountProps } from './table-amount.js'
import { useSwissLocale } from '../swiss/locale-context.internal.js'

export const LocalizedTableAmount = forwardRef<HTMLDataElement, TableAmountProps>(function LocalizedTableAmount(props, ref) {
  const locale = useSwissLocale(props.locale)
  return <TableAmount {...props} locale={locale} ref={ref} />
})
