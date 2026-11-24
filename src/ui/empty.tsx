import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './empty.css'
export interface EmptyProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}
export function Empty({
  title,
  description,
  action,
  children,
  className = '',
  ...props
}: EmptyProps): ReactElement {
  return (
    <div {...props} className={('al-empty ' + className).trim()}>
      <div className="al-empty-title">{title}</div>
      {description != null && <div className="al-empty-description">{description}</div>}
      {children}
      {action != null && <div className="al-empty-action">{action}</div>}
    </div>
  )
}
