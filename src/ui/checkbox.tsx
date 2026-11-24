'use client'

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
} from 'react'
import './checkbox.css'

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type'> {
  indeterminate?: boolean
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate, onChange, className = '', ...props },
  ref,
) {
  const input = useRef<HTMLInputElement | null>(null)
  const bind = useCallback(
    (node: HTMLInputElement | null) => {
      input.current = node
      if (node && indeterminate !== undefined) node.indeterminate = indeterminate
    },
    [indeterminate],
  )
  useImperativeHandle(ref, () => input.current!, [])
  return (
    <input
      {...props}
      aria-checked={indeterminate ? 'mixed' : props['aria-checked']}
      onChange={
        indeterminate
          ? (event) => {
              onChange?.(event)
              event.currentTarget.indeterminate = true
            }
          : onChange
      }
      ref={bind}
      type="checkbox"
      className={`al-checkbox ${className}`.trim()}
    />
  )
})
