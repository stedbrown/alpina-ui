'use client'
import { useId, type ReactNode, type ReactElement } from 'react'
import { useControllable } from './controllable.js'
import { moveButton } from './roving.js'
import './accordion.css'
export interface AccordionItem {
  value: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}
export interface AccordionProps {
  items: readonly AccordionItem[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  headingLevel?: 2 | 3 | 4 | 5 | 6
  collapsible?: boolean
  className?: string
}
const headings = { 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const
export function Accordion({
  items,
  value,
  defaultValue = null,
  onValueChange,
  headingLevel = 3,
  collapsible = true,
  className,
}: AccordionProps): ReactElement {
  const [selected, select] = useControllable(value, defaultValue, onValueChange)
  const current =
    items.find((item) => !item.disabled && item.value === selected)?.value ??
    (collapsible ? null : items.find((item) => !item.disabled)?.value)
  const prefix = useId(),
    Heading = headings[headingLevel]
  return (
    <div
      className={['al-accordion', className].filter(Boolean).join(' ')}
      data-al-roving=""
      onKeyDown={(event) => moveButton(event, 'vertical')}
    >
      {items.map((item) => {
        const expanded = current === item.value,
          id = prefix + '-' + encodeURIComponent(item.value)
        return (
          <div className="al-accordion-item" key={item.value}>
            <Heading className="al-accordion-heading">
              <button
                type="button"
                className="al-accordion-button"
                data-al-choice=""
                id={id + '-heading'}
                disabled={item.disabled}
                aria-disabled={(expanded && !collapsible) || undefined}
                aria-controls={id}
                aria-expanded={expanded}
                onClick={() => {
                  if (!expanded || collapsible) select(expanded ? null : item.value)
                }}
              >
                <span>{item.title}</span>
                <span className="al-accordion-mark" aria-hidden="true">
                  {expanded ? '−' : '+'}
                </span>
              </button>
            </Heading>
            <div
              className="al-accordion-panel"
              hidden={!expanded}
              role="region"
              aria-labelledby={id + '-heading'}
              id={id}
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
