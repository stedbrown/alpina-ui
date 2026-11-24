import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './text-link.css'

export interface TextLinkProps extends ComponentPropsWithoutRef<'a'> {
  variant?: 'inline' | 'action' | 'quiet' | 'skip'
}
export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(function TextLink(
  { variant = 'inline', className = '', ...props },
  ref,
) {
  return <a {...props} ref={ref} className={'al-text-link ' + className} data-variant={variant} />
})
