import type { ComponentPropsWithoutRef, ReactNode, ReactElement } from 'react'
import './breadcrumb.css'

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
}
export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children'> {
  label: string
  currentIndex?: number
  items: readonly BreadcrumbItem[]
}
export function Breadcrumb({
  label,
  items,
  currentIndex = items.length - 1,
  className = '',
  ...props
}: BreadcrumbProps): ReactElement {
  return (
    <nav {...props} aria-label={label} className={`al-breadcrumb ${className}`.trim()}>
      <ol>
        {items.map((item, index) => {
          const current = index === currentIndex ? 'page' : undefined
          return (
            <li key={item.href ?? index}>
              {item.href !== undefined ? (
                <a href={item.href} aria-current={current}>
                  {item.label}
                </a>
              ) : (
                <span aria-current={current}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
