'use client'
import { forwardRef, useState, useRef, type HTMLAttributes } from 'react'
import { Button } from '../ui/button.js'
import './code-block.css'

export interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
  code: string
  label: string
  copyLabel?: string
  copiedLabel?: string
  manualLabel?: string
}
export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    label,
    copyLabel = 'Copy',
    copiedLabel = 'Copied',
    manualLabel = 'Text selected. Use your browser’s copy command.',
    className = '',
    ...props
  },
  forwardedRef,
) {
  const ref = useRef<HTMLElement>(null)
  const [result, setResult] = useState<{ value: string; message: string }>()
  async function copy() {
    const source = ref.current
    if (!source) return
    try {
      await navigator.clipboard.writeText(code)
      setResult({ value: code, message: copiedLabel })
    } catch {
      const selection = window.getSelection()
      if (!selection || !source.isConnected || source.textContent !== code) return
      const range = document.createRange()
      range.selectNodeContents(source)
      selection.removeAllRanges()
      selection.addRange(range)
      let copied = false
      try {
        copied = document.execCommand('copy')
      } catch {
        /* The selection remains available. */
      }
      if (!copied && source.closest('figure')?.contains(document.activeElement)) {
        source.parentElement?.focus({ preventScroll: true })
        selection.removeAllRanges()
        selection.addRange(range)
      }
      setResult({ value: code, message: copied ? copiedLabel : manualLabel })
    }
  }
  return (
    <figure ref={forwardedRef} {...props} className={'al-code-block ' + className}>
      <figcaption>
        <span>{label}</span>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copyLabel}
        </Button>
      </figcaption>
      <pre tabIndex={0} role="region" aria-label={label}>
        <code ref={ref}>{code}</code>
      </pre>
      <span role="status">{result?.value === code ? result.message : ''}</span>
    </figure>
  )
})
