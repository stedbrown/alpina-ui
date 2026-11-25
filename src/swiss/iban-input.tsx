'use client'
import { ibanIssue } from './identifier-checks.internal.js'
import { ibanMessages, checkDigitPairMessages } from './input-messages.internal.js'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatSwissIban } from './identifiers.js'

export interface IbanInputProps extends SwissIdentifierInputProps {}
export const IbanInput = forwardRef<HTMLInputElement, IbanInputProps>(function IbanInput(props, ref) {
  return <IdentifierField autoCapitalize="characters" messages={ibanMessages}
    {...props} ref={ref} validate={ibanIssue} checksumMessages={checkDigitPairMessages} format={formatSwissIban} />
})
