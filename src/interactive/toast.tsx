'use client'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
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
      previous.current = null
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
  function dismiss() {
    if (previous.current?.isConnected) previous.current.focus({ preventScroll: true })
    onOpenChange(false)
  }
  return (
    <div
      className={['al-toast', className].filter(Boolean).join(' ')}
      data-visible={open}
      data-tone={tone}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault()
          event.stopPropagation()
          dismiss()
        }
      }}
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
          onClick={dismiss}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}

export type ToastOptions = Pick<ToastProps, 'tone' | 'duration' | 'urgency'>
type QueuedToast = ToastOptions & { id: number; message: ReactNode }

const emptyQueue: readonly QueuedToast[] = []
let queue = emptyQueue
let sequence = 0
const listeners = new Set<() => void>()
function updateQueue(next: readonly QueuedToast[]) {
  queue = next
  listeners.forEach(notify => notify())
}
function subscribe(notify: () => void) {
  listeners.add(notify)
  return () => { listeners.delete(notify) }
}

/** Queue a browser notification. The returned function cancels or dismisses it. */
export function toast(message: ReactNode, options: ToastOptions = {}): () => void {
  if (typeof document === 'undefined') throw new Error('Call toast() from a browser event.')
  const id = ++sequence
  updateQueue([...queue, { ...options, id, message }])
  return () => dismissToast(id)
}

function dismissToast(id: number) {
  if (queue.some(item => item.id === id)) updateQueue(queue.filter(item => item.id !== id))
}

export interface ToasterProps {
  /** Localized label for the dismiss button. */
  closeLabel: string
  /** Default timeout in milliseconds. Omit to keep each message until dismissed. */
  duration?: number
}

/** Mount once per application. Only the first message counts down or announces. */
export function Toaster({ closeLabel, duration }: ToasterProps) {
  const pending = useSyncExternalStore(subscribe, currentQueue, () => emptyQueue)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const first = pending[0]
  if (!mounted) return null
  return createPortal(<div className="al-toaster">
    {first && <Toast key={first.id} open tone={first.tone} urgency={first.urgency}
      duration={first.duration ?? duration} closeLabel={closeLabel}
      onOpenChange={open => { if (!open) dismissToast(first.id) }}>{first.message}</Toast>}
  </div>, document.body)
}

function currentQueue() { return queue }
