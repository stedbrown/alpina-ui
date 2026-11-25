import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import { formatCHF } from './format-chf.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'

export interface CurrencyCHFProps extends Omit<ComponentPropsWithoutRef<'data'>, 'children' | 'value'> {
  amount: number | bigint
  locale?: SwissLocale
}

export function CurrencyCHF({ amount, locale = defaultSwissLocale, ...props }: CurrencyCHFProps): ReactElement {
  return (
    <data lang={locale} {...props} value={String(amount)}>
      <bdi dir="ltr">{formatCHF(amount, locale)}</bdi>
    </data>
  )
}
