import { checkDigitMessages, checkDigitPairMessages, ibanMessages, ahvMessages, uidMessages, phoneMessages, postalCodeMessages, requiredMessages } from './input-messages.internal.js'
import type { SwissMessageLocale } from './locales.js'
export type { SwissMessageLocale } from './locales.js'

export type SwissValidationField = 'iban' | 'ahv' | 'uid' | 'phone' | 'postalCode' | 'required' | 'qrIban' | 'qrr' | 'scor'

const messages = { iban: ibanMessages, ahv: ahvMessages, uid: uidMessages, phone: phoneMessages, postalCode: postalCodeMessages, required: requiredMessages }

const referenceErrors = {
  en: ['Enter a CH or LI QR-IBAN with a QR institution identifier.', 'Enter a valid 27-digit QR reference.', 'Enter a valid RF creditor reference.'],
  'de-CH': ['Geben Sie eine CH- oder LI-QR-IBAN mit QR-IID ein.', 'Geben Sie eine gültige 27-stellige QR-Referenz ein.', 'Geben Sie eine gültige RF-Gläubigerreferenz ein.'],
  'fr-CH': ['Saisissez un QR-IBAN suisse ou liechtensteinois avec un QR-IID.', 'Saisissez une référence QR valide de 27 chiffres.', 'Saisissez une référence créancier RF valide.'],
  'it-CH': ['Inserisci un QR-IBAN svizzero o del Liechtenstein con un QR-IID.', 'Inserisci un riferimento QR valido di 27 cifre.', 'Inserisci un riferimento del creditore RF valido.'],
  'rm-CH': ['Endatai in QR-IBAN svizzer u liechtensteinais cun in QR-IID.', 'Endatai ina referenza QR valaivla da 27 cifras.', 'Endatai ina referenza RF valaivla dal creditur.'],
} as const

/** The same correction can be shown by a native input or a server-side form. */
export function swissValidationMessage(field: SwissValidationField, locale: SwissMessageLocale = 'en', reason: 'format' | 'checksum' = 'format'): string {
  if (reason === 'checksum') {
    if (field === 'iban' || field === 'qrIban' || field === 'scor') return checkDigitPairMessages[locale]
    if (field === 'ahv' || field === 'uid' || field === 'qrr') return checkDigitMessages[locale]
  }
  if (field === 'qrIban') return referenceErrors[locale][0]
  if (field === 'qrr') return referenceErrors[locale][1]
  if (field === 'scor') return referenceErrors[locale][2]
  return messages[field][locale]
}
