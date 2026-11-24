import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './marker.css'
export interface MarkerProps extends ComponentPropsWithoutRef<'span'> {
  variant?: 'open' | 'closed' | 'attention'
}
export function Marker({
  variant = 'open',
  children,
  className = '',
  ...props
}: MarkerProps): ReactElement {
  return (
    <span {...props} data-variant={variant} className={('al-marker ' + className).trim()}>
      <span className="al-marker-symbol" aria-hidden="true">
        {variant === 'closed' ? '■' : variant === 'attention' ? '▲' : '○'}
      </span>
      {children}
    </span>
  )
}
