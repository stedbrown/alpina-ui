import { forwardRef, type ComponentPropsWithoutRef, type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { Slot, type SlottedSignature } from './slot.js'
import './button.css'

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /** Apply the control's props and ref to a single child element. */
  asChild?: boolean
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
    asChild = false,
    disabled,
    className = '',
    ...props
  },
  ref,
) {
  const shared = {
    ...props, ref, 'aria-busy': busy || props['aria-busy'],
    className: `al-button ${className}`.trim(), 'data-variant': variant, 'data-size': size,
  }
  return asChild
    ? <Slot {...shared} inactive={disabled || busy} buttonType={type} />
    : <button {...shared} disabled={disabled || busy} type={type} />
}) as SlottedSignature<ButtonProps> & ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>
