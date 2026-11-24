import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './input-group.css'
export interface InputGroupProps extends ComponentPropsWithoutRef<'div'> {
  leading?: ReactNode
  trailing?: ReactNode
}
export function InputGroup({
  leading,
  trailing,
  children,
  className = '',
  ...props
}: InputGroupProps): ReactElement {
  return (
    <div {...props} className={('al-input-group ' + className).trim()}>
      {leading != null && <span className="al-input-group-addon">{leading}</span>}
      {children}
      {trailing != null && <span className="al-input-group-addon">{trailing}</span>}
    </div>
  )
}
