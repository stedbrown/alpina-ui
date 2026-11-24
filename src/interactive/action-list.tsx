'use client'
import { Fragment, useRef, type ReactElement, type KeyboardEvent, type RefObject } from 'react'
import { navigationIndex } from './navigation.js'
import { foldText } from './search-options.js'
import { useBrowserLayoutEffect, useFloating } from './floating.js'
import './dropdown-menu.css'

export interface ActionItem {
  value: string
  label: string
  disabled?: boolean
  /** Visually identifies an action that can remove or discard data. */
  tone?: 'default' | 'danger'
  /** Starts a new block of actions in the menu. Ignored for the first item. */
  separatorBefore?: boolean
  onSelect?: () => void
}
interface ActionListProps {
  anchor: RefObject<HTMLElement | null>
  align?: 'start' | 'end'
  items: readonly ActionItem[]
  id: string
  labelledBy: string
  initial: 'first' | 'last'
  dismiss: () => void
  onSelect?: (value: string) => void
  onHorizontal?: (key: string) => void
}
export function ActionList({
  anchor,
  align = 'start',
  items,
  id,
  labelledBy,
  initial,
  dismiss,
  onSelect,
  onHorizontal,
}: ActionListProps): ReactElement {
  const menu = useRef<HTMLDivElement>(null)
  const initialFocus = useRef(initial)
  const search = useRef({ term: '', time: 0 })
  useFloating(true, anchor, menu, 'menu', align)
  function focusAction(target: HTMLButtonElement | undefined) {
    const panel = menu.current
    if (!target || !panel) return
    target.focus({ preventScroll: true })
    const bounds = panel.getBoundingClientRect()
    const item = target.getBoundingClientRect()
    const top = bounds.top + panel.clientTop
    const bottom = top + panel.clientHeight
    if (item.bottom > bottom) panel.scrollTop += item.bottom - bottom
    else if (item.top < top) panel.scrollTop -= top - item.top
  }
  useBrowserLayoutEffect(() => {
    const targets = menu.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]')
    if (targets) focusAction(targets[initialFocus.current === 'last' ? targets.length - 1 : 0])
  }, [])
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
      }
      dismiss()
      return
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) return
    if (onHorizontal && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()
      onHorizontal(event.key)
      return
    }
    const targets = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=menuitem]'),
    )
    const current = targets.indexOf(event.target as HTMLButtonElement)
    const next = navigationIndex(event.key, current, targets.length, 'vertical')
    if (next !== undefined) {
      event.preventDefault()
      focusAction(targets[next])
      return
    }
    if (event.key.length !== 1 || event.key === ' ') return
    event.preventDefault()
    const now = Date.now(),
      query = (now - search.current.time < 650 ? search.current.term : '') + foldText(event.key)
    search.current = { term: query, time: now }
    const term = [...query].every((c) => c === query[0]) ? query[0]! : query
    for (let step = 1; step <= targets.length; step++) {
      const index = (current + step) % targets.length
      if (foldText(items[index]!.label).startsWith(term)) {
        focusAction(targets[index])
        break
      }
    }
  }
  return (
    <div
      role="menu"
      ref={menu}
      className="al-dropdown-panel"
      id={id}
      aria-labelledby={labelledBy}
      onKeyDown={navigate}
    >
      {items.map((item, i) => (
        <Fragment key={item.value}>
          {i > 0 && item.separatorBefore && <div role="separator" className="al-dropdown-rule" />}
          <button
            type="button"
            role="menuitem"
            className="al-dropdown-item"
            tabIndex={-1}
            data-tone={item.tone === 'danger' ? 'danger' : undefined}
            onPointerMove={(event) => {
              if (
                event.pointerType === 'mouse' &&
                event.currentTarget !== event.currentTarget.ownerDocument.activeElement
              )
                event.currentTarget.focus({ preventScroll: true })
            }}
            aria-disabled={item.disabled || undefined}
            onClick={() => {
              if (item.disabled) return
              dismiss()
              item.onSelect?.()
              onSelect?.(item.value)
            }}
          >
            <span>{item.label}</span>
            {item.tone === 'danger' && (
              <span className="al-dropdown-danger-mark" aria-hidden="true">
                −
              </span>
            )}
          </button>
        </Fragment>
      ))}
    </div>
  )
}
