import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './separator.css'

export interface SeparatorProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role'> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
  weight?: 'hairline' | 'section'
}
export function Separator({
  orientation = 'horizontal',
  decorative = true,
  weight = 'hairline',
  className = '',
  ...props
}: SeparatorProps): ReactElement {
  return (
    <div
      {...props}
      data-weight={weight}
      data-orientation={orientation}
      role={decorative ? undefined : 'separator'}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={`al-separator ${className}`.trim()}
    />
  )
}
