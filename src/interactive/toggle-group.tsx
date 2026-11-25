'use client'

import { forwardRef, useImperativeHandle, useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../ui/button.js'
import { moveButton } from './roving.js'
import './toggle-group.css'

export interface ToggleOption {
  value: string
  label: ReactNode
  disabled?: boolean
}
export interface ToggleGroupProps {
  label: string
  options: readonly ToggleOption[]
  multiple?: boolean
  /** A responsive sheet of equal-width choices. Row layout wraps to fit by default. */
  layout?: 'row' | 'grid'
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (values: string[]) => void
  name?: string
  disabled?: boolean
  className?: string
}

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  {
    label,
    options,
    multiple = false,
    layout = 'row',
    value,
    defaultValue,
    onValueChange,
    name,
    disabled,
    className = '',
  },
  forwardedRef,
) {
  const [local, setLocal] = useState<readonly string[]>(defaultValue ?? [])
  const selected = value ?? local
  const [focused, setFocused] = useState<string | null>(null)
  const enabled = options.filter((option) => !option.disabled)
  const tabstop = enabled.find((option) => option.value === focused)
    ?? enabled.find((option) => selected.includes(option.value))
    ?? enabled[0]
  const root = useRef<HTMLDivElement>(null)
  useImperativeHandle(forwardedRef, () => root.current!, [])
  useEffect(() => {
    const form = root.current?.closest('form')
    function reset(event: Event) {
      queueMicrotask(() => {
        if (!event.defaultPrevented && value === undefined) setLocal(defaultValue ?? [])
      })
    }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [defaultValue, value])

  function toggle(key: string) {
    const next = selected.includes(key)
      ? selected.filter((item) => item !== key)
      : multiple
        ? [...selected, key]
        : [key]
    if (value === undefined) setLocal(next)
    onValueChange?.(next)
  }

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      data-al-roving=""
      data-layout={layout}
      onKeyDown={(event) => {
        const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
        if (layout !== 'grid' || !direction) {
          moveButton(event, 'horizontal')
          return
        }
        const current = event.target
        if (!(current instanceof HTMLButtonElement) || current.parentElement !== event.currentTarget ||
          event.altKey || event.ctrlKey || event.metaKey) return
        const choices = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(':scope > button:enabled'))
        const rowsAhead = choices.filter(choice => (choice.offsetTop - current.offsetTop) * direction > 0)
        const nextRow = direction === 1 ? Math.min : Math.max
        const rowTop = nextRow(...(rowsAhead.length ? rowsAhead : choices).map(choice => choice.offsetTop))
        const row = choices.filter(choice => choice.offsetTop === rowTop)
        const nearest = row.reduce((best, choice) => Math.abs(choice.offsetLeft - current.offsetLeft) <
          Math.abs(best.offsetLeft - current.offsetLeft) ? choice : best, row[0])
        event.preventDefault()
        nearest?.focus()
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null)
      }}
      className={('al-toggle-group ' + className).trim()}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          disabled={disabled || option.disabled}
          aria-pressed={selected.includes(option.value)}
          data-al-choice={option.value}
          tabIndex={option === tabstop ? 0 : -1}
          onFocus={() => setFocused(option.value)}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </Button>
      ))}
      {name &&
        options
          .filter((option) => !option.disabled && selected.includes(option.value))
          .map((option) => (
            <input
              type="hidden"
              key={option.value}
              name={name}
              value={option.value}
              disabled={disabled}
            />
          ))}
    </div>
  )
})
