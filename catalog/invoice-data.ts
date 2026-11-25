export type InvoiceStatus = 'pending' | 'approved' | 'returned'

interface Invoice {
  id: string
  supplier: string
  due: string
  order: string
  status: InvoiceStatus
  lines: { description: string; quantity: number; ordered: number; unitCents: number }[]
  history: { title: string; note?: string }[]
}

export const initialInvoices: Invoice[] = [
  {
    id: 'AP-104', supplier: 'Papierhaus Aare', due: '2027-02-19', order: 'PO-018', status: 'pending',
    lines: [
      { description: 'Uncoated paper, 120 g/m²', quantity: 6, ordered: 6, unitCents: 4250 },
      { description: 'Board sample set', quantity: 2, ordered: 2, unitCents: 1800 },
    ],
    history: [{ title: 'Submitted for review' }],
  },
  {
    id: 'AP-105', supplier: 'Atelier du Trait', due: '2027-02-23', order: 'PO-021', status: 'pending',
    lines: [
      { description: 'Prepress proofs', quantity: 8, ordered: 6, unitCents: 2750 },
      { description: 'Colour calibration', quantity: 1, ordered: 1, unitCents: 12000 },
    ],
    history: [{ title: 'Submitted for review' }],
  },
  {
    id: 'AP-106', supplier: 'Legatoria Riva', due: '2027-02-26', order: 'PO-022', status: 'approved',
    lines: [{ description: 'Thread-sewn catalogues', quantity: 25, ordered: 25, unitCents: 1650 }],
    history: [{ title: 'Submitted for review' }, { title: 'Approved' }],
  },
]

export function invoiceTotalCHF(invoice: Invoice) {
  const cents = invoice.lines.reduce((sum, line) => sum + line.quantity * line.unitCents, 0)
  return cents / 100
}
