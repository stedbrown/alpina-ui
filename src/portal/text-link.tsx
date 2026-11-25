import { forwardRef, type ComponentPropsWithoutRef, type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { Slot, type SlottedSignature } from '../ui/slot.js'
import './text-link.css'

export interface TextLinkProps extends ComponentPropsWithoutRef<'a'> {
  asChild?: boolean
  variant?: 'inline' | 'action' | 'quiet' | 'skip'
}
export const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(function TextLink(
  { variant = 'inline', className = '', asChild = false, ...props },
  ref,
) {
  const Link = asChild ? Slot : 'a'
  return <Link {...props} ref={ref} className={('al-text-link ' + className).trim()} data-variant={variant} />
}) as SlottedSignature<TextLinkProps> & ForwardRefExoticComponent<TextLinkProps & RefAttributes<HTMLAnchorElement>>
