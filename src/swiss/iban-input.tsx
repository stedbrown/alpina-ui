'use client'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatSwissIban, isSwissIban } from './identifiers.js'

export interface IbanInputProps extends SwissIdentifierInputProps {}
export const IbanInput = forwardRef<HTMLInputElement, IbanInputProps>(function IbanInput(props, ref) {
  return <IdentifierField autoCapitalize="characters" validationMessage="Enter a valid Swiss or Liechtenstein IBAN."
    {...props} ref={ref} validate={isSwissIban} format={formatSwissIban} />
})
