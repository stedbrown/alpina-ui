import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './spinner.css'

export interface SpinnerProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}
export function Spinner({ label, size = 'md', className = '', ...props }: SpinnerProps): ReactElement {
  return (
    <span
      {...props}
      className={`al-spinner ${className}`.trim()}
      data-size={size}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label && <span className="al-spinner-label">{label}</span>}
    </span>
  )
}
