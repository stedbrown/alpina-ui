'use client'

import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from 'react'
import { Input } from '../ui/input.js'
import './input-otp.css'

export interface InputOTPProps extends Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'type'
  | 'value'
  | 'defaultValue'
  | 'minLength'
  | 'maxLength'
  | 'inputMode'
  | 'pattern'
  | 'children'
> {
  value?: string
  defaultValue?: string
  length?: number
  onValueChange?: (digits: string) => void
}

function normalize(text: string, length: number): string {
  return text
    .normalize('NFKC')
    .replace(/[^0-9]/g, '')
    .slice(0, length)
}

/** One editable field retains native selection, password-manager autofill and leading zeros. */
export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(
  {
    length = 6,
    value,
    defaultValue,
    onValueChange,
    onChange,
    onPaste,
    className = '',
    style,
    ...props
  },
  ref,
) {
  if (!Number.isInteger(length) || length < 1 || length > 32)
    throw new RangeError('OTP length must be between 1 and 32')
  return (
    <Input
      autoComplete="one-time-code"
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      dir="ltr"
      spellCheck={false}
      pattern={'[0-9]{' + length + '}'}
      value={value === undefined ? undefined : normalize(value, length)}
      defaultValue={
        value === undefined && defaultValue !== undefined
          ? normalize(defaultValue, length)
          : undefined
      }
      className={('al-input-otp ' + className).trim()}
      style={{ '--al-otp-length': length, ...style } as CSSProperties}
      onChange={(event) => {
        const field = event.currentTarget
        const raw = field.value
        const digits = normalize(raw, length)
        if (raw !== digits) {
          const cursor = normalize(raw.slice(0, field.selectionStart ?? raw.length), length).length
          field.value = digits
          field.setSelectionRange(cursor, cursor)
        }
        onChange?.(event)
        onValueChange?.(digits)
      }}
      onPaste={(event) => {
        onPaste?.(event)
        if (event.defaultPrevented) return
        const raw = event.clipboardData.getData('text')
        const content = normalize(raw, length)
        if (raw === content) return
        event.preventDefault()
        if (!content) return
        const field = event.currentTarget
        field.setRangeText(content, field.selectionStart ?? 0, field.selectionEnd ?? 0, 'end')
        field.dispatchEvent(new Event('input', { bubbles: true }))
      }}
    />
  )
})
