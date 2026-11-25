'use client'
import { forwardRef } from 'react'
import { InvoiceDocument, type InvoiceDocumentProps } from './invoice-document.js'
import { useMessageLocale } from './locale-context.internal.js'

export const LocalizedInvoiceDocument = forwardRef<HTMLElement, InvoiceDocumentProps>(function LocalizedInvoiceDocument(props, ref) {
  const locale = useMessageLocale(props.locale, 'de-CH')
  return <InvoiceDocument {...props} locale={locale} ref={ref} />
})
