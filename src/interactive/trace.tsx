import { forwardRef, useId, type ReactNode } from 'react'
import './trace.css'

export interface TraceEvent {
  id: string
  title: ReactNode
  time?: ReactNode
  dateTime?: string
  detail?: ReactNode
}
export interface TraceProps {
  label: string
  events: readonly TraceEvent[]
  className?: string
}

export const Trace = forwardRef<HTMLElement, TraceProps>(function Trace(
  { label, events, className = '' },
  ref,
) {
  const id = useId()
  return (
    <section ref={ref} className={('al-trace ' + className).trim()} aria-labelledby={id}>
      <h3 id={id}>{label}</h3>
      <ol>
        {events.map((event) => (
          <li key={event.id}>
            {event.time != null &&
              (event.dateTime ? (
                <time dateTime={event.dateTime}>{event.time}</time>
              ) : (
                <span className="al-trace-time">{event.time}</span>
              ))}
            <div>
              {event.detail == null ? (
                <strong>{event.title}</strong>
              ) : (
                <details>
                  <summary>{event.title}</summary>
                  <div>{event.detail}</div>
                </details>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
})
