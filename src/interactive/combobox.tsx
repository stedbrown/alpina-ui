'use client'

import { useEffect, useId, useRef, useState, type ReactElement } from 'react'
import { Field } from '../ui/field.js'
import { Input } from '../ui/input.js'
import { Button } from '../ui/button.js'
import { useBrowserLayoutEffect, useFloating } from './floating.js'
import { useControllable } from './controllable.js'
import { filterOptions, type SearchOption } from './search-options.js'
import './combobox.css'

export interface ComboboxOption extends SearchOption {}
export interface ComboboxProps {
  label: string
  options: readonly ComboboxOption[]
  empty: string
  placeholder?: string
  description?: string
  error?: string
  name?: string
  id?: string
  required?: boolean
  requiredMessage?: string
  /** Accessible name for the optional button that clears a committed choice. */
  clearLabel?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
}
export function Combobox({
  label,
  options,
  empty,
  placeholder,
  description,
  error,
  id,
  name,
  required,
  requiredMessage = 'Choose an option.',
  clearLabel,
  disabled,
  value,
  defaultValue = '',
  onValueChange,
  className,
}: ComboboxProps): ReactElement {
  const [selected, choose] = useControllable(value, defaultValue, onValueChange)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)
  const generated = useId()
  const inputId = id ?? generated
  const listId = inputId + '-list'
  const wrapper = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const chosen = options.find((item) => item.value === selected && !item.disabled)
  const results = filterOptions(options, query ?? '')
  const enabled = results.filter((option) => !option.disabled)
  const active = enabled.find((option) => option.value === highlight)
  const expanded = open && !disabled
  useFloating(!!expanded, wrapper, panel, 'combobox')
  function close() {
    setOpen(false)
    setQuery(null)
    setHighlight(null)
  }
  function commit(item: ComboboxOption) {
    if (item.disabled) return
    choose(item.value)
    setAttempted(false)
    close()
  }
  useBrowserLayoutEffect(() => {
    input.current?.setCustomValidity(
      required && !chosen && !disabled ? requiredMessage : '',
    )
  }, [required, chosen, disabled, requiredMessage])
  useBrowserLayoutEffect(() => {
    if (expanded && active)
      panel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [expanded, active])
  useEffect(() => {
    const form = input.current?.form
    function reset(event: Event) {
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          if (value === undefined) choose(defaultValue)
          close()
          setAttempted(false)
        }
      })
    }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [value, defaultValue, choose])
  return (
    <Field
      id={inputId}
      label={label}
      description={description}
      error={error ?? (attempted && !chosen && required ? requiredMessage : undefined)}
      className={className}
    >
      {(control) => (
        <div className="al-combo" ref={wrapper}>
          <Input
            {...control}
            ref={input}
            autoComplete="off"
            role="combobox"
            aria-expanded={!!expanded}
            aria-autocomplete="list"
            aria-controls={expanded ? listId : undefined}
            aria-activedescendant={
              expanded && active ? listId + '-' + results.indexOf(active) : undefined
            }
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            spellCheck={false}
            value={query ?? chosen?.label ?? ''}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={close}
            onInvalid={() => setAttempted(true)}
            onClick={() => {
              setOpen(true)
              setHighlight(selected)
            }}
            onChange={(e) => {
              const text = e.target.value
              setQuery(text)
              setHighlight(
                filterOptions(options, text).find((option) => !option.disabled)?.value ?? null,
              )
              setOpen(true)
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.ctrlKey || e.metaKey) return
              if (e.key === 'Escape' && expanded) {
                e.preventDefault()
                e.stopPropagation()
                close()
              } else if (e.key === 'Tab') {
                close()
              } else if (e.key === 'Enter' && expanded) {
                e.preventDefault()
                if (active) commit(active)
                else close()
              } else if (e.altKey && e.key === 'ArrowUp') {
                if (expanded) {
                  e.preventDefault()
                  close()
                }
              } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                setOpen(true)
                if (e.altKey) return
                if (!enabled.length) return
                const index = active && expanded ? enabled.indexOf(active) : -1
                const next =
                  e.key === 'ArrowDown'
                    ? (index + 1) % enabled.length
                    : index < 1
                      ? enabled.length - 1
                      : index - 1
                setHighlight(enabled[next]!.value)
              }
            }}
          />
          {clearLabel && chosen ? (
            <Button size="sm" variant="ghost" className="al-combo-clear" aria-label={clearLabel} disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                choose('')
                setAttempted(false)
                close()
                input.current?.focus({ preventScroll: true })
              }}>×</Button>
          ) : <span aria-hidden="true" className="al-combo-glyph" />}
          {name && (
            <input type="hidden" name={name} disabled={disabled} value={chosen?.value ?? ''} />
          )}
          {expanded && (
            <div ref={panel} className="al-combo-popup" onMouseDown={(e) => e.preventDefault()}>
              <ul role="listbox" aria-label={label} id={listId}>
                {results.map((option, i) => (
                  <li
                    role="option"
                    aria-disabled={option.disabled || undefined}
                    key={option.value}
                    aria-selected={option === active}
                    data-active={option === active}
                    id={listId + '-' + i}
                    onClick={() => commit(option)}
                  >
                    <span>{option.label}</span>
                    {option.detail && <small>{option.detail}</small>}
                  </li>
                ))}
              </ul>
              {!results.length && <p role="status">{empty}</p>}
            </div>
          )}
        </div>
      )}
    </Field>
  )
}
