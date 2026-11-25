import type { CantonCode } from './cantons.js'

export interface SwissAddress {
  recipient: string
  street: string
  postalCode: string
  locality: string
  canton: CantonCode
  firstName?: string
  addressLine1?: string
  addressLine2?: string
  houseNumber?: string
}

export type SwissAddressFormat = 'compact' | 'ech-person' | 'ech-organisation'
export const addressLimits = {
  recipient: 60, firstName: 30, addressLine1: 150, addressLine2: 150,
  street: 150, houseNumber: 30, locality: 40,
} as const

export function normalizeAddressText(text: string): string {
  return text.replace(/[\x20\t\r\n]+/g, ' ').trim()
}

export function isXmlAddressText(value: string): boolean {
  return !/[^\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/u.test(value)
}

export function addressFieldLimit(field: keyof SwissAddress, format: SwissAddressFormat): number | undefined {
  if (field === 'recipient' && format === 'ech-person') return 30
  return field in addressLimits ? addressLimits[field as keyof typeof addressLimits] : undefined
}

/** A street-delivery subset of eCH-0010 8.1.0 mailAddressType. */
export function toEchMailAddress(address: SwissAddress, format: Exclude<SwissAddressFormat, 'compact'>) {
  function field(key: keyof SwissAddress, required = false): string {
    const value = normalizeAddressText(address[key] ?? '')
    const limit = addressFieldLimit(key, format)
    if ((required && !value) || (limit && [...value].length > limit) || !isXmlAddressText(value)) {
      throw new RangeError('Invalid address field: ' + key)
    }
    return value
  }
  const recipient = field('recipient', true)
  const firstName = field('firstName')
  const addressLine1 = field('addressLine1')
  const addressLine2 = field('addressLine2')
  const houseNumber = field('houseNumber')
  const postalCode = field('postalCode', true)
  if (!/^[1-9]\d{3}$/.test(postalCode)) throw new RangeError('Expected a Swiss postal code from 1000 to 9999')
  return {
    ...(format === 'ech-person' ? { person: { ...(firstName && { firstName }), lastName: recipient } }
      : { organisation: { organisationName: recipient } }),
    addressInformation: {
      ...(addressLine1 && { addressLine1 }), ...(addressLine2 && { addressLine2 }),
      street: field('street', true), ...(houseNumber && { houseNumber }), town: field('locality', true),
      swissZipCode: Number(postalCode), country: { countryIdISO2: 'CH', countryNameShort: 'Schweiz' },
    },
  }
}
