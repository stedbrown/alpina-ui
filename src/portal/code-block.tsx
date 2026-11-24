'use client'
import type { ReactElement } from 'react'
import { useState, useRef, type HTMLAttributes } from 'react'
import { Button } from '../ui/button.js'
import './code-block.css'

export interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
  code: string
  label: string
  copyLabel?: string
  copiedLabel?: string
  manualLabel?: string
}
export function CodeBlock({
  code,
  label,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  manualLabel = 'Text selected. Use your browser’s copy command.',
  className = '',
  ...props
}: CodeBlockProps): ReactElement {
  const ref = useRef<HTMLElement>(null)
  const [result, setResult] = useState<{ value: string; message: string }>()
  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setResult({ value: code, message: copiedLabel })
    } catch {
      const selection = window.getSelection()
      if (!selection || !ref.current) return
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      selection.removeAllRanges()
      selection.addRange(range)
      let copied = false
      try {
        copied = document.execCommand('copy')
      } catch {
        /* The selection remains available. */
      }
      setResult({ value: code, message: copied ? copiedLabel : manualLabel })
    }
  }
  return (
    <figure {...props} className={'al-code-block ' + className}>
      <figcaption>
        <span>{label}</span>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copyLabel}
        </Button>
      </figcaption>
      <pre tabIndex={0} aria-label={label}>
        <code ref={ref}>{code}</code>
      </pre>
      <span role="status">{result?.value === code ? result.message : ''}</span>
    </figure>
  )
}
