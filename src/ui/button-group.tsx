import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './button-group.css'
export interface ButtonGroupProps extends ComponentPropsWithoutRef<'div'> {
  label: string
  orientation?: 'horizontal' | 'vertical'
}
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  {
    label,
    orientation = 'horizontal',
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      {...props}
      role="group"
      aria-label={label}
      data-orientation={orientation}
      className={('al-button-group ' + className).trim()}
    />
  )
})
