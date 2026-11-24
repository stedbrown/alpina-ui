import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './kbd.css'
export function Kbd({ className = '', ...props }: ComponentPropsWithoutRef<'kbd'>): ReactElement {
  return <kbd {...props} className={('al-kbd ' + className).trim()} />
}
