import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { SelectEnhancement } from './select-enhancement.internal.js'
import './select.css'
export { installSelectPicker } from './select-picker.internal.js'

export interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  placeholder?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { placeholder, children, multiple, className = '', ...props },
  ref,
) {
  return <>
    <select {...props} multiple={multiple} ref={ref} className={`al-select ${className}`.trim()}>
      {placeholder !== undefined && !multiple && <option value="">{placeholder}</option>}
      {children}
    </select>
    <SelectEnhancement />
  </>
})
