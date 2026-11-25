import { createElement, forwardRef, type ComponentPropsWithoutRef } from 'react'
import './direction.css'
export interface DirectionProps extends ComponentPropsWithoutRef<'div'> {
  dir: 'ltr' | 'rtl' | 'auto'
  /** Use an inline writing-direction boundary inside an existing sentence. */
  as?: 'div' | 'span'
}
export const Direction = forwardRef<HTMLElement, DirectionProps>(function Direction(
  { as: Element = 'div', className = '', ...props },
  ref,
) {
  return createElement(Element, { ...props, ref, className: ('al-direction ' + className).trim() })
})
