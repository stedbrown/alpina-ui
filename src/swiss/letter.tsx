import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { LetterBody } from './document-body.internal.js'
import { SwissDate } from './swiss-date.js'
import type { SwissLocale } from './locales.js'
import './letter.css'
import './document-print.css'
export { printSwissDocument } from './print-document.js'

export interface LetterProps extends ComponentPropsWithoutRef<'article'> {
  sender: readonly string[]
  recipient: readonly string[]
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
  if (!sender.length || !recipient.length || !subject.trim()) throw new RangeError('Supply a sender, recipient and subject.')
  return <article ref={ref} {...props} className={('al-letter ' + className).trim()} data-window={windowPosition}>
    {foldMarks && <span className="al-letter-folds" aria-hidden="true" />}
    <header className="al-letter-head">
      <address className="al-letter-sender">{sender.map((line, index) => <div key={index}>{line}</div>)}</address>
      <address className="al-letter-window">{recipient.map((line, index) => <div key={index}>{line}</div>)}</address>
    </header>
    <p className="al-letter-dateline">{place && place + ', '}<SwissDate value={date} locale={locale} /></p>
    <h2>{subject}</h2>
    <LetterBody>{children}</LetterBody>
  </article>
})
