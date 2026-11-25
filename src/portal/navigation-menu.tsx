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
  onNavigate?: (href: string) => void
}
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu({
  label,
  sections,
  orientation = 'vertical',
  onNavigate,
  className = '',
  ...props
}, ref) {
  return (
    <nav
      {...props}
      ref={ref}
      aria-label={label}
      className={'al-navigation ' + className}
      data-orientation={orientation}
    >
      {sections
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
        ))}
    </nav>
  )
})
