'use client'
import { phoneMessages } from './input-messages.internal.js'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatSwissPhone, isSwissPhone } from './identifiers.js'

export interface PhoneInputProps extends SwissIdentifierInputProps {}
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(props, ref) {
  return <IdentifierField autoComplete="tel" messages={phoneMessages}
    {...props} ref={ref} type="tel" validate={isSwissPhone} format={formatSwissPhone} />
})
