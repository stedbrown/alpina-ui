import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './badge.css'

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  marked?: boolean
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
}

export function Badge({
  tone = 'neutral',
  marked = tone !== 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps): ReactElement {
  return (
    <span {...props} data-tone={tone} className={`al-badge ${className}`.trim()}>
      {marked && (
        <span aria-hidden="true" className="al-badge-mark">
          {{ neutral: '○', accent: '●', success: '✓', danger: '!' }[tone]}
        </span>
      )}
      {children}
    </span>
  )
}
