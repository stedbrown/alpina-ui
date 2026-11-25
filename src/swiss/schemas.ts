import type { SwissMessageLocale } from './locales.js'
import { compactIban, formatAhvNumber, formatSwissPhone, formatSwissUid, isAhvNumber, isQrIban, isSwissIban, isSwissPhone, isSwissUid } from './identifiers.js'
import { isSwissPostalCode } from './postal-code.js'
import { isCreditorReference, isQrReference } from './qr-payment.js'
import { swissValidationMessage } from './validation-messages.js'
import { standardSchema, type SwissStandardSchema } from './standard-schema.internal.js'

export type { SwissSchemaIssue, SwissSchemaResult, SwissStandardSchema } from './standard-schema.internal.js'
export { echAddressSchema, type EchMailAddress } from './ech-address-schema.internal.js'

const referenceErrors = {
  en: ['Enter a CH or LI QR-IBAN with a QR institution identifier.', 'Enter a valid 27-digit QR reference.', 'Enter a valid RF creditor reference.'],
  'de-CH': ['Geben Sie eine CH- oder LI-QR-IBAN mit QR-IID ein.', 'Geben Sie eine gültige 27-stellige QR-Referenz ein.', 'Geben Sie eine gültige RF-Gläubigerreferenz ein.'],
  'fr-CH': ['Saisissez un QR-IBAN suisse ou liechtensteinois avec un QR-IID.', 'Saisissez une référence QR valide de 27 chiffres.', 'Saisissez une référence créancier RF valide.'],
  'it-CH': ['Inserisci un QR-IBAN svizzero o del Liechtenstein con un QR-IID.', 'Inserisci un riferimento QR valido di 27 cifre.', 'Inserisci un riferimento del creditore RF valido.'],
  'rm-CH': ['Endatai in QR-IBAN svizzer u liechtensteinais cun in QR-IID.', 'Endatai ina referenza QR valaivla da 27 cifras.', 'Endatai ina referenza RF valaivla dal creditur.'],
} as const

function textSchema(locale: SwissMessageLocale, message: string, valid: (text: string) => boolean, canonical: (text: string) => string): SwissStandardSchema<string> {
  return standardSchema<string, string>(value => {
    if (value == null || (typeof value === 'string' && !value.trim()))
      return { issues: [{ message: swissValidationMessage('required', locale) }] }
    if (typeof value !== 'string' || !valid(value)) return { issues: [{ message }] }
    return { value: canonical(value) }
  })
}

export function ibanSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, swissValidationMessage('iban', locale), isSwissIban, compactIban)
}
export function qrIbanSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, referenceErrors[locale][0], isQrIban, compactIban)
}
export function ahvSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, swissValidationMessage('ahv', locale), isAhvNumber, formatAhvNumber)
}
export function uidSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, swissValidationMessage('uid', locale), isSwissUid, formatSwissUid)
}
export function phoneSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, swissValidationMessage('phone', locale), isSwissPhone, value => formatSwissPhone(value).replaceAll(' ', ''))
}
/** Four-digit postal-code syntax, shared with SwissPostalCodeInput. Directory membership is a separate lookup. */
export function postalCodeSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, swissValidationMessage('postalCode', locale), isSwissPostalCode, value => value)
}
export function qrrSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, referenceErrors[locale][1], isQrReference, value => value.replaceAll(' ', ''))
}
export function scorSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, referenceErrors[locale][2], isCreditorReference, value => value.replaceAll(' ', '').toUpperCase())
}
