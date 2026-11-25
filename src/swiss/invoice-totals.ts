export type SwissVatRate = 0 | 2.6 | 3.8 | 8.1

export interface InvoiceLine {
  description: string
  /** Positive decimal quantity, with up to four fractional digits. */
  quantity: string | number
  /** Optional unit printed after the quantity, such as h or m². */
  unit?: string
  /** VAT-exclusive CHF per unit, with up to four fractional digits. Negative prices represent discounts. */
  unitPrice: string | number
  vatRate: SwissVatRate
}

const tenthsOfPercent = new Map<SwissVatRate, bigint>([[0, 0n], [2.6, 26n], [3.8, 38n], [8.1, 81n]])

function fixed(value: string | number): bigint {
  const match = /^(-?)(\d{1,12})(?:\.(\d{1,4}))?$/.exec(String(value))
  if (!match) throw new RangeError('Expected a decimal with up to twelve integer and four fractional digits.')
  return BigInt(match[1] + match[2] + (match[3] ?? '').padEnd(4, '0'))
}

function nearest(value: bigint, divisor: bigint): bigint {
  const absolute = value < 0n ? -value : value
  const rounded = (absolute + divisor / 2n) / divisor
  return value < 0n ? -rounded : rounded
}

function cents(value: bigint): number {
  const result = Number(value)
  if (!Number.isSafeInteger(result)) throw new RangeError('Invoice amount exceeds the exact centime range.')
  return result
}

export function invoiceUnitPriceCents(price: InvoiceLine['unitPrice']): number {
  return cents(nearest(fixed(price), 100n))
}

/** Line net amounts and each rate's VAT round half away from zero to whole centimes. */
export function calculateInvoiceTotals(lines: readonly InvoiceLine[], options: { cashRounding?: boolean } = {}) {
  if (!lines.length) throw new RangeError('An invoice needs at least one line.')
  const groups = new Map<SwissVatRate, bigint>()
  let net = 0n
  const lineNetCents = lines.map(line => {
    if (!line.description.trim()) throw new RangeError('Each invoice line needs a description.')
    if (!tenthsOfPercent.has(line.vatRate)) throw new RangeError('Unsupported Swiss VAT rate.')
    const quantity = fixed(line.quantity)
    if (quantity <= 0n) throw new RangeError('Quantity must be positive.')
    const amount = nearest(quantity * fixed(line.unitPrice), 1_000_000n)
    groups.set(line.vatRate, (groups.get(line.vatRate) ?? 0n) + amount)
    net += amount
    return cents(amount)
  })
  let tax = 0n
  const vat = [...groups].sort(([a], [b]) => a - b).map(([rate, base]) => {
    const amount = nearest(base * tenthsOfPercent.get(rate)!, 1000n)
    tax += amount
    return { rate, baseCents: cents(base), taxCents: cents(amount) }
  })
  const gross = net + tax
  const total = options.cashRounding ? 5n * nearest(gross, 5n) : gross
  return { lineNetCents, vat, netCents: cents(net), taxCents: cents(tax), roundingCents: cents(total - gross), totalCents: cents(total) }
}
