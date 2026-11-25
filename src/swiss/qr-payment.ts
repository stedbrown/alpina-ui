import { qrErrorMessage, type SwissQrErrorCode } from './qr-messages.internal.js'
import type { SwissMessageLocale } from './locales.js'
import { compactIban, isQrIban } from './identifiers.js'
import { ibanIssue, mod97, qrCheckDigit, qrrIssue, scorIssue, type IdentifierIssue } from './identifier-checks.internal.js'
import { checkDigitMessages, checkDigitPairMessages } from './input-messages.internal.js'

/** A structured address in the Swiss Payments Code (SIX QR-bill IG 2.4). */
export interface SwissQrAddress {
  name: string
  street?: string
  buildingNumber?: string
  postalCode: string
  town: string
  country: string
}

export interface SwissQrBillData {
  iban: string
  creditor: SwissQrAddress
  debtor?: SwissQrAddress
  /** A decimal amount in major currency units. Omit for a hand-written amount. */
  amount?: string | number
  currency: 'CHF' | 'EUR'
  /** Omit for an ordinary IBAN without a structured reference. */
  reference?: { type: 'QRR' | 'SCOR'; value: string } | { type: 'NON'; value?: never }
  message?: string
  /** A SIX-registered structured billing information string, starting with //. */
  billingInformation?: string
  /** Up to two strings following the registered provider's syntax. */
  alternativeProcedures?: readonly string[]
}

export type { SwissQrErrorCode } from './qr-messages.internal.js'

/** A stable field path and machine code accompany the localized correction. */
export class SwissQrValidationError extends RangeError {
  constructor(readonly field: string, readonly code: SwissQrErrorCode, locale: SwissMessageLocale, max?: number) {
    super(qrErrorMessage(locale, code, field, max))
    this.name = 'SwissQrValidationError'
  }
}

function assertIdentifier(issue: IdentifierIssue, field: string, code: 'iban' | 'qrr' | 'scor', locale: SwissMessageLocale) {
  if (!issue) return
  const error = new SwissQrValidationError(field, code, locale)
  if (issue === 'checksum') error.message = (code === 'qrr' ? checkDigitMessages : checkDigitPairMessages)[locale]
  throw error
}

