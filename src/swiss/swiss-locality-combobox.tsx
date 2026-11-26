'use client'

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type KeyboardEvent } from 'react'
import { useBrowserLayoutEffect, useFloating } from '../interactive/floating.js'
import { Button } from '../ui/button.js'
import { Field } from '../ui/field.js'
import { Input } from '../ui/input.js'
import type { CantonCode } from './cantons.js'
import { useMessageLocale } from './locale-context.internal.js'
import type { SwissMessageLocale } from './locales.js'
import { searchSwissLocalities, type SwissLocality } from './postal-localities.js'
import './swiss-locality-combobox.css'

// Label, placeholder, no results, clear, required, municipality.
const strings = {
  'it-CH': ['Località', 'NPA o località', 'Nessuna località trovata.', 'Cancella la scelta', 'Scegli una località.', 'Comune'],
  'de-CH': ['Ort', 'PLZ oder Ort', 'Kein Ort gefunden.', 'Auswahl löschen', 'Wählen Sie einen Ort.', 'Gemeinde'],
  'fr-CH': ['Localité', 'NPA ou localité', 'Aucune localité trouvée.', 'Effacer la sélection', 'Choisissez une localité.', 'Commune'],
  'rm-CH': ['Lieu', 'NPA u lieu', 'Nagins lieus chattads.', 'Stizzar la selecziun', 'Tscherni in lieu.', 'Vischnanca'],
  en: ['Locality', 'Postcode or locality', 'No locality found.', 'Clear the selection', 'Choose a locality.', 'Municipality'],
} as const

const key = (item: SwissLocality) => item.postalCode + '-' + item.bfsNumber + '-' + item.locality
const same = (a: SwissLocality | null | undefined, b: SwissLocality | null | undefined) =>
  !!a && !!b && key(a) === key(b)

export interface SwissLocalityComboboxProps {
  locale?: SwissMessageLocale
  /** The committed locality. Pass null for an empty controlled field. */
  value?: SwissLocality | null
  defaultValue?: SwissLocality | null
  onLocalityChange?: (locality: SwissLocality | null) => void
  /** Restricts suggestions to one canton. */
  canton?: CantonCode
  /** Maximum number of suggestions. Defaults to 8. */
  limit?: number
  id?: string
  /**
   * Submits the choice as name.postalCode, name.locality, name.municipality, name.bfsNumber and
   * name.canton.
   */
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

/** Finds a Swiss locality by postcode or name and returns its municipality, BFS number and canton. */
export const SwissLocalityCombobox = forwardRef<HTMLInputElement, SwissLocalityComboboxProps>(
  function SwissLocalityCombobox(
    {
      locale: requestedLocale,
      value,
      defaultValue = null,
      onLocalityChange,
      canton,
      limit = 8,
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
    const locale = useMessageLocale(requestedLocale, 'it-CH')
    const [nativeLabel, nativePlaceholder, emptyMessage, clearMessage, missingMessage, municipalityLabel] =
      strings[locale]
    const generated = useId()
    const inputId = id ?? generated
    const listId = inputId + '-options'
    const input = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => input.current!, [])
    const panel = useRef<HTMLDivElement>(null)
    const options = useRef<HTMLUListElement>(null)
    const anchor = useRef<HTMLDivElement>(null)
    const request = useRef(0)
    const [local, setLocal] = useState(defaultValue)
    const chosen = value === undefined ? local : value
    // A null query shows the committed locality.
    const [query, setQuery] = useState<string | null>(null)
    const [results, setResults] = useState<readonly SwissLocality[]>([])
    const [searched, setSearched] = useState(false)
    const [active, setActive] = useState<number>(-1)
    const [attempted, setAttempted] = useState(false)
    const visible = !disabled && query !== null && query.trim() !== '' && searched
    const requiredError = required && !chosen ? (requiredMessage ?? missingMessage) : ''
    const display = query ?? (chosen ? chosen.postalCode + ' ' + chosen.locality : '')
    useFloating(visible, anchor, panel, 'combobox')

    function close() {
      request.current++
      setQuery(null)
      setResults([])
      setSearched(false)
      setActive(-1)
    }

    function commit(next: SwissLocality | null) {
      if (value === undefined) setLocal(next)
      if (!(same(chosen, next) || (!chosen && !next))) onLocalityChange?.(next)
      setAttempted(false)
      close()
      input.current?.focus()
    }

    function search(text: string) {
      setQuery(text)
      const current = ++request.current
      if (!text.trim()) {
        setResults([])
        setSearched(false)
        setActive(-1)
        return
      }
      searchSwissLocalities(text, { limit, canton }).then(
        (found) => {
          if (current !== request.current) return
          setResults(found)
          setSearched(true)
          setActive(found.length ? 0 : -1)
        },
        () => {
          if (current !== request.current) return
          setResults([])
          setSearched(true)
          setActive(-1)
        },
      )
    }

    useBrowserLayoutEffect(() => {
      input.current?.setCustomValidity(disabled ? '' : requiredError)
    }, [requiredError, disabled])

    useBrowserLayoutEffect(() => {
      if (!visible || active < 0) return
      const list = options.current
      const option = list?.children[active] as HTMLElement | undefined
      if (!list || !option) return
      const viewport = list.getBoundingClientRect()
      const target = option.getBoundingClientRect()
      if (target.bottom > viewport.bottom) list.scrollTop += target.bottom - viewport.bottom + 2
      if (target.top < viewport.top) list.scrollTop -= viewport.top - target.top + 2
    }, [visible, active])

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
      if (event.key === 'Escape' && query !== null) {
        event.preventDefault()
        event.stopPropagation()
        close()
      } else if (event.key === 'Tab') {
        close()
      } else if (event.key === 'Enter' && visible) {
        event.preventDefault()
        if (active >= 0 && results[active]) commit(results[active]!)
        else close()
      } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && visible && results.length) {
        event.preventDefault()
        const direction = event.key === 'ArrowDown' ? 1 : -1
        setActive((active + direction + results.length) % results.length)
      }
    }

