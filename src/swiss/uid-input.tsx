'use client'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatSwissUid, isSwissUid } from './identifiers.js'

export interface UidInputProps extends SwissIdentifierInputProps {}

export const UidInput = forwardRef<HTMLInputElement, UidInputProps>(function UidInput(props, ref) {
  return <IdentifierField autoCapitalize="characters" validationMessage="Enter a valid nine-digit Swiss business identifier beginning with CHE."
    {...props} ref={ref} validate={isSwissUid} format={formatSwissUid} />
})
