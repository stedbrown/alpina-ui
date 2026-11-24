'use client'
import { useId, useState, type ReactNode, type ReactElement } from 'react'
import { useControllable } from './controllable.js'
import { moveButton } from './roving.js'
import './tabs.css'
export interface TabItem {
  value: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}
export interface TabsProps {
  label: string
  items: readonly TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  activation?: 'automatic' | 'manual'
  className?: string
}
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  activation = 'automatic',
  className,
}: TabsProps): ReactElement {
  const first = items.find((item) => !item.disabled)?.value
  const [requested, select] = useControllable(value, defaultValue ?? first ?? '', onValueChange)
  const selected = items.some((item) => !item.disabled && item.value === requested)
    ? requested
    : first
  const [focused, setFocused] = useState<string | null>(null)
  const tabstop = items.some((item) => !item.disabled && item.value === focused)
    ? focused
    : selected
  const prefix = useId()
  return (
    <div
      className={['al-tabs', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
    >
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        className="al-tab-list"
        data-al-roving=""
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null)
        }}
        onKeyDown={(event) => {
          const next = moveButton(event, orientation)
          if (next && activation === 'automatic') select(next.dataset.alChoice!)
        }}
      >
        {items.map((item) => {
          const key = encodeURIComponent(item.value)
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              className="al-tab"
              data-al-choice={item.value}
              id={prefix + '-tab-' + key}
              aria-controls={prefix + '-panel-' + key}
              aria-selected={item.value === selected}
              tabIndex={item.value === tabstop ? 0 : -1}
              disabled={item.disabled}
              onFocus={() => setFocused(item.value)}
              onClick={() => select(item.value)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item) => {
        const key = encodeURIComponent(item.value)
        return (
          <div
            key={item.value}
            className="al-tab-panel"
            role="tabpanel"
            id={prefix + '-panel-' + key}
            aria-labelledby={prefix + '-tab-' + key}
            hidden={item.value !== selected}
            tabIndex={0}
          >
            {item.content}
          </div>
        )
      })}
    </div>
  )
}
