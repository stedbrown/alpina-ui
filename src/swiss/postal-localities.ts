import { loadPostalRows } from './postal-loader.internal.js'
import type { CantonCode } from './cantons.js'

export interface SwissPostalLocality {
  readonly locality: string
  readonly canton: CantonCode
}

/** A postal locality with the political municipality it belongs to. */
export interface SwissLocality {
  /** Four-digit Swiss postcode. */
  readonly postalCode: string
  /** Official locality name used in postal addresses. */
  readonly locality: string
  /** Official name of the political municipality. */
  readonly municipality: string
  /** Municipality number of the Federal Statistical Office (BFS/OFS/UST). */
  readonly bfsNumber: number
  readonly canton: CantonCode
}

export interface SwissLocalitySearchOptions {
  /** Maximum number of results. Defaults to 10. */
  readonly limit?: number
  /** Restricts the results to one canton. */
  readonly canton?: CantonCode
}

interface Entry extends SwissLocality {
  readonly words: readonly string[]
  readonly name: string
  /** Postcodes of the locality plus localities of the municipality: a proxy for size within a rank. */
  weight: number
}

// Abbreviated saints match the spelled-out forms people also type.
const saints: Record<string, readonly string[]> = { st: ['sankt', 'saint', 'san'], ste: ['sainte'] }

let directory: Promise<readonly Entry[]> | undefined

// Umlauts may be typed as ae, oe and ue. The same folding applies to names and queries.
function fold(text: string) {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\u00df/g, 'ss')
    .replace(/([aou])e/g, '$1')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function parse(rows: string): readonly Entry[] {
  const municipalities = new Map<number, string>()
  const lines = rows.split('\n')
  for (const line of lines) {
    if (!line.startsWith('=')) continue
    const tab = line.indexOf('\t')
    municipalities.set(Number(line.slice(1, tab)), line.slice(tab + 1))
  }
  const entries: Entry[] = []
  for (const line of lines) {
    if (!/^[0-9]/.test(line)) continue
    const tab = line.indexOf('\t')
    const bfsNumber = Number(line.slice(tab + 1))
    const locality = line.slice(6, tab)
    const municipality = municipalities.get(bfsNumber)!
    const name = fold(locality)
    entries.push({
      postalCode: line.slice(0, 4),
      canton: line.slice(4, 6) as CantonCode,
      locality,
      municipality,
      bfsNumber,
      name,
      words: [...new Set([...name.split(' '), ...fold(municipality).split(' ')].flatMap((word) => [word, ...(saints[word] ?? [])]))],
      weight: 0,
    })
  }
  const count = (keys: string[]) => keys.reduce((map, key) => map.set(key, (map.get(key) ?? 0) + 1), new Map<string, number>())
  const names = count(entries.map((entry) => entry.canton + entry.locality))
  const places = count(entries.map((entry) => String(entry.bfsNumber)))
  for (const entry of entries) entry.weight = 4 * names.get(entry.canton + entry.locality)! + places.get(String(entry.bfsNumber))!
  return entries
}

function load() {
  directory ??= loadPostalRows().then(parse)
  directory.catch(() => {
    directory = undefined
  })
  return directory
}

/** Looks up an exact residential postcode in the packaged swisstopo directory. */
export async function lookupSwissPostalCode(postalCode: string): Promise<SwissPostalLocality[]> {
  if (!/^[1-9][0-9]{3}$/.test(postalCode)) return []
  const seen = new Set<string>()
  const matches: SwissPostalLocality[] = []
  for (const entry of await load()) {
    if (entry.postalCode !== postalCode || seen.has(entry.canton + entry.locality)) continue
    seen.add(entry.canton + entry.locality)
    matches.push({ locality: entry.locality, canton: entry.canton })
  }
  // Alphabetical, as before municipalities were added to the directory.
  return matches.sort((a, b) => (a.locality === b.locality ? (a.canton < b.canton ? -1 : 1) : a.locality < b.locality ? -1 : 1))
}

/**
 * Finds localities by postcode, locality or municipality name in the packaged swisstopo directory.
 * Accents, case and punctuation are ignored, and a query can combine a postcode with a name, as in
 * "6900 lug". Results start with exact names, then names that begin with the query.
 */
export async function searchSwissLocalities(
  query: string,
  { limit = 10, canton }: SwissLocalitySearchOptions = {},
): Promise<SwissLocality[]> {
  const text = fold(query)
  if (!text || limit < 1) return []
  const tokens = text.split(' ')
  const digits = tokens.filter((token) => /^[0-9]+$/.test(token))
  const words = tokens.filter((token) => !/^[0-9]+$/.test(token))
  const phrase = words.join(' ')
  if (digits.some((token) => token.length > 4)) return []
  const ranked: { entry: Entry; rank: number; index: number }[] = []
  const entries = await load()
  entries.forEach((entry, index) => {
    if (canton && entry.canton !== canton) return
    if (!digits.every((token) => entry.postalCode.startsWith(token))) return
    const code = entry.canton.toLowerCase()
    if (!words.every((token) => token === code || entry.words.some((word) => word.startsWith(token)))) return
    const rank = !phrase ? 0 : entry.name === phrase ? 0 : entry.name.startsWith(phrase) ? 1 : fold(entry.municipality) === phrase ? 2 : 3
    ranked.push({ entry, rank, index })
  })
  return ranked
    .sort((a, b) => a.rank - b.rank || (digits.length ? 0 : b.entry.weight - a.entry.weight) || a.index - b.index)
    .slice(0, limit)
    .map(({ entry: { postalCode, locality, municipality, bfsNumber, canton } }) => ({
      postalCode,
      locality,
      municipality,
      bfsNumber,
      canton,
    }))
}
