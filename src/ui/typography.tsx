import type { HTMLAttributes, ReactElement } from 'react'
import './typography.css'

export type TypeRole = 'inherit' | 'caption' | 'label' | 'body' | 'lead' | 'heading' | 'display' | 'title' | 'poster'
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  variant?: TypeRole
  measure?: 'reading' | 'narrow'
  numeric?: boolean
  tone?: 'ink' | 'paper' | 'accent'
}
export function Typography({
  as: Element = 'p',
  variant = 'body',
  measure,
  numeric = false,
  tone,
  className = '',
  ...props
}: TypographyProps): ReactElement {
  return (
    <Element
      {...props}
      className={('al-type ' + className).trim()}
      data-role={variant}
      data-tone={tone}
      data-measure={measure}
      data-numeric={numeric || undefined}
    />
  )
}
