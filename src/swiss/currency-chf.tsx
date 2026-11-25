import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { formatCHF, type SwissCurrencyOptions } from './format-chf.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'
import './figures.css'

export interface CurrencyCHFProps extends Omit<ComponentPropsWithoutRef<'data'>, 'children' | 'value'>, SwissCurrencyOptions {
  amount: number | bigint
  locale?: SwissLocale
}

export const CurrencyCHF = forwardRef<HTMLDataElement, CurrencyCHFProps>(function CurrencyCHF(
  { amount, locale = defaultSwissLocale, cashRounding, className = '', ...props },
  ref,
) {
  return (
    <data ref={ref} lang={locale} {...props} value={String(amount)} className={('al-swiss-figures ' + className).trim()}>
      <bdi dir="ltr">{formatCHF(amount, locale, { cashRounding })}</bdi>
    </data>
  )
})
