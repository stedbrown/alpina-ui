'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { NativeSelect } from '../interactive/native-select.js'
import { defaultSwissLocale, localeNames, swissLocales, type SwissLocale } from './locales.js'

export interface LocaleSelectProps extends Omit<
  ComponentPropsWithoutRef<'select'>,
  'children' | 'value' | 'defaultValue' | 'multiple'
> {
  /** Available languages in the order they appear in the selector. */
  locales?: readonly SwissLocale[]
  value?: SwissLocale
  defaultValue?: SwissLocale
  onLocaleChange?: (locale: SwissLocale) => void
}

export const LocaleSelect = forwardRef<HTMLSelectElement, LocaleSelectProps>(function LocaleSelect(
  {
    value,
    defaultValue = defaultSwissLocale,
    onChange,
    onLocaleChange,
    locales = swissLocales,
    ...props
  },
  ref,
) {
  const choices = Array.from(new Set(locales))
  const fallback = choices.includes(defaultValue) ? defaultValue : choices[0]
  return (
    <NativeSelect
      appearance="outline"
      {...props}
      ref={ref}
      value={value}
      defaultValue={value === undefined ? fallback : undefined}
      onChange={(event) => {
        const next = event.currentTarget.value as SwissLocale
        onChange?.(event)
        onLocaleChange?.(next)
      }}
    >
      {choices.map((locale) => (
        <option key={locale} value={locale} lang={locale}>
          {localeNames[locale]}
        </option>
      ))}
    </NativeSelect>
  )
})
