import type { CantonCode } from './cantons.js'

export interface SwissPostalLocality {
  readonly locality: string
  readonly canton: CantonCode
}

/** Looks up an exact residential postcode in the packaged swisstopo directory. */
export async function lookupSwissPostalCode(postalCode: string): Promise<SwissPostalLocality[]> {
  if (!/^[1-9][0-9]{3}$/.test(postalCode)) return []
  const { default: rows } = await import('./postal-localities.data.js')
  const prefix = '\n' + postalCode
  let start = rows.indexOf(prefix)
  const matches: SwissPostalLocality[] = []
  while (start !== -1 && rows.startsWith(prefix, start)) {
    const end = rows.indexOf('\n', start + 1)
    matches.push({ canton: rows.slice(start + 5, start + 7) as CantonCode, locality: rows.slice(start + 7, end) })
    start = end
  }
  return matches
}
