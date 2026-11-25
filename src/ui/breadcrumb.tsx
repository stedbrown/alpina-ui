import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Slot } from './slot.js'
import './breadcrumb.css'

export interface BreadcrumbItem {
  label: ReactNode
  /** Render the element supplied as the label as the breadcrumb itself. */
  asChild?: boolean
  href?: string
}
export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children'> {
  label: string
  currentIndex?: number
  items: readonly BreadcrumbItem[]
}
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb({
  label,
  items,
  currentIndex = items.length - 1,
  className = '',
  ...props
}, ref) {
  return (
    <nav {...props} ref={ref} aria-label={label} className={`al-breadcrumb ${className}`.trim()}>
      <ol>
        {items.map((item, index) => {
          const current = index === currentIndex ? 'page' : undefined
          return (
            <li key={item.href ?? index}>
              {item.asChild ? <Slot aria-current={current}>{item.label}</Slot> : item.href !== undefined ? (
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
})
