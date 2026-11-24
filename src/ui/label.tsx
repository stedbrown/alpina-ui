import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './label.css'
export function Label({ className = '', ...props }: ComponentPropsWithoutRef<'label'>): ReactElement {
  return <label {...props} className={('al-label ' + className).trim()} />
}
