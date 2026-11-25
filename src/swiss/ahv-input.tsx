'use client'
import { ahvMessages } from './input-messages.internal.js'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatAhvNumber, isAhvNumber } from './identifiers.js'

export interface AhvInputProps extends SwissIdentifierInputProps {}
export const AhvInput = forwardRef<HTMLInputElement, AhvInputProps>(function AhvInput(props, ref) {
  return <IdentifierField inputMode="numeric" autoComplete="off" messages={ahvMessages}
    {...props} ref={ref} validate={isAhvNumber} format={formatAhvNumber} />
})
