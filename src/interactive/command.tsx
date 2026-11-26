'use client'
import { useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Input } from '../ui/input.js'
import { Dialog } from './dialog.js'
import { useControllable } from './controllable.js'
import { useBrowserLayoutEffect } from './floating.js'
import { filterOptions, type SearchOption } from './search-options.js'
import './command.css'

export interface CommandItem extends SearchOption {
  onSelect?: () => void
}
export interface CommandProps {
  title: string
  trigger?: ReactNode
  closeLabel: string
  searchLabel: string
  empty: string
  items: readonly CommandItem[]
  onValueSelect?: (id: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}
export function Command({
  title,
  trigger,
  closeLabel,
  searchLabel,
  empty,
  items,
  onValueSelect,
  open,
  defaultOpen = false,
  onOpenChange,
}: CommandProps): ReactElement {
  const [visible, change] = useControllable(open, defaultOpen, onOpenChange)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState<string>()
  const list = useId()
  const input = useRef<HTMLInputElement>(null)
  const panel = useRef<HTMLUListElement>(null)
  const results = filterOptions(items, query)
  const enabled = results.filter((item) => !item.disabled)
  const active = enabled.find((item) => item.value === highlight) ?? enabled[0]
  useBrowserLayoutEffect(() => {
    if (visible) return
    setQuery('')
    setHighlight(undefined)
  }, [visible])
  useBrowserLayoutEffect(() => {
    if (visible)
      panel.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' })
  }, [visible, active])
  function run(item: CommandItem) {
    if (item.disabled) return
    // Close and restore focus first, so onSelect may move focus anywhere without the dialog taking it back.
    flushSync(() => change(false))
    item.onSelect?.()
    onValueSelect?.(item.value)
  }
  return (
    <Dialog
      title={title}
      trigger={trigger}
      closeLabel={closeLabel}
      open={visible}
      onOpenChange={change}
      initialFocusRef={input}
      className="al-command"
    >
      <Input
        ref={input}
        role="combobox"
        aria-label={searchLabel}
        placeholder={searchLabel}
        aria-expanded={true}
        aria-controls={list}
        aria-autocomplete="list"
        autoComplete="off"
        value={query}
        aria-activedescendant={active ? list + '-' + results.indexOf(active) : undefined}
        onChange={(e) => {
          setQuery(e.target.value)
          setHighlight(undefined)
        }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.ctrlKey || e.metaKey) return
          if (e.key === 'Enter' && active) {
            e.preventDefault()
            run(active)
          }
          if (!enabled.length || !['ArrowDown', 'ArrowUp'].includes(e.key)) return
          e.preventDefault()
          const index = active ? enabled.indexOf(active) : -1
          setHighlight(
            enabled[(index + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length]!
              .value,
          )
        }}
      />
      <ul ref={panel} id={list} role="listbox" aria-label={searchLabel}>
        {results.map((item, i) => (
          <li
            id={list + '-' + i}
            key={item.value}
            role="option"
            aria-selected={active === item}
            aria-disabled={item.disabled || undefined}
            onPointerMove={(event) => {
              if (event.pointerType === 'mouse' && !item.disabled) setHighlight(item.value)
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(item)}
          >
            <span>{item.label}</span>
            {item.detail && <small>{item.detail}</small>}
          </li>
        ))}
      </ul>
      {!results.length && <p role="status">{empty}</p>}
    </Dialog>
  )
}
