'use client'
import { forwardRef } from 'react'
import { SwissQrBill, type SwissQrBillProps } from './swiss-qr-bill.js'
import { useMessageLocale } from './locale-context.internal.js'

export const LocalizedSwissQrBill = forwardRef<HTMLDivElement, SwissQrBillProps>(function LocalizedSwissQrBill(props, ref) {
  const locale = useMessageLocale(props.locale, 'de-CH')
  return <SwissQrBill {...props} locale={locale} ref={ref} />
})
