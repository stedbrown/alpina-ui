'use client'
import { forwardRef, useImperativeHandle, useId, useRef, useState, type ReactNode } from 'react'
import { ActionList, type ActionItem } from './action-list.js'
import { useOutside } from './dismiss.js'
import './context-menu.css'
export interface ContextMenuProps {
  label: string
  items: readonly ActionItem[]
  children: ReactNode
  onValueSelect?: (value: string) => void
  className?: string
}
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  {
    label,
    items,
    children,
    onValueSelect,
    className = '',
  },
  forwardedRef,
) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null),
    anchor = useRef<HTMLSpanElement>(null),
    origin = useRef<HTMLElement | null>(null)
  useImperativeHandle(forwardedRef, () => root.current!, [])
  const [point, setPoint] = useState<{ x: number; y: number; key: number } | null>(null)
  const serial = useRef(0)
  useOutside(!!point, root, () => setPoint(null))
  function show(x: number, y: number) {
    origin.current = root.current?.contains(document.activeElement)
      ? (document.activeElement as HTMLElement)
      : root.current
    setPoint({ x, y, key: ++serial.current })
  }
  return (
    <div
      ref={root}
      tabIndex={0}
      role="group"
      aria-label={label}
      className={('al-context ' + className).trim()}
      id={id}
      aria-haspopup="menu"
      aria-controls={point ? id + '-menu' : undefined}
      aria-keyshortcuts="Shift+F10"
      onContextMenu={(e) => {
        if (!items.length || (e.target instanceof Element && e.target.closest('[role=menu]')))
          return
        e.preventDefault()
        show(e.clientX, e.clientY)
      }}
      onKeyDown={(e) => {
        if (!items.length || !(e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey))) return
        e.preventDefault()
        const box = e.currentTarget.getBoundingClientRect()
        show(box.left + 8, Math.max(box.top, 0) + 8)
      }}
    >
      {children}
      {point && (
        <>
          <span
            ref={anchor}
            className="al-context-anchor"
            style={{ left: point.x, top: point.y }}
            aria-hidden="true"
          />
          <ActionList
            key={point.key}
            anchor={anchor}
            id={id + '-menu'}
            labelledBy={id}
            initial="first"
            items={items}
            dismiss={() => {
              origin.current?.focus({ preventScroll: true })
              setPoint(null)
            }}
            onSelect={onValueSelect}
          />
        </>
      )}
    </div>
  )
})
