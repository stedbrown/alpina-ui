import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './bubble.css'
export interface BubbleProps extends ComponentPropsWithoutRef<'div'> {
  side?: 'start' | 'end'
}
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  { side = 'start', className = '', ...props },
  ref,
) {
  return <div ref={ref} {...props} data-side={side} className={('al-bubble ' + className).trim()} />
})
