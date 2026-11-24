import type { ComponentPropsWithoutRef, ReactNode, ReactElement } from 'react'
import './pagination.css'

export interface PaginationItem {
  page: number
  href: string
  label?: ReactNode
  accessibleLabel?: string
}
export interface PaginationProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children'> {
  label: string
  items: readonly PaginationItem[]
  currentPage: number
}
export function Pagination({
  label,
  items,
  currentPage,
  className = '',
  ...props
}: PaginationProps): ReactElement {
  return (
    <nav {...props} aria-label={label} className={`al-pagination ${className}`.trim()}>
      <ul>
        {items.map((item) => (
          <li key={item.page}>
            <a
              href={item.href}
              aria-current={item.page === currentPage ? 'page' : undefined}
              aria-label={item.accessibleLabel}
              rel={
                item.page === currentPage - 1
                  ? 'prev'
                  : item.page === currentPage + 1
                    ? 'next'
                    : undefined
              }
            >
              {item.label ?? item.page}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
