import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './label.css'
export interface LabelProps extends ComponentPropsWithoutRef<'label'> {}
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className = '', ...props },
  ref,
) {
  return <label ref={ref} {...props} className={('al-label ' + className).trim()} />
})
