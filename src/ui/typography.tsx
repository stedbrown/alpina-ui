import type { HTMLAttributes, ReactElement } from 'react'
import './typography.css'

export type TypeRole = 'caption' | 'label' | 'body' | 'heading' | 'display'
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  variant?: TypeRole
  measure?: 'reading' | 'narrow'
  numeric?: boolean
}
export function Typography({
  as: Element = 'p',
  variant = 'body',
  measure,
  numeric = false,
  className = '',
  ...props
}: TypographyProps): ReactElement {
  return (
    <Element
      {...props}
      className={('al-type ' + className).trim()}
      data-role={variant}
      data-measure={measure}
      data-numeric={numeric || undefined}
    />
  )
}
