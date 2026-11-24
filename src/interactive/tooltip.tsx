'use client'
import { cloneElement, useId, useRef, type ReactElement } from 'react'
import { useFloating } from './floating.js'
import { useHoverIntent } from './hover-intent.js'
import './tooltip.css'

export interface TooltipProps {
  children: ReactElement<{ 'aria-describedby'?: string }>
  content: string
  className?: string
  /** Pointer dwell in milliseconds. Keyboard focus reveals the description immediately. */
  delay?: number
}
export function Tooltip({ children, content, className, delay = 220 }: TooltipProps): ReactElement {
  const id = useId()
  const anchor = useRef<HTMLSpanElement>(null),
    tip = useRef<HTMLSpanElement>(null)
  const { open, bindings } = useHoverIntent(anchor, delay)
  useFloating(open, anchor, tip, 'tooltip')
  return (
    <span
      ref={anchor}
      {...bindings}
      className={['al-tooltip-anchor', className].filter(Boolean).join(' ')}
    >
      {cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
      })}
      <span ref={tip} role="tooltip" id={id} hidden={!open} className="al-tooltip-bubble">
        {content}
      </span>
    </span>
  )
}
