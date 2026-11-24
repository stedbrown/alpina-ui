import type { ComponentPropsWithoutRef, ReactNode, ReactElement } from 'react'
import './alert.css'

export interface AlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: ReactNode
}
export function Alert({
  tone = 'info',
  title,
  children,
  className = '',
  ...props
}: AlertProps): ReactElement {
  return (
    <div {...props} data-tone={tone} className={`al-alert ${className}`.trim()}>
      <span className="al-alert-sign" aria-hidden="true">
        {{ info: 'i', success: '✓', warning: '△', danger: '!' }[tone]}
      </span>
      <div className="al-alert-body">
        {title != null && <strong className="al-alert-title">{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  )
}
