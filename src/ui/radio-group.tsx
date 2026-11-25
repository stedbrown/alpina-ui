'use client'

import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
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

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
    name,
    form,
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    required,
    orientation = 'vertical',
    className = '',
    ...props
  },
  ref,
) {
  const generatedName = useId()
  return (
    <fieldset
      ref={ref}
      {...props}
      data-orientation={orientation}
      name={name}
      form={form}
      className={`al-radio-group ${className}`.trim()}
    >
      <legend>{label}</legend>
      {options.map((option) => (
        <label className="al-radio-option" key={option.value}>
          <input
            type="radio"
            name={name ?? generatedName}
            form={form}
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
})
