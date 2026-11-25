'use client'
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
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
  orientation?: 'vertical' | 'horizontal'
  /** Show a native menu disclosure when a horizontal navigation has less than 42rem available. */
  collapseLabel?: string
  align?: 'start' | 'end'
  onNavigate?: (href: string) => void
}
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu({
  label,
  sections,
  orientation = 'vertical',
  collapseLabel,
  align = 'start',
  onNavigate,
  className = '',
  ...props
}, ref) {
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
                    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey)
                      onNavigate?.(link.href)
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
  const collapsible = orientation === 'horizontal' && !!collapseLabel
  return (
    <nav {...props} ref={ref} aria-label={label} className={('al-navigation ' + className).trim()}
      data-orientation={orientation} data-collapsible={collapsible || undefined} data-align={align}>
      {collapsible ? (
        <details onKeyDown={event => {
          if (event.key === 'Escape' && event.currentTarget.open) {
            event.preventDefault()
            event.currentTarget.open = false
            event.currentTarget.querySelector('summary')?.focus()
          }
        }}>
          <summary>{collapseLabel}</summary>
          <div className="al-navigation-links">{links}</div>
        </details>
      ) : links}
    </nav>
  )
})
