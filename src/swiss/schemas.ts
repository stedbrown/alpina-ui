import type { SwissMessageLocale } from './locales.js'
import { compactIban, formatAhvNumber, formatSwissPhone, formatSwissUid, isSwissPhone } from './identifiers.js'
import { isSwissPostalCode } from './postal-code.js'
import { ahvIssue, ibanIssue, qrrIssue, scorIssue, uidIssue, type IdentifierIssue } from './identifier-checks.internal.js'
import { swissValidationMessage, type SwissValidationField } from './validation-messages.js'
import { standardSchema, type SwissStandardSchema } from './standard-schema.internal.js'

export type { SwissSchemaIssue, SwissSchemaResult, SwissStandardSchema } from './standard-schema.internal.js'
export { echAddressSchema, type EchMailAddress } from './ech-address-schema.internal.js'

function textSchema(locale: SwissMessageLocale, field: SwissValidationField, issueFor: (text: string) => IdentifierIssue, canonical: (text: string) => string): SwissStandardSchema<string> {
  return standardSchema<string, string>(value => {
    if (value == null || (typeof value === 'string' && !value.trim()))
      return { issues: [{ message: swissValidationMessage('required', locale) }] }
    if (typeof value !== 'string') return { issues: [{ message: swissValidationMessage(field, locale) }] }
    const issue = issueFor(value)
    if (issue) return { issues: [{ message: swissValidationMessage(field, locale, issue) }] }
    return { value: canonical(value) }
  })
}

export function ibanSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'iban', ibanIssue, compactIban)
}
export function qrIbanSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'qrIban', value => ibanIssue(value, true), compactIban)
}
export function ahvSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'ahv', ahvIssue, formatAhvNumber)
}
export function uidSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'uid', uidIssue, formatSwissUid)
}
export function phoneSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'phone', value => isSwissPhone(value) ? undefined : 'format', value => formatSwissPhone(value).replaceAll(' ', ''))
}
/** Four-digit postal-code syntax, shared with SwissPostalCodeInput. Directory membership is a separate lookup. */
export function postalCodeSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'postalCode', value => isSwissPostalCode(value) ? undefined : 'format', value => value)
}
export function qrrSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'qrr', qrrIssue, value => value.replaceAll(' ', ''))
}
export function scorSchema(locale: SwissMessageLocale = 'en') {
  return textSchema(locale, 'scor', scorIssue, value => value.replaceAll(' ', '').toUpperCase())
}
