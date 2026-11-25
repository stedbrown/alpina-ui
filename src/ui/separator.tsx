import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './separator.css'

export interface SeparatorProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role'> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  weight?: 'hairline' | 'section'
}
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  {
    orientation = 'horizontal',
    decorative = true,
    weight = 'hairline',
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      {...props}
      data-weight={weight}
      data-orientation={orientation}
      role={decorative ? undefined : 'separator'}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={`al-separator ${className}`.trim()}
    />
  )
})
