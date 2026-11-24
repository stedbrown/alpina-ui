import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './text-link.css'

export const TextLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'>>(function TextLink(
  { className = '', ...props },
  ref,
) {
  return <a {...props} ref={ref} className={'al-text-link ' + className} />
})
