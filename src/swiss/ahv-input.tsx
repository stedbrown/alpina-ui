'use client'
import { ahvIssue } from './identifier-checks.internal.js'
import { ahvMessages, checkDigitMessages } from './input-messages.internal.js'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatAhvNumber } from './identifiers.js'

export interface AhvInputProps extends SwissIdentifierInputProps {}
export const AhvInput = forwardRef<HTMLInputElement, AhvInputProps>(function AhvInput(props, ref) {
  return <IdentifierField inputMode="numeric" autoComplete="off" messages={ahvMessages}
    {...props} ref={ref} validate={ahvIssue} checksumMessages={checkDigitMessages} format={formatAhvNumber} />
})
