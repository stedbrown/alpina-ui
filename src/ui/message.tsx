import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Bubble } from './bubble.js'
import './message.css'
export interface MessageProps extends ComponentPropsWithoutRef<'article'> {
  author: ReactNode
  timestamp?: ReactNode
  dateTime?: string
  side?: 'start' | 'end'
}
export const Message = forwardRef<HTMLElement, MessageProps>(function Message(
  {
    author,
    timestamp,
    dateTime,
    side = 'start',
    children,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <article ref={ref} {...props} data-side={side} className={('al-message ' + className).trim()}>
      <header>
        <strong><bdi>{author}</bdi></strong>
        {timestamp != null &&
          (dateTime ? <time dateTime={dateTime}>{timestamp}</time> : <span>{timestamp}</span>)}
      </header>
      <Bubble side={side}>{children}</Bubble>
    </article>
  )
})
