import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './input-group.css'
export interface InputGroupProps extends ComponentPropsWithoutRef<'div'> {
  leading?: ReactNode
  trailing?: ReactNode
}
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  {
    leading,
    trailing,
    children,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div ref={ref} {...props} className={('al-input-group ' + className).trim()}>
      {leading != null && <span className="al-input-group-addon">{leading}</span>}
      {children}
      {trailing != null && <span className="al-input-group-addon">{trailing}</span>}
    </div>
  )
})
