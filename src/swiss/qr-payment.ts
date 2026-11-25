import { compactIban, isQrIban, isSwissIban } from './identifiers.js'

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

const countryCodes = new Set(('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT ' +
  'JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ ' +
  'NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW ' +
  'SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ ' +
  'UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' '))
const forbidden = /[^\u0020-\u007e\u00a0-\u017f\u0218-\u021b\u20ac]/

function field(value: string | undefined, title: string, max: number, required = false): string {
  const text = (value ?? '').normalize('NFC')
  if (forbidden.test(text)) throw new RangeError(title + ' contains a character outside the Swiss QR character set.')
  const trimmed = text.trim()
  if (required && !trimmed) throw new RangeError(title + ' is required.')
  if (trimmed.length > max) throw new RangeError(title + ' exceeds ' + max + ' characters.')
  return trimmed
}

function address(value: SwissQrAddress): SwissQrAddress {
  const country = field(value.country, 'Country', 2, true).toUpperCase()
  if (!countryCodes.has(country)) throw new RangeError('Expected an ISO 3166-1 alpha-2 country code.')
  return {
    name: field(value.name, 'Name', 70, true),
    street: field(value.street, 'Street', 70),
    buildingNumber: field(value.buildingNumber, 'Building number', 16),
    postalCode: field(value.postalCode, 'Postal code', 16, true),
    town: field(value.town, 'Town', 35, true),
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
  const value = input.replace(/ /g, '')
  if (!/^\d{27}$/.test(value) || /^0+$/.test(value)) return false
  const next = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
  let carry = 0
  for (const digit of value) carry = next[(carry + Number(digit)) % 10]
  return carry === 0
}

/** Validates an ISO 11649 creditor reference with the ISO 7064 MOD 97-10 check. */
export function isCreditorReference(input: string): boolean {
  if (/[^a-zA-Z0-9 ]/.test(input)) return false
  const value = input.replace(/ /g, '').toUpperCase()
  if (!/^RF\d{2}[A-Z0-9]{1,21}$/.test(value)) return false
  const digits = Number(value.slice(2, 4))
  if (digits < 2 || digits > 98) return false
  let remainder = 0
  for (const char of value.slice(4) + value.slice(0, 4)) {
    const number = char >= 'A' ? char.charCodeAt(0) - 55 : Number(char)
    remainder = (remainder * (number < 10 ? 10 : 100) + number) % 97
  }
  return remainder === 1
}

// IG 2.4 §4.4 permits a zero amount only for these exact non-payable notifications.
const notifications = new Set(['NICHT ZUR ZAHLUNG VERWENDEN', 'NE PAS UTILISER POUR LE PAIEMENT',
  'NON UTILIZZARE PER IL PAGAMENTO', 'BETG DUVRAR PER IL PAJAMENT', 'DO NOT USE FOR PAYMENT'])

function fixedAmount(input: string | number | undefined, message: string): string {
  if (notifications.has(message)) {
    if (input === undefined || !/^0(?:\.0{1,2})?$/.test(String(input)))
      throw new RangeError('A non-payable notification requires amount 0.00.')
    return '0.00'
  }
  if (input === undefined) return ''
  const amount = String(input)
  if (!/^(?:0|[1-9]\d{0,8})(?:\.\d{1,2})?$/.test(amount) || Number(amount) === 0)
    throw new RangeError('The amount must be between 0.01 and 999999999.99 with at most two decimal places.')
  const [whole, fraction = ''] = amount.split('.')
  return whole + '.' + fraction.padEnd(2, '0')
}

/** Validates and normalizes both the readable slip and its machine-readable payment data. */
export function prepareSwissQrBill(bill: SwissQrBillData) {
  const { currency } = bill
  if (currency !== 'CHF' && currency !== 'EUR') throw new RangeError('Expected CHF or EUR.')
  if (!/^[A-Za-z0-9 ]+$/.test(bill.iban) || !isSwissIban(bill.iban)) throw new RangeError('A valid CH or LI IBAN is required.')
  const iban = compactIban(bill.iban)
  const type = bill.reference?.type ?? 'NON'
  const rawReference = bill.reference?.value ?? ''
  if (/[^a-zA-Z0-9 ]/.test(rawReference)) throw new RangeError('References contain ASCII letters and digits only.')
  const reference = rawReference.replace(/ /g, '').toUpperCase()
  if (!['NON', 'QRR', 'SCOR'].includes(type)) throw new RangeError('Unknown reference type.')
  if (isQrIban(iban) !== (type === 'QRR')) throw new RangeError('A QR-IBAN and QRR reference must be used together.')
  if (type === 'QRR' && (currency !== 'CHF' || !isQrReference(reference))) throw new RangeError('QRR requires CHF and a valid 27-digit QR reference.')
  if (type === 'SCOR' && !isCreditorReference(reference)) throw new RangeError('Invalid ISO 11649 creditor reference.')
  if (type === 'NON' && reference) throw new RangeError('NON cannot contain a reference.')
  const message = field(bill.message, 'Message', 140)
  const amount = fixedAmount(bill.amount, message)
  const creditor = address(bill.creditor)
  const debtor = bill.debtor ? address(bill.debtor) : undefined
  const billingInformation = field(bill.billingInformation, 'Billing information', 140)
  if (billingInformation && !/^\/\/[A-Za-z0-9]{2}/.test(billingInformation))
    throw new RangeError('Billing information must start with // and a registered two-character identifier.')
  if (message.length + billingInformation.length > 140) throw new RangeError('Message and billing information together must fit in 140 characters.')
  const alternatives = (bill.alternativeProcedures ?? []).map(value => field(value, 'Alternative procedure', 100, true))
  if (alternatives.length > 2) throw new RangeError('At most two alternative procedures are permitted.')
  const lines = ['SPC', '0200', '1', iban, ...addressLines(creditor), ...addressLines(), amount, currency,
    ...addressLines(debtor), type, reference, message, 'EPD']
  if (billingInformation || alternatives.length) lines.push(billingInformation, ...alternatives)
  const payload = lines.join('\n')
  if (payload.length > 997 || new TextEncoder().encode(payload).length > 997)
    throw new RangeError('The payment data exceeds Swiss QR version 25 capacity.')
  return { iban, creditor, debtor, amount, currency, type, reference, message, billingInformation, alternatives, payload }
}

export function buildSwissQrPayload(bill: SwissQrBillData): string {
  return prepareSwissQrBill(bill).payload
}
