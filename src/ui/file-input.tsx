'use client'

import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import type { SwissMessageLocale } from '../swiss/locales.js'
import { formatSwissNumber } from '../swiss/format-swiss-number.js'
import { Button } from './button.js'
import { fileWords } from './file-input-labels.internal.js'
import './file-input.css'

export interface FileInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'children'> {
  locale?: SwissMessageLocale
  /** Supply actual Files to restore or control both the visible list and native form value. */
  files?: readonly File[]
  /** Maximum size of each file in bytes. */
  maxSize?: number
  /** Maximum file count across selections. */
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
}

type FileError = '' | 'unsupported' | 'one' | 'required' | { kind: 'tooLarge' | 'tooMany'; limit: number }

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function sameFiles(current: FileList | null, next: readonly File[]) {
  return current?.length === next.length && next.every((file, i) => file === current[i])
}

function assignFiles(input: HTMLInputElement, next: readonly File[]) {
  if (sameFiles(input.files, next)) return
  if (!next.length) { input.value = ''; return }
  const transfer = new DataTransfer()
  for (const file of next) transfer.items.add(file)
  input.files = transfer.files
}

function accepts(file: File, accept?: string) {
  const rules = accept?.toLowerCase().split(',').map(rule => rule.trim()).filter(Boolean)
  if (!rules?.length) return true
  return rules.some(rule => rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule) :
    rule.endsWith('/*') ? file.type.toLowerCase().startsWith(rule.slice(0, -1)) : file.type.toLowerCase() === rule)
}

