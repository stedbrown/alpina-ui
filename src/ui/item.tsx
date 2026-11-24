import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './item.css'
export interface ItemProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  title: ReactNode
  description?: ReactNode
  /** Evidenzia la riga corrente. Passa false alle altre righe per conservare l’asse del testo. */
  current?: boolean
  leading?: ReactNode
  trailing?: ReactNode
}
export function Item({
  title,
  description,
  current,
  leading,
  trailing,
  children,
  className = '',
  ...props
}: ItemProps): ReactElement {
  return (
    <div
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
}
