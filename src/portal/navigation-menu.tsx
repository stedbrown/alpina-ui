'use client'
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Icon } from '../ui/icon.js'
import { Slot } from '../ui/slot.js'
import './navigation-menu.css'

export interface NavigationLink {
  href: string
  label: ReactNode
  /** Use the element in label as the link. href identifies the route for onNavigate. */
  asChild?: boolean
  current?: boolean
}
export interface NavigationSection {
  title?: string
  links: readonly NavigationLink[]
}
export interface NavigationMenuProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children'> {
  label: string
  sections: readonly NavigationSection[]
  /** Home link or identity placed at the leading grid edge. */
  brand?: ReactNode
  /** Utilities after the route links, such as a release link and ThemeToggle. */
  actions?: ReactNode
  orientation?: 'vertical' | 'horizontal'
  /** Foreground and background for this navigation. Otherwise follow the surrounding theme. */
  surface?: 'paper' | 'ink' | 'accent'
  /** On narrow horizontal menus, expose links in a keyboard-operable popover. */
  collapseLabel?: string
  align?: 'start' | 'end'
  onNavigate?: (href: string) => void
}
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu({
  label,
  sections,
  brand,
  actions,
  orientation = brand || actions ? 'horizontal' : 'vertical',
  collapseLabel,
  surface,
  align = 'start',
  onNavigate,
  className = '',
  ...props
}, ref) {
  const panelId = useId()
  const collapsible = orientation === 'horizontal' && !!collapseLabel
  const links = sections
    .filter((section) => section.links.length)
    .map((section) => (
      <div key={section.title ?? section.links[0].href}>
        {section.title && <h2>{section.title}</h2>}
        <ul>
          {section.links.map((link) => {
            const Link = link.asChild ? Slot : 'a'
            return (
              <li key={link.href}>
                <Link
                  {...(!link.asChild && { href: link.href })}
                  aria-current={link.current ? 'page' : undefined}
                  onClick={(e) => {
                    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      const panel = e.currentTarget.closest<HTMLElement>('[popover]')
                      if (panel?.hidePopover && panel.matches(':popover-open')) panel.hidePopover()
                      onNavigate?.(link.href)
                    }
                  }}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    ))
  return (
    <nav {...props} ref={ref} aria-label={label} className={('al-navigation ' + className).trim()}
      data-framed={brand || actions ? '' : undefined} data-orientation={orientation} data-collapsible={collapsible || undefined} data-align={align} data-surface={surface}>
      <div className="al-navigation-layout" data-bar={brand || actions ? '' : undefined}>
        {brand && <div className="al-navigation-brand-slot">{brand}</div>}
        {collapsible ? <>
          <button type="button" className="al-navigation-trigger" popoverTarget={panelId} aria-controls={panelId}>
            <Icon name="menu" size={18} /><span>{collapseLabel}</span>
          </button>
          <div className="al-navigation-links" id={panelId} popover="auto">{links}</div>
        </> : <div className="al-navigation-links">{links}</div>}
        {actions && <div className="al-navigation-actions">{actions}</div>}
      </div>
    </nav>
  )
})

export interface NavigationBrandProps extends ComponentPropsWithoutRef<'a'> {
  /** Image URL for the brand mark. The adjacent name supplies its alternative text. */
  logo?: string
}
export const NavigationBrand = forwardRef<HTMLAnchorElement, NavigationBrandProps>(function NavigationBrand(
  { logo, children, className = '', ...props }, ref,
) {
  return <a {...props} ref={ref} className={('al-navigation-brand ' + className).trim()}>
    {logo && <img src={logo} alt="" width="32" height="32" />}{children}
  </a>
})

export interface NavigationActionProps extends ComponentPropsWithoutRef<'a'> {
  icon?: ReactNode
}
export const NavigationAction = forwardRef<HTMLAnchorElement, NavigationActionProps>(function NavigationAction(
  { icon, children, className = '', ...props }, ref,
) {
  return <a {...props} ref={ref} className={('al-navigation-action ' + className).trim()} data-icon={icon ? '' : undefined}>
    {icon}<span>{children}</span>
  </a>
})
