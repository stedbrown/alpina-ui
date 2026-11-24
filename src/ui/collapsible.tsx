import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './collapsible.css'
export interface CollapsibleProps extends ComponentPropsWithoutRef<'details'> {
  summary: ReactNode
}
export function Collapsible({
  summary,
  children,
  className = '',
  ...props
}: CollapsibleProps): ReactElement {
  return (
    <details {...props} className={('al-collapsible ' + className).trim()}>
      <summary>{summary}</summary>
      <div className="al-collapsible-content">{children}</div>
    </details>
  )
}
