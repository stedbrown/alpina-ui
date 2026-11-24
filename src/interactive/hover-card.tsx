'use client'
import { useId, useRef, type ReactNode, type ReactElement } from 'react'
import { useHoverIntent } from './hover-intent.js'
import { useFloating } from './floating.js'
import './hover-card.css'

export interface HoverCardProps {
  trigger: ReactNode
  title: string
  children: ReactNode
  delay?: number
  className?: string
}
export function HoverCard({
  trigger,
  title,
  children,
  delay = 220,
  className,
}: HoverCardProps): ReactElement {
  const id = useId()
  const root = useRef<HTMLDivElement>(null),
    anchor = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null)
  const { open, bindings, togglePin } = useHoverIntent(root, delay, () => {
    if (panel.current?.contains(document.activeElement))
      anchor.current?.focus({ preventScroll: true })
  })
  useFloating(open, anchor, panel, 'menu')
  return (
    <div
      ref={root}
      {...bindings}
      className={['al-hover-card', className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="al-hover-trigger"
        ref={anchor}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={togglePin}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panel}
          id={id}
          role="region"
          aria-labelledby={id + '-title'}
          className="al-hover-panel"
        >
          <h3 id={id + '-title'}>{title}</h3>
          {children}
        </div>
      )}
    </div>
  )
}
