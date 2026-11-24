import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import { Bubble } from './bubble.js'
import './message.css'
export interface MessageProps extends ComponentPropsWithoutRef<'article'> {
  author: ReactNode
  timestamp?: ReactNode
  dateTime?: string
  side?: 'start' | 'end'
}
export function Message({
  author,
  timestamp,
  dateTime,
  side = 'start',
  children,
  className = '',
  ...props
}: MessageProps): ReactElement {
  return (
    <article {...props} data-side={side} className={('al-message ' + className).trim()}>
      <header>
        <strong>{author}</strong>
        {timestamp != null &&
          (dateTime ? <time dateTime={dateTime}>{timestamp}</time> : <span>{timestamp}</span>)}
      </header>
      <Bubble side={side}>{children}</Bubble>
    </article>
  )
}
