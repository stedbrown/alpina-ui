'use client'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatAhvNumber, isAhvNumber } from './identifiers.js'

export interface AhvInputProps extends SwissIdentifierInputProps {}
export const AhvInput = forwardRef<HTMLInputElement, AhvInputProps>(function AhvInput(props, ref) {
  return <IdentifierField inputMode="numeric" autoComplete="off" validationMessage="Enter a valid 13-digit AHV number beginning with 756."
    {...props} ref={ref} validate={isAhvNumber} format={formatAhvNumber} />
})
