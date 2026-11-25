import { forwardRef, type CSSProperties, type ComponentPropsWithoutRef } from 'react'
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
  const formatted = formatCHF(amount, locale, { cashRounding })
  const minus = { 'de-CH': 'minus', 'fr-CH': 'moins', 'it-CH': 'meno', 'rm-CH': 'minus' }
  const negative = formatted.includes('−')
  return (
    <data ref={ref} lang={locale} {...props} value={String(amount)} className={('al-swiss-figures ' + className).trim()}>
      {negative && <span className="al-currency-spoken">{formatted.replace('−', minus[locale] + ' ')}</span>}
      <bdi style={{ '--al-figure-length': formatted.length } as CSSProperties} dir="ltr" aria-hidden={negative || undefined}>{formatted}</bdi>
    </data>
  )
})