    return (
      <Field
        id={inputId}
        lang={locale === 'en' ? undefined : locale}
        className={['al-locality-combo', className].filter(Boolean).join(' ')}
        label={label ?? nativeLabel}
        description={description}
        error={error ?? (attempted ? requiredError : undefined)}
      >
        {(control) => (
          <div ref={anchor} className="al-locality-anchor">
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
              aria-activedescendant={visible && active >= 0 ? listId + '-' + active : undefined}
              onFocus={(event) => event.currentTarget.select()}
              onBlur={close}
              onInvalid={() => setAttempted(true)}
              onKeyDown={keyDown}
              onChange={(event) => search(event.currentTarget.value)}
            />
            {chosen && (
              <Button
                variant="ghost"
                size="sm"
                className="al-locality-clear"
                aria-label={clearLabel ?? clearMessage}
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commit(null)}
              >
                <span aria-hidden="true">×</span>
              </Button>
            )}
            {name &&
              (
                [
                  ['postalCode', chosen?.postalCode],
                  ['locality', chosen?.locality],
                  ['municipality', chosen?.municipality],
                  ['bfsNumber', chosen?.bfsNumber],
                  ['canton', chosen?.canton],
                ] as const
              ).map(([field, data]) => (
                <input key={field} type="hidden" name={name + '.' + field} value={data ?? ''} disabled={disabled} />
              ))}
            {visible && (
              <div ref={panel} className="al-locality-popup" onMouseDown={(event) => event.preventDefault()}>
                {results.length > 0 && (
                  <ul
                    ref={options}
                    id={listId}
                    role="listbox"
                    aria-label={label ?? nativeLabel}
                    className="al-locality-options"
                  >
                    {results.map((item, index) => (
                      <li
                        id={listId + '-' + index}
                        key={key(item)}
                        role="option"
                        aria-selected={same(item, chosen)}
                        data-active={index === active}
                        data-committed={same(item, chosen)}
                        onClick={() => commit(item)}
                      >
                        <span className="al-locality-name">
                          <span className="al-locality-code">{item.postalCode}</span> {item.locality}
                        </span>
                        <span className="al-locality-detail">
                          {municipalityLabel} {item.municipality} · {item.canton}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {!results.length && (
                  <div role="status" className="al-locality-empty">
                    {noResults ?? emptyMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Field>
    )
  },
)
