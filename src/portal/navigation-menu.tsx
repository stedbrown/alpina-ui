'use client'
import type { ReactElement } from 'react'
import { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './navigation-menu.css'

export interface NavigationLink {
  href: string
  label: ReactNode
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
export function NavigationMenu({
  label,
  sections,
  orientation = 'vertical',
  onNavigate,
  className = '',
  ...props
}: NavigationMenuProps): ReactElement {
  return (
    <nav
      {...props}
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
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={link.current ? 'page' : undefined}
                    onClick={(e) => {
                      if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey)
                        onNavigate?.(link.href)
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </nav>
  )
}
