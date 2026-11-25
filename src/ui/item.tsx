import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './item.css'
export interface ItemProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  title: ReactNode
  description?: ReactNode
  /** Highlights the current row. Pass false to other rows to keep their text aligned. */
  current?: boolean
  leading?: ReactNode
  trailing?: ReactNode
}
export const Item = forwardRef<HTMLDivElement, ItemProps>(function Item(
  {
    title,
    description,
    current,
    leading,
    trailing,
    children,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-current={current || undefined}
      {...props}
      data-current={current}
      className={('al-item ' + className).trim()}
    >
      {leading != null && <div className="al-item-leading">{leading}</div>}
      <div className="al-item-body">
        <div className="al-item-title">{title}</div>
        {description != null && <div className="al-item-description">{description}</div>}
        {children}
      </div>
      {trailing != null && <div className="al-item-trailing">{trailing}</div>}
    </div>
  )
})
