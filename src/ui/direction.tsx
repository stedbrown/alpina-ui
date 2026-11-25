import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './direction.css'
export interface DirectionProps extends ComponentPropsWithoutRef<'div'> {
  dir: 'ltr' | 'rtl' | 'auto'
  /** Use an inline writing-direction boundary inside an existing sentence. */
  as?: 'div' | 'span'
}
export function Direction({ as: Element = 'div', className = '', ...props }: DirectionProps): ReactElement {
  return <Element {...props} className={('al-direction ' + className).trim()} />
}
