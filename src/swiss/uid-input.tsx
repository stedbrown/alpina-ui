'use client'
import { uidMessages } from './input-messages.internal.js'
import { forwardRef } from 'react'
import { IdentifierField, type SwissIdentifierInputProps } from './identifier-field.js'
import { formatSwissUid, isSwissUid } from './identifiers.js'

export interface UidInputProps extends SwissIdentifierInputProps {}

export const UidInput = forwardRef<HTMLInputElement, UidInputProps>(function UidInput(props, ref) {
  return <IdentifierField autoCapitalize="characters" messages={uidMessages}
    {...props} ref={ref} validate={isSwissUid} format={formatSwissUid} />
})
