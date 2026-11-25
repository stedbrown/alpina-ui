import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './spinner.css'

export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  label?: string
  /** Show the status text alongside the dial. */
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}
export function Spinner({ label, showLabel = false, size = 'md', className = '', ...props }: SpinnerProps): ReactElement {
  return (
    <span
      {...props}
      className={`al-spinner ${className}`.trim()}
      data-size={size}
      data-show-label={(showLabel && Boolean(label)) || undefined}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label && <span className={showLabel ? 'al-spinner-text' : 'al-spinner-label'}>{label}</span>}
    </span>
  )
}
