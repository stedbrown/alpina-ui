import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './steps.css'

export interface StepsProps extends Omit<ComponentPropsWithoutRef<'ol'>, 'children'> {
  label: string
  /** Stable id of the current step. */
  current: string
  items: readonly { id: string; label: ReactNode }[]
}

export function Steps({ label, items, current, className = '', ...props }: StepsProps): ReactElement {
  return (
    <ol {...props} aria-label={label} role="list" className={('al-steps ' + className).trim()}>
      {items.map((item, index) => (
        <li key={item.id} aria-current={item.id === current ? 'step' : undefined}>
          <span aria-hidden="true">{index + 1}.</span> {item.label}
        </li>
      ))}
    </ol>
  )
}
