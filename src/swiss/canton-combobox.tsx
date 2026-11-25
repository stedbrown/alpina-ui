'use client'

import { forwardRef, useImperativeHandle, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useBrowserLayoutEffect, useFloating } from '../interactive/floating.js'
import { Field } from '../ui/field.js'
import { Button } from '../ui/button.js'
import { Input } from '../ui/input.js'
import { cantons, type CantonCode } from './cantons.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'
import './canton-combobox.css'

const strings = {
  'it-CH': [
    'Cantone',
    'Cerca nome o sigla',
    'Nessun cantone trovato.',
    'Cancella la scelta',
    'Scegli un cantone.',
  ],
  'de-CH': [
    'Kanton',
    'Name oder Kürzel suchen',
    'Kein Kanton gefunden.',
    'Auswahl löschen',
    'Wählen Sie einen Kanton.',
  ],
  'fr-CH': [
    'Canton',
    'Rechercher un nom ou un sigle',
    'Aucun canton trouvé.',
    'Effacer la sélection',
    'Choisissez un canton.',
  ],
  'rm-CH': [
    'Chantun',
    'Tschertgar il num u la scursanida',
    'Nagins chantuns chattads.',
    'Stizzar la selecziun',
    'Tscherni in chantun.',
  ],
} as const

function normalize(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

const searchIndex = cantons.map((canton) => ({
  canton,
  terms: [canton.code, ...Object.values(canton.names)].map(normalize),
}))

function matches(query: string) {
  const key = normalize(query)
  if (!key) return cantons
  const tokens = key.split(' ')
  return searchIndex
    .filter(({ terms }) => terms.some((term) => tokens.every((token) => term.includes(token))))
    .map(({ canton }) => canton)
    .sort((a, b) => Number(b.code === key.toUpperCase()) - Number(a.code === key.toUpperCase()))
}

export interface CantonComboboxProps {
  locale?: SwissLocale
  value?: CantonCode | ''
  defaultValue?: CantonCode | ''
  onCantonChange?: (code: CantonCode | '') => void
  id?: string
  name?: string
  label?: string
  description?: string
  error?: string
  placeholder?: string
  noResults?: string
  clearLabel?: string
  requiredMessage?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export const CantonCombobox = forwardRef<HTMLInputElement, CantonComboboxProps>(function CantonCombobox(
  {
    locale = defaultSwissLocale,
    value,
    defaultValue = '',
    onCantonChange,
    id,
    name,
    label,
    description,
    error,
    placeholder,
    noResults,
    clearLabel,
    requiredMessage,
    disabled = false,
    required = false,
    className,
  },
  forwardedRef,
) {
  const [nativeLabel, nativePlaceholder, emptyMessage, clearMessage, missingMessage] = strings[locale]
  const generated = useId()
  const inputId = id ?? generated
  const listId = inputId + '-options'
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(forwardedRef, () => input.current!, [])
  const panel = useRef<HTMLDivElement>(null)
  const options = useRef<HTMLUListElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const [local, setLocal] = useState(defaultValue)
  const chosen = value ?? local
  const [open, setOpen] = useState(false)
  // A null query shows the committed value and leaves the full list available.
  const [query, setQuery] = useState<string | null>(null)
  const [active, setActive] = useState<CantonCode | null>(null)
  const [attempted, setAttempted] = useState(false)
  const selected = cantons.find((item) => item.code === chosen)
  const visible = open && !disabled
  const results = matches(query ?? '')
  const requiredError = required && !selected ? (requiredMessage ?? missingMessage) : ''
  const display = query ?? (selected ? selected.names[locale] + ' (' + selected.code + ')' : '')
  useFloating(visible, anchor, panel, 'combobox')

  function close() {
    setOpen(false)
    setQuery(null)
    setActive(null)
  }

  function commit(code: CantonCode | '') {
    if (value === undefined) setLocal(code)
    if (chosen !== code) onCantonChange?.(code)
    setAttempted(false)
    close()
    input.current?.focus()
  }

  useBrowserLayoutEffect(() => {
    input.current?.setCustomValidity(disabled ? '' : requiredError)
  }, [requiredError, disabled])

  useBrowserLayoutEffect(() => {
    if (!visible || !active) return
    const list = options.current
    const option = list?.querySelector<HTMLElement>('[data-code="' + active + '"]')
    if (!list || !option) return
    const viewport = list.getBoundingClientRect()
    const target = option.getBoundingClientRect()
    if (target.bottom > viewport.bottom) list.scrollTop += target.bottom - viewport.bottom + 2
    if (target.top < viewport.top) list.scrollTop -= viewport.top - target.top + 2
  }, [visible, active, locale, query])

  useEffect(() => {
    if (disabled) close()
  }, [disabled])

  useEffect(() => {
    const form = input.current?.form
    if (!form) return
    function reset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return
        if (value === undefined) setLocal(defaultValue)
        setAttempted(false)
        close()
      })
    }
    form.addEventListener('reset', reset)
    return () => form.removeEventListener('reset', reset)
  }, [value, defaultValue])

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey) return
    if (event.key === 'Escape' && visible) {
      event.preventDefault()
      event.stopPropagation()
      close()
    } else if (event.key === 'Tab') {
      close()
    } else if (event.key === 'Enter' && visible) {
      event.preventDefault()
      if (active) commit(active)
      else close()
    } else if (event.altKey && event.key === 'ArrowUp') {
      if (visible) {
        event.preventDefault()
        close()
      }
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (event.altKey || !results.length) return
      const previous = visible ? results.findIndex(({ code }) => code === active) : -1
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const next =
        previous === -1 && direction < 0
          ? results.length - 1
          : (previous + direction + results.length) % results.length
      setActive(results[next]!.code)
    }
  }

  return (
    <Field
      id={inputId}
      lang={locale}
      className={['al-canton-combo', className].filter(Boolean).join(' ')}
      label={label ?? nativeLabel}
      description={description}
      error={error ?? (attempted ? requiredError : undefined)}
    >
      {(control) => (
        <div ref={anchor} className="al-canton-anchor">
          <Input
            {...control}
            ref={input}
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            value={display}
            required={required}
            disabled={disabled}
            placeholder={placeholder ?? nativePlaceholder}
            aria-autocomplete="list"
            aria-expanded={visible}
            aria-controls={visible ? listId : undefined}
            aria-activedescendant={visible && active ? listId + '-' + active : undefined}
            onFocus={(event) => event.currentTarget.select()}
            onClick={() => {
              if (!visible) {
                setOpen(true)
                setActive(chosen || null)
              }
            }}
            onBlur={close}
            onInvalid={() => setAttempted(true)}
            onKeyDown={keyDown}
            onChange={(event) => {
              const next = event.currentTarget.value
              setQuery(next)
              setOpen(true)
              setActive(matches(next)[0]?.code ?? null)
            }}
          />
          {chosen ? (
            <Button
              variant="ghost"
              size="sm"
              className="al-canton-clear"
              aria-label={clearLabel ?? clearMessage}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commit('')}
            >
              <span aria-hidden="true">×</span>
            </Button>
          ) : (
            <span className="al-canton-chevron" aria-hidden="true" />
          )}
          {name && <input type="hidden" name={name} value={chosen} disabled={disabled} />}
          {visible && (
            <div ref={panel} className="al-canton-popup" onMouseDown={(event) => event.preventDefault()}>
              <ul
                ref={options}
                id={listId}
                role="listbox"
                aria-label={label ?? nativeLabel}
                className="al-canton-options"
              >
                {results.map((item) => (
                  <li
                    id={listId + '-' + item.code}
                    key={item.code}
                    data-code={item.code}
                    role="option"
                    aria-selected={item.code === chosen}
                    data-active={item.code === active}
                    data-committed={item.code === chosen}
                    onClick={() => commit(item.code)}
                  >
                    <span>{item.names[locale]}</span>
                    <span className="al-canton-code">{item.code}</span>
                  </li>
                ))}
              </ul>
              {!results.length && (
                <div role="status" className="al-canton-empty">
                  {noResults ?? emptyMessage}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Field>
  )
})
