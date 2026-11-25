import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './marker.css'
export interface MarkerProps extends ComponentPropsWithoutRef<'span'> {
  variant?: 'open' | 'closed' | 'attention'
}
export const Marker = forwardRef<HTMLSpanElement, MarkerProps>(function Marker(
  {
    variant = 'open',
    children,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <span ref={ref} {...props} data-variant={variant} className={('al-marker ' + className).trim()}>
      <span className="al-marker-symbol" aria-hidden="true">
        {variant === 'closed' ? '■' : variant === 'attention' ? '▲' : '○'}
      </span>
      {children}
    </span>
  )
})
