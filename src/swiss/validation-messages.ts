import { ibanMessages, ahvMessages, uidMessages, phoneMessages, postalCodeMessages, requiredMessages } from './input-messages.internal.js'
import type { SwissMessageLocale } from './locales.js'
export type { SwissMessageLocale } from './locales.js'

export type SwissValidationField = 'iban' | 'ahv' | 'uid' | 'phone' | 'postalCode' | 'required'

const messages = { iban: ibanMessages, ahv: ahvMessages, uid: uidMessages, phone: phoneMessages, postalCode: postalCodeMessages, required: requiredMessages }

/** The same correction can be shown by a native input or a server-side form. */
export function swissValidationMessage(field: SwissValidationField, locale: SwissMessageLocale = 'en'): string {
  return messages[field][locale]
}
