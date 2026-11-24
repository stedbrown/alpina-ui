import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import './sidebar.css'

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  as?: 'aside' | 'div'
  masthead?: ReactNode
  tools?: ReactNode
  footer?: ReactNode
}
/** The ref points to the scrollable index, for focusing a matched navigation item. */
export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(function Sidebar(
  { as: Element = 'aside', masthead, tools, footer, children, className = '', ...props },
  ref,
) {
  return (
    <Element {...props} className={'al-sidebar ' + className}>
      {masthead && <div className="al-sidebar-head">{masthead}</div>}
      {tools && <div className="al-sidebar-tools">{tools}</div>}
      <div className="al-sidebar-scroll" ref={ref}>
        {children}
      </div>
      {footer && <div className="al-sidebar-foot">{footer}</div>}
    </Element>
  )
})
