import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Input } from '../ui/input.js'
import { swissPostalCodePattern } from './postal-code.js'
import type { SwissLocale } from './locales.js'

export interface SwissPostalCodeInputProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'inputMode' | 'pattern' | 'maxLength' | 'minLength' | 'children' | 'value' | 'defaultValue'
> {
  value?: string
  defaultValue?: string
  locale?: SwissLocale
}

export const SwissPostalCodeInput = forwardRef<HTMLInputElement, SwissPostalCodeInputProps>(
  function SwissPostalCodeInput({ locale, ...props }, ref) {
    return (
      <Input
        autoComplete="postal-code"
        lang={locale}
        dir="ltr"
        spellCheck={false}
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern={swissPostalCodePattern}
        minLength={4}
        maxLength={4}
      />
    )
  },
)
