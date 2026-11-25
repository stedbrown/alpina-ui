import { notFound } from 'next/navigation'
import Link from 'next/link'
import { InvoiceDocument, Stack, TextLink, type InvoiceLine } from 'alpina-ui'
import { PrintInvoice } from './print-invoice'

// Public, fictional examples that are safe to prerender.
const invoices: Record<string, InvoiceLine[]> = {
  'AP-104': [{ description: 'Oak shelving', quantity: '2.5', unit: 'h', unitPrice: 80, vatRate: 8.1 }],
  'AP-105': [{ description: 'Bench repair', quantity: 1, unit: 'h', unitPrice: 80, vatRate: 8.1 }],
}

export function generateStaticParams() {
  return Object.keys(invoices).map(id => ({ id }))
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!Object.hasOwn(invoices, id)) notFound()
  return <main><Stack gap={4}>
    <TextLink asChild><Link href="/">Billing preferences</Link></TextLink>
    <PrintInvoice />
    <InvoiceDocument invoiceNumber={id} issueDate="2026-11-25" supplyDate="2026-11-24" dueDate="2026-12-25"
      locale="en" vatNumber="CHE-109.322.551" lines={invoices[id]} payment={{
        iban: 'CH9300762011623852957',
        creditor: { name: 'Atelier Nord', street: 'Werkstrasse', buildingNumber: '4', postalCode: '8004', town: 'Zürich', country: 'CH' },
        debtor: { name: 'Studio Quercia', street: 'Via Cantonale', buildingNumber: '8', postalCode: '6900', town: 'Lugano', country: 'CH' },
      }} />
  </Stack></main>
}
