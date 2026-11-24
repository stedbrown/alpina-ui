import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './button.css'

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  busy?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    type = 'button',
    busy = false,
    disabled,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      disabled={disabled || busy}
      aria-busy={busy || props['aria-busy']}
      type={type}
      className={`al-button ${className}`.trim()}
      data-variant={variant}
      data-size={size}
    />
  )
})