const countryCodes = new Set(('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT ' +
  'JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ ' +
  'NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
  'UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' '))
const forbidden = /[^\u0020-\u007e\u00a0-\u017f\u0218-\u021b\u20ac]/

function field(value: string | undefined, path: string, locale: SwissMessageLocale, max: number, required = false): string {
  const text = (value ?? '').normalize('NFC')
  if (forbidden.test(text)) throw new SwissQrValidationError(path, 'characterSet', locale)
  const trimmed = text.trim()
  if (required && !trimmed) throw new SwissQrValidationError(path, 'required', locale)
  if (trimmed.length > max) throw new SwissQrValidationError(path, 'length', locale, max)
  return trimmed
}

function address(value: SwissQrAddress, role: 'creditor' | 'debtor', locale: SwissMessageLocale): SwissQrAddress {
  const country = field(value.country, role + '.country', locale, 2, true).toUpperCase()
  if (!countryCodes.has(country)) throw new SwissQrValidationError(role + '.country', 'country', locale)
  return {
    name: field(value.name, role + '.name', locale, 70, true),
    street: field(value.street, role + '.street', locale, 70),
    buildingNumber: field(value.buildingNumber, role + '.buildingNumber', locale, 16),
    postalCode: field(value.postalCode, role + '.postalCode', locale, 16, true),
    town: field(value.town, role + '.town', locale, 35, true),
    country,
  }
}

function addressLines(value?: SwissQrAddress): string[] {
  return value
    ? ['S', value.name, value.street ?? '', value.buildingNumber ?? '', value.postalCode, value.town, value.country]
    : Array(7).fill('')
}

/** Validates a 27-digit QR reference, including its recursive modulo-10 check digit. */
export function isQrReference(input: string): boolean {
  return qrrIssue(input) === undefined
}

/** Validates an ISO 11649 creditor reference with the ISO 7064 MOD 97-10 check. */
export function isCreditorReference(input: string): boolean {
  return scorIssue(input) === undefined
}

export interface PaymentReferenceOptions {
  /** Remove spaces, periods, slashes and hyphens between groups of letters or digits. */
  stripSeparators?: boolean
}

function referenceBody(value: string | number | bigint, options?: PaymentReferenceOptions): string {
  if (typeof value !== 'string' && typeof value !== 'bigint' && typeof value !== 'number')
    throw new TypeError('Expected an identifier string, integer or bigint.')
  if (typeof value === 'number' && !Number.isSafeInteger(value))
    throw new RangeError('Pass long identifiers as strings or bigint to preserve every digit.')
  const body = String(value)
  return options?.stripSeparators && typeof value === 'string'
    ? body.replace(/([A-Za-z0-9])[ ./\u00a0\u202f‐‑-]+(?=[A-Za-z0-9])/g, '$1') : body
}

/** Add the recursive modulo-10 digit to 1–26 digits and left-pad to the SIX length. */
export function createQrReference(value: string | number | bigint, options?: PaymentReferenceOptions): string {
  const input = referenceBody(value, options)
  if (!/^\d{1,26}$/.test(input) || /^0+$/.test(input))
    throw new RangeError('Supply 1 to 26 digits containing a nonzero digit. For a grouped invoice number, use { stripSeparators: true }. Map letter prefixes to a unique numeric identifier or use an RF reference with an ordinary IBAN.')
  const body = input.padStart(26, '0')
  return body + qrCheckDigit(body)
}

/** Create an ISO 11649 reference from 1–21 ASCII letters or digits. */
export function createCreditorReference(value: string | number | bigint, options?: PaymentReferenceOptions): string {
  const input = referenceBody(value, options)
  if (!/^[a-zA-Z0-9]{1,21}$/.test(input)) throw new RangeError('Supply 1 to 21 ASCII letters or digits. For an invoice number such as INV-2026-0141, use { stripSeparators: true }.')
  const body = input.toUpperCase()
  return 'RF' + String(98 - mod97(body + 'RF00')).padStart(2, '0') + body
}

/** Format a complete, valid QR reference in the SIX 2 + 5 × 5 grouping. */
export function formatQrReference(value: string): string {
  if (!isQrReference(value)) throw new RangeError('Expected a complete QR reference with a valid check digit.')
  const compact = value.replace(/ /g, '')
  return compact.slice(0, 2) + ' ' + compact.slice(2).match(/.{5}/g)!.join(' ')
}

/** Format a complete, valid ISO 11649 creditor reference in groups of four. */
export function formatCreditorReference(value: string): string {
  if (!isCreditorReference(value)) throw new RangeError('Expected a complete ISO 11649 reference with valid check digits.')
  return value.replace(/ /g, '').toUpperCase().match(/.{1,4}/g)!.join(' ')
}

// IG 2.4 §4.4 permits a zero amount only for these exact non-payable notifications.
const notifications = new Set(['NICHT ZUR ZAHLUNG VERWENDEN', 'NE PAS UTILISER POUR LE PAIEMENT',
  'NON UTILIZZARE PER IL PAGAMENTO', 'BETG DUVRAR PER IL PAJAMENT', 'DO NOT USE FOR PAYMENT'])

function fixedAmount(input: string | number | undefined, message: string, locale: SwissMessageLocale): string {
  if (notifications.has(message)) {
    if (input === undefined || !/^0(?:\.0{1,2})?$/.test(String(input)))
      throw new SwissQrValidationError('amount', 'nonPayableAmount', locale)
    return '0.00'
  }
  if (input === undefined) return ''
  const amount = String(input)
  if (!/^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/.test(amount) || Number(amount) === 0)
    throw new SwissQrValidationError('amount', 'amount', locale)
  const [whole, fraction = ''] = amount.split('.')
  return whole + '.' + fraction.padEnd(2, '0')
}

/** Validates and normalizes both the readable slip and its machine-readable payment data. */
export function prepareSwissQrBill(bill: SwissQrBillData, locale: SwissMessageLocale = 'en') {
  const { currency } = bill
  if (currency !== 'CHF' && currency !== 'EUR') throw new SwissQrValidationError('currency', 'currency', locale)
  assertIdentifier(/^[A-Za-z0-9 ]+$/.test(bill.iban) ? ibanIssue(bill.iban) : 'format', 'iban', 'iban', locale)
  const iban = compactIban(bill.iban)
  const type = bill.reference?.type ?? 'NON'
  const rawReference = bill.reference?.value ?? ''
  if (/[^a-zA-Z0-9 ]/.test(rawReference)) throw new SwissQrValidationError('reference.value', 'referenceCharacters', locale)
  const reference = rawReference.replace(/ /g, '').toUpperCase()
  if (!['NON', 'QRR', 'SCOR'].includes(type)) throw new SwissQrValidationError('reference.type', 'referenceType', locale)
  if (isQrIban(iban) !== (type === 'QRR')) throw new SwissQrValidationError('reference.type', 'referencePair', locale)
  if (type === 'QRR' && currency !== 'CHF') throw new SwissQrValidationError('currency', 'qrr', locale)
  if (type === 'QRR') assertIdentifier(qrrIssue(reference), 'reference.value', 'qrr', locale)
  if (type === 'SCOR') assertIdentifier(scorIssue(reference), 'reference.value', 'scor', locale)
  if (type === 'NON' && reference) throw new SwissQrValidationError('reference.value', 'non', locale)
  const message = field(bill.message, 'message', locale, 140)
  const amount = fixedAmount(bill.amount, message, locale)
  const creditor = address(bill.creditor, 'creditor', locale)
  const debtor = bill.debtor ? address(bill.debtor, 'debtor', locale) : undefined
  const billingInformation = field(bill.billingInformation, 'billingInformation', locale, 140)
  if (billingInformation && !/^\/\/[A-Za-z0-9]{2}/.test(billingInformation))
    throw new SwissQrValidationError('billingInformation', 'billingSyntax', locale)
  if (message.length + billingInformation.length > 140) throw new SwissQrValidationError('billingInformation', 'combinedLength', locale)
  const alternatives = (bill.alternativeProcedures ?? []).map((value, index) => field(value, 'alternativeProcedures.' + index, locale, 100, true))
  if (alternatives.length > 2) throw new SwissQrValidationError('alternativeProcedures', 'alternatives', locale)
  const lines = ['SPC', '0200', '1', iban, ...addressLines(creditor), ...addressLines(), amount, currency,
    ...addressLines(debtor), type, reference, message, 'EPD']
  if (billingInformation || alternatives.length) lines.push(billingInformation, ...alternatives)
  const payload = lines.join('\n')
  if (payload.length > 997 || new TextEncoder().encode(payload).length > 997)
    throw new SwissQrValidationError('payload', 'capacity', locale)
  return { iban, creditor, debtor, amount, currency, type, reference, message, billingInformation, alternatives, payload }
}

export function buildSwissQrPayload(bill: SwissQrBillData, locale: SwissMessageLocale = 'en'): string {
  return prepareSwissQrBill(bill, locale).payload
}
