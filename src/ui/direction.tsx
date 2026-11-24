import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './direction.css'
export interface DirectionProps extends ComponentPropsWithoutRef<'div'> {
  dir: 'ltr' | 'rtl' | 'auto'
}
export function Direction({ className = '', ...props }: DirectionProps): ReactElement {
  return <div {...props} className={('al-direction ' + className).trim()} />
}
