'use client'
import { useEffect, type ReactNode } from 'react'
import { useDocumentPrint } from './document-body.internal.js'
import { observeInvoicePrint } from './invoice-print.internal.js'

export function InvoicePaper({ children }: { children: ReactNode }) {
  const ref = useDocumentPrint()
  useEffect(() => {
    if (ref.current) return observeInvoicePrint(ref.current)
  }, [ref])
  return <div className="al-invoice-content" ref={ref}>{children}</div>
}
