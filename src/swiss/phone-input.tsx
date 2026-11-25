'use client'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatSwissPhone, isSwissPhone } from './identifiers.js'

export interface PhoneInputProps extends SwissIdentifierInputProps {}
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(props, ref) {
  return <IdentifierField autoComplete="tel" validationMessage="Enter a Swiss phone number with nine digits after +41."
    {...props} ref={ref} type="tel" validate={isSwissPhone} format={formatSwissPhone} />
})
