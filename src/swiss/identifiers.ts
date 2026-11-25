import { ahvIssue, compactIban, ibanIssue, uidIssue } from './identifier-checks.internal.js'

export { compactIban } from './identifier-checks.internal.js'

export interface SwissInputValueDetails {
  /** Standard Schema representation of a complete valid identifier, or null for empty and invalid input. */
  normalized: string | null
  /** Includes the component's required, format and checksum checks. */
  valid: boolean
}

export function isSwissIban(value: string): boolean {
  return ibanIssue(value) === undefined
}

export function isQrIban(value: string): boolean {
  return ibanIssue(value, true) === undefined
}

export function formatSwissIban(value: string): string {
  return isSwissIban(value) ? compactIban(value).match(/.{1,4}/g)!.join(' ') : value
}

export function isAhvNumber(value: string): boolean {
  return ahvIssue(value) === undefined
}

export function formatAhvNumber(value: string): string {
  if (!isAhvNumber(value)) return value
  const digits = value.replace(/[.\s]/gu, '')
  return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7, 11), digits.slice(11)].join('.')
}

/** Validate the nine digits of a CHE identifier according to eCH-0108. */
export function isSwissUid(value: string): boolean {
  return uidIssue(value) === undefined
}

export function formatSwissUid(value: string): string {
  if (!isSwissUid(value)) return value
  const digits = value.replace(/\D/g, '')
  return 'CHE-' + digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6)
}

function nationalDigits(value: string): string {
  return value.trim().replace(/^(?:\+41|0041)\s*\(0\)/, '+41')
    .replace(/[()\s.-]/gu, '').replace(/^(?:\+41|0041|0)/, '')
}

export function isSwissPhone(value: string): boolean {
  return /^[2-9]\d{8}$/.test(nationalDigits(value))
}

export function formatSwissPhone(value: string): string {
  if (!isSwissPhone(value)) return value
  const digits = nationalDigits(value)
  if (/^[89]/.test(digits)) return '+41 ' + digits.match(/.{3}/g)!.join(' ')
  return '+41 ' + [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7)].join(' ')
}
