'use client'

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Button } from '../ui/button.js'
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
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (values: string[]) => void
  name?: string
  disabled?: boolean
  className?: string
}

export function ToggleGroup({
  label,
  options,
  multiple = false,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  className = '',
}: ToggleGroupProps): ReactElement {
  const [local, setLocal] = useState<readonly string[]>(defaultValue ?? [])
  const selected = value ?? local
  const root = useRef<HTMLDivElement>(null)
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
      className={('al-toggle-group ' + className).trim()}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          disabled={disabled || option.disabled}
          aria-pressed={selected.includes(option.value)}
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
}
