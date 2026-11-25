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
  function SwissPostalCodeInput({ locale, onPaste, ...props }, ref) {
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
        onPaste={(event) => {
          onPaste?.(event)
          const input = event.currentTarget
          if (event.defaultPrevented || input.readOnly || input.disabled) return
          const raw = event.clipboardData.getData('text')
          const digits = raw.normalize('NFKC').trim().replace(/^CH\s*-\s*/i, '')
          if (raw === digits || !/^[0-9]{4}$/.test(digits)) return
          if (input.selectionStart !== 0 || input.selectionEnd !== input.value.length) return
          event.preventDefault()
          input.setRangeText(digits, 0, input.value.length, 'end')
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }}
      />
    )
  },
)
