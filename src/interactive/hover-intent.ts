import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type PointerEvent,
  type FocusEvent,
} from 'react'

/** Bridges the positioning gap while allowing unrestricted movement into the panel. */
export function useHoverIntent(
  root: RefObject<HTMLElement | null>,
  delay: number,
  onEscape?: () => void,
) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const over = useRef(false),
    inside = useRef(false),
    pinned = useRef(false)
  const escapeAction = useRef(onEscape)
  escapeAction.current = onEscape
  function clear() {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }
  function close() {
    clear()
    pinned.current = false
    setOpen(false)
  }
  function leave() {
    clear()
    if (!over.current && !inside.current && !pinned.current) timer.current = setTimeout(close, 160)
  }
  useEffect(() => clear, [])
  useEffect(() => {
    if (!open) return
    const node = root.current,
      doc = node?.ownerDocument
    function escape(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      escapeAction.current?.()
      close()
    }
    function outside(e: Event) {
      if (e.target instanceof Node && !node?.contains(e.target)) {
        pinned.current = false
        inside.current = false
        over.current = false
        close()
      }
    }
    doc?.addEventListener('keydown', escape, true)
    doc?.addEventListener('pointerdown', outside, true)
    doc?.addEventListener('focusin', outside, true)
    return () => {
      doc?.removeEventListener('keydown', escape, true)
      doc?.removeEventListener('pointerdown', outside, true)
      doc?.removeEventListener('focusin', outside, true)
    }
  }, [open, root])
  return {
    open,
    togglePin() {
      if (pinned.current) close()
      else {
        clear()
        pinned.current = true
        setOpen(true)
      }
    },
    bindings: {
      onPointerEnter(e: PointerEvent<HTMLElement>) {
        if (e.pointerType === 'touch') return
        over.current = true
        clear()
        if (delay && !open) timer.current = setTimeout(() => setOpen(true), delay)
        else setOpen(true)
      },
      onPointerLeave() {
        over.current = false
        leave()
      },
      onFocus() {
        inside.current = true
        clear()
        setOpen(true)
      },
      onBlur(e: FocusEvent<HTMLElement>) {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
        inside.current = false
        pinned.current = false
        leave()
      },
    },
  }
}
