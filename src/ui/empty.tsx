import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './empty.css'
export interface EmptyProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  title: ReactNode
  titleAs?: 'div' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  description?: ReactNode
  action?: ReactNode
}
export function Empty({
  title,
  titleAs: Title = 'div',
  description,
  action,
  children,
  className = '',
  ...props
}: EmptyProps): ReactElement {
  return (
    <div {...props} className={('al-empty ' + className).trim()}>
      <Title className="al-empty-title">{title}</Title>
      {description != null && <div className="al-empty-description">{description}</div>}
      {children}
      {action != null && <div className="al-empty-action">{action}</div>}
    </div>
  )
}
