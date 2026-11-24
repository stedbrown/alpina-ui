'use client'
import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react'
import './toggle.css'
export interface ToggleProps extends Omit<ComponentPropsWithoutRef<'button'>, 'aria-pressed'> {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed,
    defaultPressed = false,
    onPressedChange,
    onClick,
    type = 'button',
    className = '',
    ...props
  },
  ref,
) {
  const [internal, setInternal] = useState(defaultPressed)
  const active = pressed ?? internal
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      aria-pressed={active}
      className={('al-toggle ' + className).trim()}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (pressed === undefined) setInternal(!active)
        onPressedChange?.(!active)
      }}
    />
  )
})
