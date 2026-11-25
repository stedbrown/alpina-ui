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
  /** Accessible name for number-only links. An item's accessibleLabel takes precedence. */
  pageLabel?: (page: number) => string
}
export function Pagination({
  label,
  items,
  currentPage,
  pageLabel = (page) => 'Page ' + page,
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
              aria-label={item.accessibleLabel ?? (item.label == null ? pageLabel(item.page) : undefined)}
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
