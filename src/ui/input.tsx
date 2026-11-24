import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './input.css'

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  numeric?: boolean
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { type = 'text', numeric = false, inputMode, className = '', ...props },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      type={type}
      data-numeric={numeric || undefined}
      inputMode={inputMode ?? (numeric ? 'decimal' : undefined)}
      className={`al-input ${className}`.trim()}
    />
  )
})
