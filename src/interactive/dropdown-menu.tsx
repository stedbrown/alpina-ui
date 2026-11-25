'use client'
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type Ref, type ReactNode } from 'react'
import { useControllable } from './controllable.js'
import { ActionList, type ActionItem } from './action-list.js'
import { useOutside } from './dismiss.js'
import './dropdown-menu.css'
export interface DropdownMenuItem extends ActionItem {}
export interface DropdownMenuProps {
  label: ReactNode
  triggerLabel?: string
  /** Ref to the trigger button for restoring focus after an external dialog closes. */
  triggerRef?: Ref<HTMLButtonElement>
  /** Logical edge of the trigger used to align the menu. */
  align?: 'start' | 'end'
  /** The compact size reduces the trigger height for fine pointers and retains the touch target. */
  size?: 'regular' | 'compact'
  items: readonly DropdownMenuItem[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onValueSelect?: (value: string) => void
  className?: string
}
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
  {
    label,
    triggerLabel,
    triggerRef,
    align = 'start',
    size = 'regular',
    items,
    open,
    defaultOpen = false,
    onOpenChange,
    onValueSelect,
    className,
  },
  forwardedRef,
) {
  const [requested, change] = useControllable(open, defaultOpen, onOpenChange)
  const visible = requested && items.length > 0
  const id = useId(),
    root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  useImperativeHandle(forwardedRef, () => root.current!, [])
  useImperativeHandle(triggerRef, () => trigger.current!, [])
  const initial = useRef<'first' | 'last'>('first')
  useOutside(visible, root, () => change(false))
  useEffect(() => {
    const node = trigger.current
    if (!visible || !node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) {
        if (root.current?.querySelector('[role="menu"]')?.contains(node.ownerDocument.activeElement))
          node.focus({ preventScroll: true })
        change(false)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, change])
  function dismiss() {
    trigger.current?.focus({ preventScroll: true })
    change(false)
  }
  return (
    <div ref={root} className={['al-dropdown', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        ref={trigger}
        id={id + '-trigger'}
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={visible}
        aria-controls={visible ? id : undefined}
        disabled={!items.length}
        className="al-dropdown-trigger"
        data-size={size}
        onClick={() => {
          initial.current = 'first'
          change(!visible)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            initial.current = e.key === 'ArrowUp' ? 'last' : 'first'
            change(true)
          }
        }}
      >
        {label}
        <span aria-hidden="true" className="al-dropdown-caret" />
      </button>
      {visible && (
        <ActionList
          anchor={trigger}
          align={align}
          items={items}
          id={id}
          labelledBy={id + '-trigger'}
          initial={initial.current}
          dismiss={dismiss}
          onSelect={onValueSelect}
        />
      )}
    </div>
  )
})
