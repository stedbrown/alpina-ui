import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { addressLines } from './address-lines.js'
import type { SwissQrAddress } from './qr-payment.js'
import type { EchMailAddress } from './ech-address-schema.internal.js'
import { LetterBody } from './document-body.internal.js'
import { SwissDate } from './swiss-date.js'
import type { SwissLocale } from './locales.js'
import './letter.css'
import './document-print.css'
export { printSwissDocument } from './print-document.js'

export type LetterAddress = readonly string[] | SwissQrAddress | EchMailAddress

function recipientLines(address: LetterAddress, locale?: SwissLocale) {
  return 'name' in address || 'addressInformation' in address ? addressLines(address, locale) : address
}

export interface LetterProps extends ComponentPropsWithoutRef<'article'> {
  sender: LetterAddress
  recipient: LetterAddress
  subject: string
  date: string | Date
  place?: string
  locale?: SwissLocale
  windowPosition?: 'left' | 'right'
  foldMarks?: boolean
}

export const Letter = forwardRef<HTMLElement, LetterProps>(function Letter({
  sender, recipient, subject, date, place, locale, windowPosition = 'right', foldMarks = true,
  children, className = '', ...props
}, ref) {
  const from = recipientLines(sender, locale)
  const to = recipientLines(recipient, locale)
  if (!from.length || !to.length || !subject.trim()) throw new RangeError('Supply a sender, recipient and subject.')
  return <article ref={ref} {...props} className={('al-letter ' + className).trim()} data-window={windowPosition}>
    {foldMarks && <span className="al-letter-folds" aria-hidden="true" />}
    <header className="al-letter-head">
      <address className="al-letter-sender">{from.map((line, index) => <div key={index}>{line}</div>)}</address>
      <address className="al-letter-window">{to.map((line, index) => <div key={index}>{line}</div>)}</address>
    </header>
    <p className="al-letter-dateline">{place && place + ', '}<SwissDate value={date} locale={locale} /></p>
    <h2>{subject}</h2>
    <LetterBody>{children}</LetterBody>
  </article>
})
