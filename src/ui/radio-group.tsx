'use client'

import { useId, type ComponentPropsWithoutRef, type ReactNode, type ReactElement } from 'react'
import './radio-group.css'

export interface RadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}
export interface RadioGroupProps extends Omit<
  ComponentPropsWithoutRef<'fieldset'>,
  'children' | 'onChange'
> {
  label: ReactNode
  options: readonly RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  required?: boolean
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  orientation = 'vertical',
  className = '',
  ...props
}: RadioGroupProps): ReactElement {
  const generatedName = useId()
  return (
    <fieldset
      {...props}
      data-orientation={orientation}
      name={name}
      className={`al-radio-group ${className}`.trim()}
    >
      <legend>{label}</legend>
      {options.map((option) => (
        <label className="al-radio-option" key={option.value}>
          <input
            type="radio"
            name={name ?? generatedName}
            value={option.value}
            required={required}
            checked={value === undefined ? undefined : option.value === value}
            defaultChecked={
              value === undefined && defaultValue !== undefined
                ? option.value === defaultValue
                : undefined
            }
            disabled={option.disabled}
            onChange={() => onValueChange?.(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
