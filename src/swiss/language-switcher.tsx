'use client'

import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { ResponsiveNavigation } from '../interactive/responsive-navigation.js'
import { ToggleGroup } from '../interactive/toggle-group.js'
import { Field } from '../ui/field.js'
import { Select } from '../ui/select.js'
import { localeNames, swissLocales, type SwissMessageLocale } from './locales.js'

const allLocales: readonly SwissMessageLocale[] = [...swissLocales, 'en']
const names = { ...localeNames, en: 'English' }
export interface LanguageSwitcherProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'> {
  label: string
  value: SwissMessageLocale
  onLocaleChange: (value: SwissMessageLocale) => void
  locales?: readonly SwissMessageLocale[]
  disabled?: boolean
}

export const LanguageSwitcher = forwardRef<HTMLDivElement, LanguageSwitcherProps>(function LanguageSwitcher(
  { label, value, onLocaleChange, locales = allLocales, disabled, ...props }, ref,
) {
  const options = locales.map(tag => ({ value: tag, label: <span lang={tag}>{names[tag]}</span> }))
  function change(next: string | undefined) {
    const language = locales.find(tag => tag === next)
    if (language) onLocaleChange(language)
  }
  return <ResponsiveNavigation ref={ref} {...props} layoutKey={JSON.stringify([locales, label, value])} compact={
    <Field label={label}>{control => <Select {...control} disabled={disabled} value={value}
      onChange={event => change(event.currentTarget.value)}>
      {locales.map(tag => <option key={tag} lang={tag} value={tag}>{names[tag]}</option>)}
    </Select>}</Field>
  }><ToggleGroup label={label} options={options} value={[value]} disabled={disabled}
    onValueChange={([next]) => change(next)} /></ResponsiveNavigation>
})
