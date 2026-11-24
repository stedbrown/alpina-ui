import type { ReactElement } from 'react'
import { type ComponentPropsWithoutRef } from 'react'
import './prose.css'

export function Prose({ className = '', ...props }: ComponentPropsWithoutRef<'article'>): ReactElement {
  return <article {...props} className={'al-prose ' + className} />
}
