import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { formatCentimes } from '../swiss/format-centimes.internal.js'
import { formatSwissNumber } from '../swiss/format-swiss-number.js'
import '../swiss/figures.css'
import { defaultSwissLocale, type SwissLocale } from '../swiss/locales.js'
import { decimalFromMinor, minorUnits as toMinor, type AccountingValue } from './accounting-values.js'

export type { AccountingValue }
export type AccountingNegativeStyle = 'minus' | 'parentheses'
export type TableAmountProps = Omit<ComponentPropsWithoutRef<'data'>, 'value' | 'children'> &
  ({ value: AccountingValue; minorUnits?: never } | { minorUnits: bigint; value?: never }) & {
    format?: 'chf' | 'decimal'
    /** Shared display precision for this column. CHF uses two digits. */
    fractionDigits?: number
    negativeStyle?: AccountingNegativeStyle
    locale?: SwissLocale
  }

export const TableAmount = forwardRef<HTMLDataElement, TableAmountProps>(function TableAmount({
  value, minorUnits, format = 'decimal', fractionDigits = 2, negativeStyle = 'minus',
  locale = defaultSwissLocale, className = '', ...props
}, ref) {
  const digits = format === 'chf' ? 2 : fractionDigits
  const minor = minorUnits ?? toMinor(value!, digits)
  const decimal = decimalFromMinor(minor, digits)
  const text = format === 'chf' ? formatCentimes(minor, locale).replace('CHF', '').trim()
    : formatSwissNumber(decimal, locale, { minimumFractionDigits: digits })
  const minus = { 'de-CH': 'minus', 'fr-CH': 'moins', 'it-CH': 'meno', 'rm-CH': 'minus' }
  const parentheses = negativeStyle === 'parentheses'
  return <data ref={ref} {...props} lang={locale} dir="ltr" value={decimal} className={('al-table-amount ' + className).trim()}
    data-reserve-sign={parentheses && minor >= 0n || undefined}>
    {parentheses && minor < 0n ? <>
      <span className="al-currency-spoken">{text.replace('−', minus[locale] + ' ')}</span><span aria-hidden="true">({text.replace('−', '')})</span>
    </> : text}
  </data>
})
