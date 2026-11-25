import { forwardRef, type ComponentPropsWithoutRef, type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { Slot, type SlottedSignature } from './slot.js'
import './badge.css'

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  asChild?: boolean
  marked?: boolean
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({
  tone = 'neutral',
  marked = tone !== 'neutral',
  asChild = false,
  children,
  className = '',
  ...props
}, ref) {
  const mark = marked && (
    <span aria-hidden="true" className="al-badge-mark">
      {{ neutral: '○', accent: '●', success: '✓', danger: '!' }[tone]}
    </span>
  )
  const shared = { ...props, ref, 'data-tone': tone, className: `al-badge ${className}`.trim() }
  return asChild
    ? <Slot {...shared} before={mark}>{children}</Slot>
    : <span {...shared}>{mark}{children}</span>
}) as SlottedSignature<BadgeProps> & ForwardRefExoticComponent<BadgeProps & RefAttributes<HTMLSpanElement>>
