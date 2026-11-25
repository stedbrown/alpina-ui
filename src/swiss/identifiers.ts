/** Normalize conventional spacing and letter case without discarding invalid characters. */
export const compactIban = (value: string): string => value.replace(/\s/gu, '').toUpperCase()

export function isSwissIban(value: string): boolean {
  const iban = compactIban(value)
  if (!/^(?:CH|LI)\d{7}[A-Z0-9]{12}$/.test(iban)) return false
  const check = Number(iban.slice(2, 4))
  if (check < 2 || check > 98) return false
  let remainder = 0
  for (const char of iban.slice(4) + iban.slice(0, 4)) {
    const digit = parseInt(char, 36)
    remainder = (remainder * (digit < 10 ? 10 : 100) + digit) % 97
  }
  return remainder === 1
}

export function isQrIban(value: string): boolean {
  const iban = compactIban(value)
  const iid = Number(iban.slice(4, 9))
  return isSwissIban(iban) && iid >= 30000 && iid <= 31999
}

export function formatSwissIban(value: string): string {
  return isSwissIban(value) ? compactIban(value).match(/.{1,4}/g)!.join(' ') : value
}

export function isAhvNumber(value: string): boolean {
  const digits = value.replace(/[.\s]/gu, '')
  if (!/^756\d{10}$/.test(digits)) return false
  return [...digits].reduce((sum, d, index) => sum + Number(d) * (index % 2 ? 3 : 1), 0) % 10 === 0
}

export function formatAhvNumber(value: string): string {
  if (!isAhvNumber(value)) return value
  const digits = value.replace(/[.\s]/gu, '')
  return [digits.slice(0, 3), digits.slice(3, 7), digits.slice(7, 11), digits.slice(11)].join('.')
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
