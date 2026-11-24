'use client'
import { useEffect, useRef, useState, type ReactNode, type ReactElement } from 'react'
import './toast.css'

export interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  closeLabel: string
  children: ReactNode
  urgency?: 'polite' | 'assertive'
  tone?: 'neutral' | 'success' | 'danger'
  /** Optional timeout in ms. Hover, keyboard focus and hidden documents pause the countdown. */
  duration?: number
  className?: string
}
export function Toast({
  open,
  onOpenChange,
  closeLabel,
  children,
  urgency = 'polite',
  tone = 'neutral',
  duration,
  className,
}: ToastProps): ReactElement {
  const [ready, setReady] = useState(false),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false),
    [hidden, setHidden] = useState(false)
  const previous = useRef<HTMLElement | null>(null),
    remaining = useRef(0)
  const change = useRef(onOpenChange)
  change.current = onOpenChange
  useEffect(() => {
    setReady(true)
  }, [])
  useEffect(() => {
    if (!open) {
      setHovered(false)
      setFocused(false)
      return
    }
    const update = () => setHidden(document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [open])
  useEffect(() => {
    remaining.current = duration ?? 0
  }, [duration, open])
  useEffect(() => {
    if (
      !open ||
      !duration ||
      duration < 0 ||
      !Number.isFinite(duration) ||
      hovered ||
      focused ||
      hidden
    )
      return
    const start = performance.now()
    const timer = setTimeout(() => change.current(false), remaining.current)
    return () => {
      clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (performance.now() - start))
    }
  }, [open, duration, hovered, focused, hidden])
  return (
    <div
      className={['al-toast', className].filter(Boolean).join(' ')}
      data-visible={open}
      data-tone={tone}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={(e) => {
        setFocused(true)
        if (e.relatedTarget instanceof HTMLElement && !e.currentTarget.contains(e.relatedTarget))
          previous.current = e.relatedTarget
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div
        role={urgency === 'assertive' ? 'alert' : 'status'}
        aria-atomic="true"
        className="al-toast-message"
      >
        {open && ready ? children : null}
      </div>
      {open && (
        <button
          type="button"
          className="al-toast-dismiss"
          aria-label={closeLabel}
          onClick={() => {
            if (previous.current?.isConnected) previous.current.focus({ preventScroll: true })
            onOpenChange(false)
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}
