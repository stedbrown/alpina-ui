import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './button-group.css'
export interface ButtonGroupProps extends ComponentPropsWithoutRef<'div'> {
  label: string
  orientation?: 'horizontal' | 'vertical'
}
export function ButtonGroup({
  label,
  orientation = 'horizontal',
  className = '',
  ...props
}: ButtonGroupProps): ReactElement {
  return (
    <div
      {...props}
      role="group"
      aria-label={label}
      data-orientation={orientation}
      className={('al-button-group ' + className).trim()}
    />
  )
}
