import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './collapsible.css'
export interface CollapsibleProps extends ComponentPropsWithoutRef<'details'> {
  summary: ReactNode
}
export const Collapsible = forwardRef<HTMLDetailsElement, CollapsibleProps>(function Collapsible(
  {
    summary,
    children,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <details ref={ref} {...props} className={('al-collapsible ' + className).trim()}>
      <summary>{summary}</summary>
      <div className="al-collapsible-content">{children}</div>
    </details>
  )
})
