'use client'
import {
  useId,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useControllable } from './controllable.js'
import './resizable.css'

export interface ResizableProps {
  label: string
  first: ReactNode
  second: ReactNode
  orientation?: 'horizontal' | 'vertical'
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (percent: number) => void
  className?: string
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
export function Resizable({
  label,
  first,
  second,
  orientation = 'horizontal',
  min = 0,
  max = 100,
  step = 2,
  value,
  defaultValue = 50,
  onValueChange,
  className,
}: ResizableProps): ReactElement {
  const [raw, change] = useControllable(value, defaultValue, onValueChange)
  const lo = clamp(Number.isFinite(min) ? min : 0, 0, 100),
    hi = clamp(Number.isFinite(max) ? max : 100, lo, 100)
  const percent = clamp(Number.isFinite(raw) ? raw : 50, lo, hi)
  const horizontal = orientation === 'horizontal'
  const saved = useRef(percent)
  const root = useRef<HTMLDivElement>(null)
  const drag = useRef<{
    pointer: number
    pixel: number
    percent: number
    extent: number
    direction: number
  } | null>(null)
  const id = useId()
  function commit(next: number) {
    change(Math.round(clamp(next, lo, hi) * 100) / 100)
  }
  function toggle() {
    if (percent > lo) {
      saved.current = percent
      commit(lo)
    } else commit(saved.current > lo ? saved.current : (hi + lo) / 2)
  }
  function start(e: PointerEvent<HTMLDivElement>) {
    if (!e.isPrimary || e.button !== 0 || !root.current) return
    const container = root.current.getBoundingClientRect(),
      grip = e.currentTarget.getBoundingClientRect()
    const extent = horizontal ? container.width - grip.width : container.height - grip.height
    if (extent <= 0) return
    e.currentTarget.focus({ preventScroll: true })
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      pointer: e.pointerId,
      pixel: horizontal ? e.clientX : e.clientY,
      percent,
      extent,
      direction: horizontal && getComputedStyle(root.current).direction === 'rtl' ? -1 : 1,
    }
  }
  const layout = {
    '--al-first-track': percent + 'fr',
    '--al-second-track': 100 - percent + 'fr',
  } as CSSProperties
  return (
    <div
      ref={root}
      data-orientation={orientation}
      className={['al-resizable', className].filter(Boolean).join(' ')}
      style={layout}
    >
      <div className="al-resize-pane" id={id} hidden={percent === 0}>
        {first}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-controls={id}
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={percent}
        aria-valuetext={percent + '%'}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        className="al-resize-grip"
        onPointerDown={start}
        onLostPointerCapture={() => {
          drag.current = null
        }}
        onPointerMove={(e) => {
          const state = drag.current
          if (state?.pointer !== e.pointerId) return
          const pixel = horizontal ? e.clientX : e.clientY
          commit(state.percent + ((pixel - state.pixel) * 100 * state.direction) / state.extent)
        }}
        onKeyDown={(e) => {
          if (e.altKey || e.metaKey || e.ctrlKey) return
          const key = e.key
          if (key === 'Home' || key === 'End') {
            e.preventDefault()
            commit(key === 'Home' ? lo : hi)
            return
          }
          if (key === 'Enter') {
            e.preventDefault()
            toggle()
            return
          }
          const direction =
            horizontal && getComputedStyle(e.currentTarget).direction === 'rtl' ? -1 : 1
          const next = horizontal ? 'ArrowRight' : 'ArrowDown',
            previous = horizontal ? 'ArrowLeft' : 'ArrowUp'
          if (key !== next && key !== previous) return
          e.preventDefault()
          const increment = step > 0 && Number.isFinite(step) ? step : 2
          commit(percent + (key === next ? 1 : -1) * direction * increment * (e.shiftKey ? 5 : 1))
        }}
      />
      <div className="al-resize-pane" hidden={percent === 100}>
        {second}
      </div>
    </div>
  )
}
