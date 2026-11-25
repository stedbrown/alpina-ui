export type IdentifierIssue = 'format' | 'checksum' | undefined

/** Normalize conventional spacing and letter case without discarding invalid characters. */
export const compactIban = (value: string): string => value.replace(/\s/gu, '').toUpperCase()

/** Modulo 97 with A–Z expanded to their two-digit ISO 7064 values. */
export function mod97(value: string): number {
  let remainder = 0
  for (const char of value) {
    const digit = parseInt(char, 36)
    remainder = (remainder * (digit < 10 ? 10 : 100) + digit) % 97
  }
  return remainder
}

function mod97Issue(value: string): IdentifierIssue {
  const check = Number(value.slice(2, 4))
  return check >= 2 && check <= 98 && mod97(value.slice(4) + value.slice(0, 4)) === 1 ? undefined : 'checksum'
}

export function ibanIssue(value: string, requireQr = false): IdentifierIssue {
  const iban = compactIban(value)
  if (!/^(?:CH|LI)\d{7}[A-Z0-9]{12}$/.test(iban)) return 'format'
  if (requireQr) {
    const iid = Number(iban.slice(4, 9))
    if (iid < 30000 || iid > 31999) return 'format'
  }
  return mod97Issue(iban)
}

export function ahvIssue(value: string): IdentifierIssue {
  const digits = value.replace(/[.\s]/gu, '')
  if (!/^756\d{10}$/.test(digits)) return 'format'
  return [...digits].reduce((sum, d, index) => sum + Number(d) * (index % 2 ? 3 : 1), 0) % 10 === 0 ? undefined : 'checksum'
}

/** Validate the nine digits of a CHE identifier according to eCH-0108. */
export function uidIssue(value: string): IdentifierIssue {
  const match = /^CHE-?([1-9]\d{2})\.?(\d{3})\.?(\d{3})$/i.exec(value.trim())
  if (!match) return 'format'
  const digits = match.slice(1).join('')
  const weights = [5, 4, 3, 2, 7, 6, 5, 4]
  const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0)
  return (11 - sum % 11) % 11 === Number(digits[8]) ? undefined : 'checksum'
}

export function qrCheckDigit(body: string): number {
  const next = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
  let carry = 0
  for (const digit of body) carry = next[(carry + Number(digit)) % 10]
  return (10 - carry) % 10
}

/** Validates a 27-digit QR reference, including its recursive modulo-10 check digit. */
export function qrrIssue(input: string): IdentifierIssue {
  const value = input.replace(/ /g, '')
  if (!/^\d{27}$/.test(value) || /^0+$/.test(value)) return 'format'
  return qrCheckDigit(value.slice(0, -1)) === Number(value[26]) ? undefined : 'checksum'
}

export function scorIssue(input: string): IdentifierIssue {
  if (/[^a-zA-Z0-9 ]/.test(input)) return 'format'
  const value = input.replace(/ /g, '').toUpperCase()
  return /^RF\d{2}[A-Z0-9]{1,21}$/.test(value) ? mod97Issue(value) : 'format'
}
