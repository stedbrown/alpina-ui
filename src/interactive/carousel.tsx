'use client'
import { useId, useRef, type ReactElement, type ReactNode } from 'react'
import { Button } from '../ui/button.js'
import { useControllable } from './controllable.js'
import { navigationIndex } from './navigation.js'
import './carousel.css'

export interface CarouselSlide {
  value: string
  label: string
  content: ReactNode
}
export interface CarouselProps {
  label: string
  items: readonly CarouselSlide[]
  previousLabel: string
  nextLabel: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
}
export function Carousel({
  label,
  items,
  previousLabel,
  nextLabel,
  value,
  defaultValue,
  onValueChange,
  className,
}: CarouselProps): ReactElement {
  const [requested, select] = useControllable(
    value,
    defaultValue ?? items[0]?.value ?? '',
    onValueChange,
  )
  const index = Math.max(
    0,
    items.findIndex((item) => item.value === requested),
  )
  const current = items[index]
  const id = useId()
  const touch = useRef<{ x: number; y: number } | null>(null)
  function change(amount: number) {
    if (items.length > 1) select(items[(index + items.length + amount) % items.length]!.value)
  }
  return (
    <section
      aria-label={label}
      tabIndex={0}
      className={['al-carousel', className].filter(Boolean).join(' ')}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget || e.altKey || e.ctrlKey || e.metaKey) return
        const next = navigationIndex(
          e.key,
          index,
          items.length,
          'horizontal',
          getComputedStyle(e.currentTarget).direction === 'rtl',
        )
        if (next !== undefined) {
          e.preventDefault()
          select(items[next]!.value)
        }
      }}
    >
      <div
        id={id}
        className="al-carousel-stage"
        onTouchStart={(e) => {
          const p = e.touches[0]
          touch.current = p && e.touches.length === 1 ? { x: p.clientX, y: p.clientY } : null
        }}
        onTouchCancel={() => {
          touch.current = null
        }}
        onTouchEnd={(e) => {
          const from = touch.current,
            p = e.changedTouches[0]
          touch.current = null
          if (!from || !p) return
          const dx = p.clientX - from.x,
            dy = p.clientY - from.y
          if (Math.abs(dx) > 48 && Math.abs(dx) > 2 * Math.abs(dy))
            change(
              (dx < 0 ? 1 : -1) * (getComputedStyle(e.currentTarget).direction === 'rtl' ? -1 : 1),
            )
        }}
      >
        {current && (
          <div key={current.value} role="group" aria-label={current.label}>
            {current.content}
          </div>
        )}
      </div>
      <div className="al-carousel-bar">
        <span aria-live="polite" aria-atomic="true">
          <b>
            {current ? index + 1 : 0} / {items.length}
          </b>{' '}
          {current?.label}
        </span>
        <div>
          <Button
            variant="outline"
            aria-label={previousLabel}
            aria-controls={id}
            disabled={items.length < 2}
            onClick={() => change(-1)}
          >
            <span aria-hidden="true">←</span>
          </Button>
          <Button
            variant="outline"
            aria-label={nextLabel}
            aria-controls={id}
            disabled={items.length < 2}
            onClick={() => change(1)}
          >
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </section>
  )
}