function fileSize(bytes: number, locale: SwissMessageLocale) {
  const index = bytes < 1000 ? 0 : Math.min(4, Math.floor(Math.log10(bytes) / 3))
  const units = locale === 'fr-CH' ? ['o', 'ko', 'Mo', 'Go', 'To'] : ['B', 'kB', 'MB', 'GB', 'TB']
  return formatSwissNumber(Math.round(10 * bytes / 1000 ** index) / 10, locale) + ' ' + units[index]
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput({
  id, locale = 'en', files, onFilesChange, maxSize, maxFiles, accept, multiple = false, disabled, className = '',
  onChange, onInvalid, 'aria-describedby': describedBy, ...props
}, ref) {
  const uid = useId()
  const inputId = id ?? uid
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => input.current!, [])
  const [local, setLocal] = useState<File[]>([])
  const selected = files ?? local
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<FileError>('')
  const [notice, setNotice] = useState<{ action: 'added' | 'removed'; names: string }>()
  const words = fileWords[locale]
  const change = useRef(onFilesChange)
  const controlled = useRef(files)
  const syntheticSelection = useRef(false)

  useBrowserLayoutEffect(() => {
    change.current = onFilesChange
    controlled.current = files
    if (input.current && files !== undefined) assignFiles(input.current, files)
  })
  useEffect(() => {
    const node = input.current!
    if (controlled.current === undefined) setLocal(Array.from(node.files ?? []))
    function reset(event: Event) {
      if (event.target !== node.form) return
      // Native reset clears files after event dispatch. Respect preventDefault and the owner form.
      queueMicrotask(() => {
        if (!node.isConnected || event.defaultPrevented) return
        setLocal([])
        setError('')
        setNotice(undefined)
        if (controlled.current !== undefined) assignFiles(node, controlled.current)
        change.current?.([])
      })
    }
    node.ownerDocument.addEventListener('reset', reset, true)
    return () => node.ownerDocument.removeEventListener('reset', reset, true)
  }, [])

  function choose(incoming: File[]): File[] | undefined {
    if ((!multiple && incoming.length > 1) || incoming.some(file => !accepts(file, accept))) {
      setError(!multiple && incoming.length > 1 ? 'one' : 'unsupported')
      return
    }
    if (maxSize !== undefined && incoming.some(file => file.size > maxSize)) {
      setError({ kind: 'tooLarge', limit: maxSize })
      return
    }
    const next = multiple ? [...selected] : []
    for (const file of incoming) {
      if (!next.includes(file)) next.push(file)
    }
    if (maxFiles !== undefined && next.length > maxFiles) {
      setError({ kind: 'tooMany', limit: maxFiles })
      return
    }
    setError('')
    if (incoming.length) setNotice({ action: 'added', names: incoming.map(file => file.name).join(', ') })
    return next
  }

  function transfer(next: File[]) {
    const node = input.current!
    assignFiles(node, next)
    syntheticSelection.current = true
    try {
      node.dispatchEvent(new Event('input', { bubbles: true }))
      node.dispatchEvent(new Event('change', { bubbles: true }))
    } finally { syntheticSelection.current = false }
  }
  function receive(incoming: File[]) {
    if (!incoming.length || input.current?.matches(':disabled')) return
    const next = choose(incoming)
    if (next) transfer(next)
  }

  return <div className={('al-file-input ' + className).trim()} lang={locale} data-dragging={dragging || undefined}
    onDragOver={event => {
      if (!event.dataTransfer.types.includes('Files')) return
      event.preventDefault()
      event.dataTransfer.dropEffect = input.current?.matches(':disabled') ? 'none' : 'copy'
      setDragging(event.dataTransfer.dropEffect === 'copy')
    }}
    onDragLeave={event => { if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) setDragging(false) }}
    onDrop={event => {
      if (!event.dataTransfer.types.includes('Files')) return
      event.preventDefault()
      setDragging(false)
      receive(Array.from(event.dataTransfer.files))
    }}
    onPaste={event => {
      if (event.clipboardData.files.length) {
        event.preventDefault()
        receive(Array.from(event.clipboardData.files))
      }
    }}>
    <div className="al-file-actions">
      <input {...props} ref={input} id={inputId} className="al-file-native" type="file" accept={accept} multiple={multiple} disabled={disabled}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={[describedBy, uid + '-hint', error && uid + '-error'].filter(Boolean).join(' ') || undefined}
        onInvalid={event => {
          onInvalid?.(event)
          if (event.defaultPrevented || !event.currentTarget.validity.valueMissing) return
          event.preventDefault()
          setError('required')
          const node = event.currentTarget
          if (!node.form || node.form.querySelector(':invalid') === node) node.focus()
        }}
        onChange={event => {
          const node = event.currentTarget
          const incoming = Array.from(node.files ?? [])
          const next = syntheticSelection.current || !incoming.length ? incoming : choose(incoming)
          assignFiles(node, next ?? selected)
          if (!next) return
          setLocal(next)
          if (!next.length) setError('')
          onChange?.(event)
          onFilesChange?.(next)
        }} />
      <Button asChild variant="outline"><label htmlFor={inputId}>{multiple ? words.add : words.choose}</label></Button>
      {!selected.length && <span className="al-file-empty">{words.empty}</span>}
      {props.required && <span className="al-file-fallback-selected">{words.selected}</span>}
    </div>
    <span className="al-file-hint" id={uid + '-hint'}>{words.hint}</span>
    {selected.length > 0 && <ul className="al-file-list">{selected.map((file, i) => (
      <li key={[file.name, file.size, file.lastModified, i].join('/')}>
        <bdi>{file.name}</bdi><span className="al-file-size">{fileSize(file.size, locale)}</span>
        <Button size="sm" variant="ghost" disabled={disabled} aria-label={words.remove + ' ' + file.name} onClick={() => {
          setError('')
          setNotice({ action: 'removed', names: file.name })
          transfer(selected.filter((_, index) => index !== i))
          input.current?.focus()
        }}>{words.remove}</Button>
      </li>
    ))}</ul>}
    <span className="al-file-announcement" role="status" aria-live="polite" aria-atomic="true">{notice && words[notice.action] + ' · ' + notice.names}</span>
    {error && <span id={uid + '-error'} className="al-file-error" role="alert">{typeof error === 'string' ? words[error] :
      error.kind === 'tooLarge' ? words.tooLarge.replace('{size}', fileSize(error.limit, locale)) :
      words.tooMany.replace('{count}', formatSwissNumber(error.limit, locale))}</span>}
  </div>
})

/** FileInput accepts dropped files throughout its surface. */
export const Dropzone = FileInput
