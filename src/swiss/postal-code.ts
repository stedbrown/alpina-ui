export const swissPostalCodePattern = '[0-9]{4}'
const postalCode = new RegExp('^' + swissPostalCodePattern + '$')

/** Tests the four-digit shape. Use a postal directory to verify an address. */
export function isSwissPostalCode(value: string): boolean {
  return postalCode.test(value)
}
