import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './alert.css'

export interface AlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: ReactNode
  /** Choose a heading level for a notice that starts a section. */
  titleAs?: 'strong' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    tone = 'info',
    title,
    titleAs: Title = 'strong',
    children,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div ref={ref} {...props} data-tone={tone} className={`al-alert ${className}`.trim()}>
      <span className="al-alert-sign" aria-hidden="true">
        {{ info: 'i', success: '✓', warning: '△', danger: '!' }[tone]}
      </span>
      <div className="al-alert-body">
        {title != null && <Title className="al-alert-title">{title}</Title>}
        <div>{children}</div>
      </div>
    </div>
  )
})
