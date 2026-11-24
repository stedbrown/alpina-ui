import { forwardRef } from 'react'
import { Select, type SelectProps } from '../ui/select.js'
import './native-select.css'

export interface NativeSelectProps extends SelectProps {
  appearance?: 'line' | 'outline'
}

/** Preserves the platform picker and native form, validation and multiple-selection semantics. */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { className = '', appearance = 'line', ...props },
  ref,
) {
  return (
    <Select
      {...props}
      ref={ref}
      className={('al-native-select ' + className).trim()}
      data-appearance={appearance}
    />
  )
})
