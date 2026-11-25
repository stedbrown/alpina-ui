'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { NativeSelect } from '../interactive/native-select.js'
import { cantons, type CantonCode } from './cantons.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'

export interface CantonSelectProps extends Omit<
  ComponentPropsWithoutRef<'select'>,
  'children' | 'value' | 'defaultValue' | 'multiple'
> {
  locale?: SwissLocale
  /** Sort by localized name, or retain the federal statistical order. */
  order?: 'federal' | 'name'
  value?: CantonCode | ''
  defaultValue?: CantonCode | ''
  /** Add an initially empty, disabled option. Required validates the empty value. */
  placeholder?: string
  /** Adds an empty option users can select again to clear a filter. Handle the empty value in onChange. */
  allLabel?: string
  onCantonChange?: (canton: CantonCode) => void
}

export const CantonSelect = forwardRef<HTMLSelectElement, CantonSelectProps>(function CantonSelect(
  {
    locale = defaultSwissLocale,
    order = 'federal',
    value,
    defaultValue,
    placeholder,
    allLabel,
    onChange,
    onCantonChange,
    ...props
  },
  ref,
) {
  const initialValue =
    defaultValue ?? (placeholder === undefined && allLabel === undefined ? undefined : '')
  const choices = order === 'name'
    ? [...cantons].sort((a, b) => a.names[locale].localeCompare(b.names[locale], locale))
    : cantons
  return (
    <NativeSelect
      appearance="outline"
      lang={locale}
      {...props}
      ref={ref}
      value={value}
      defaultValue={value === undefined ? initialValue : undefined}
      onChange={(event) => {
        const next = event.currentTarget.value
        onChange?.(event)
        if (next) onCantonChange?.(next as CantonCode)
      }}
    >
      {allLabel !== undefined ? (
        <option value="">{allLabel}</option>
      ) : (
        placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )
      )}
      {choices.map(({ code, names }) => (
        <option key={code} value={code} lang={locale}>
          {names[locale]} ({code})
        </option>
      ))}
    </NativeSelect>
  )
})
