'use client'
import { useId, useRef, useState, type ReactElement } from 'react'
import { ActionList, type ActionItem } from './action-list.js'
import { useOutside } from './dismiss.js'
import { navigationIndex } from './navigation.js'
import './menubar.css'
export interface MenubarGroup {
  value: string
  label: string
  items: readonly ActionItem[]
}
export interface MenubarProps {
  label: string
  menus: readonly MenubarGroup[]
  onValueSelect?: (value: string) => void
}
export function Menubar({ label, menus, onValueSelect }: MenubarProps): ReactElement {
  const id = useId(),
    root = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState(0)
  const [open, setOpen] = useState<string | null>(null)
  const initial = useRef<'first' | 'last'>('first')
  const trigger = useRef<HTMLButtonElement | null>(null)
  useOutside(!!open, root, () => setOpen(null))
  function target(index: number) {
    return root.current?.querySelectorAll<HTMLButtonElement>('.al-menubar-trigger')[index]
  }
  function move(key: string, index: number, openNext: boolean) {
    const rtl = root.current && getComputedStyle(root.current).direction === 'rtl'
    const next = navigationIndex(key, index, menus.length, 'horizontal', !!rtl)
    if (next === undefined) return
    const button = target(next)
    button?.focus({ preventScroll: true })
    setFocus(next)
    if (openNext) {
      initial.current = 'first'
      trigger.current = button ?? null
      setOpen(menus[next]?.items.length ? menus[next]!.value : null)
    }
  }
  return (
    <div ref={root} role="menubar" aria-label={label} className="al-menubar">
      {menus.map((group, i) => {
        const expanded = open === group.value && !!group.items.length
        function reveal(where: 'first' | 'last') {
          if (!group.items.length) return
          trigger.current = target(i) ?? null
          initial.current = where
          setOpen(group.value)
        }
        return (
          <div key={group.value} role="none">
            <button
              type="button"
              className="al-menubar-trigger"
              role="menuitem"
              id={id + '-' + i}
              aria-haspopup="menu"
              aria-disabled={!group.items.length || undefined}
              aria-expanded={expanded}
              aria-controls={expanded ? id + '-menu' : undefined}
              tabIndex={i === Math.min(focus, menus.length - 1) ? 0 : -1}
              onFocus={() => setFocus(i)}
              onClick={() => (expanded ? setOpen(null) : reveal('first'))}
              onKeyDown={(e) => {
                if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
                  e.preventDefault()
                  move(e.key, i, false)
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  reveal(e.key === 'ArrowUp' ? 'last' : 'first')
                }
              }}
            >
              {group.label}
            </button>
            {expanded && (
              <ActionList
                anchor={trigger}
                id={id + '-menu'}
                labelledBy={id + '-' + i}
                items={group.items}
                initial={initial.current}
                dismiss={() => {
                  target(i)?.focus({ preventScroll: true })
                  setOpen(null)
                }}
                onSelect={onValueSelect}
                onHorizontal={(key) => move(key, i, true)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
