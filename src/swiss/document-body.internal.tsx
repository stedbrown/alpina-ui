'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { registerDocumentPrint } from './document-print-scope.internal.js'

/** Register native printing for this document's own browsing context. */
export function useDocumentPrint() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) return registerDocumentPrint(ref.current.ownerDocument)
  }, [])
  return ref
}

export function LetterBody({ children }: { children: ReactNode }) {
  const ref = useDocumentPrint()
  return <div className="al-letter-body" ref={ref}>{children}</div>
}
