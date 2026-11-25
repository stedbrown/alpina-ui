import { forwardRef, type ComponentPropsWithoutRef, type ForwardRefExoticComponent, type HTMLAttributes, type ReactNode, type RefAttributes } from 'react'
import { Slot, type SlottedSignature } from '../ui/slot.js'
import './navigation-menu.css'
import './sidebar.css'

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  as?: 'aside' | 'div'
  masthead?: ReactNode
  tools?: ReactNode
  footer?: ReactNode
}
/** The ref points to the scrollable index, for focusing a matched navigation item. */
export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(function Sidebar(
  { as: Element = 'aside', masthead, tools, footer, children, className = '', ...props },
  ref,
) {
  return (
    <Element {...props} className={'al-sidebar ' + className}>
      {masthead && <div className="al-sidebar-head">{masthead}</div>}
      {tools && <div className="al-sidebar-tools">{tools}</div>}
      <div className="al-sidebar-scroll" ref={ref}>
        {children}
      </div>
      {footer && <div className="al-sidebar-foot">{footer}</div>}
    </Element>
  )
})

export interface SideNavProps extends ComponentPropsWithoutRef<'nav'> {
  label: string
}

export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav(
  { label, children, className = '', ...props }, ref,
) {
  return <nav {...props} ref={ref} aria-label={label} className={('al-navigation ' + className).trim()} data-orientation="vertical">
    <ul>{children}</ul>
  </nav>
})

export interface SideNavLinkProps extends ComponentPropsWithoutRef<'a'> {
  active?: boolean
  asChild?: boolean
}

export const SideNavLink = forwardRef<HTMLAnchorElement, SideNavLinkProps>(function SideNavLink(
  { active = false, asChild = false, 'aria-current': current, ...props }, ref,
) {
  const Link = asChild ? Slot : 'a'
  return <li><Link {...props} ref={ref} aria-current={current ?? (active ? 'page' : undefined)} /></li>
}) as SlottedSignature<SideNavLinkProps> & ForwardRefExoticComponent<SideNavLinkProps & RefAttributes<HTMLAnchorElement>>
