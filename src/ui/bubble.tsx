import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './bubble.css'
export interface BubbleProps extends ComponentPropsWithoutRef<'div'> {
  side?: 'start' | 'end'
}
export function Bubble({ side = 'start', className = '', ...props }: BubbleProps): ReactElement {
  return <div {...props} data-side={side} className={('al-bubble ' + className).trim()} />
}
