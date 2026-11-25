import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './kbd.css'
export interface KbdProps extends ComponentPropsWithoutRef<'kbd'> {}
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { className = '', ...props },
  ref,
) {
  return <kbd ref={ref} {...props} className={('al-kbd ' + className).trim()} />
})
