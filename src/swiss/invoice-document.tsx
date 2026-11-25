import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { SwissQrBill, type SwissQrBillLocale } from './swiss-qr-bill.js'
import type { SwissQrAddress, SwissQrBillData } from './qr-payment.js'
import { calculateInvoiceTotals, invoiceUnitPriceCents, type InvoiceLine } from './invoice-totals.js'
import { formatCentimes } from './format-centimes.internal.js'
import { formatSwissNumber } from './format-swiss-number.js'
import { InvoicePaper } from './invoice-paper.internal.js'
import { SwissDate } from './swiss-date.js'
import { formatSwissUid, isSwissUid } from './identifiers.js'
import './invoice-document.css'
import './document-print.css'
export { printSwissDocument } from './print-document.js'

export interface InvoiceDocumentProps extends Omit<ComponentPropsWithoutRef<'article'>, 'children'> {
  invoiceNumber: string
  issueDate: string
  supplyDate: string
  dueDate: string
  vatNumber: string
  lines: readonly InvoiceLine[]
  payment: Omit<SwissQrBillData, 'amount' | 'currency' | 'debtor'> & { debtor: SwissQrAddress }
  locale?: SwissQrBillLocale
  cashRounding?: boolean
}

function labels(invoice: string, issued: string, supplied: string, due: string, from: string, to: string, description: string,
  quantity: string, price: string, vat: string, net: string, adjustment: string, total: string, items: string) {
  return { invoice, issued, supplied, due, from, to, description, quantity, price, vat, net, adjustment, total, items }
}
const words = {
  en: labels('Invoice', 'Issued', 'Supplied', 'Due', 'Supplier', 'Customer', 'Description', 'Qty', 'Unit CHF', 'VAT', 'Net CHF', 'Rounding', 'Amount due', 'Invoice items'),
  'de-CH': labels('Rechnung', 'Rechnungsdatum', 'Leistungsdatum', 'Fällig am', 'Lieferant', 'Kunde', 'Beschreibung', 'Menge', 'Einzelpreis CHF', 'MWST', 'Netto CHF', 'Rundung', 'Zahlbetrag', 'Rechnungspositionen'),
  'fr-CH': labels('Facture', 'Émission', 'Prestation', 'Échéance', 'Fournisseur', 'Client', 'Description', 'Quantité', 'Prix unitaire CHF', 'TVA', 'Net CHF', 'Arrondi', 'Montant dû', 'Lignes de facture'),
  'it-CH': labels('Fattura', 'Emissione', 'Prestazione', 'Scadenza', 'Fornitore', 'Cliente', 'Descrizione', 'Quantità', 'Prezzo unitario CHF', 'IVA', 'Netto CHF', 'Arrotondamento', 'Importo dovuto', 'Voci della fattura'),
  'rm-CH': labels('Quint', 'Data dal quint', 'Data da prestaziun', 'Scadenza', 'Furnitur', 'Client', 'Descripziun', 'Quantitad', 'Pretsch unitar CHF', 'TPV', 'Net CHF', 'Arrundaziun', 'Import da pajar', 'Posiziuns dal quint'),
}

const cutLabel = { en: 'Separate before paying in', 'de-CH': 'Vor der Einzahlung abzutrennen', 'fr-CH': 'À détacher avant le versement',
  'it-CH': 'Da staccare prima del versamento', 'rm-CH': 'Da distatgar avant che pajar' }

function Party({ title, party }: { title: string; party: SwissQrAddress }) {
  return <section><h3>{title}</h3><address>
    <strong>{party.name}</strong>
    <div>{[party.street, party.buildingNumber].filter(Boolean).join(' ')}</div>
    <div>{party.postalCode} {party.town}</div>
    <div>{party.country}</div>
  </address></section>
}

export const InvoiceDocument = forwardRef<HTMLElement, InvoiceDocumentProps>(function InvoiceDocument({
  invoiceNumber, issueDate, supplyDate, dueDate, vatNumber, lines, payment, locale = 'de-CH', cashRounding, className = '', ...props
}, ref) {
  if (!invoiceNumber.trim()) throw new RangeError('Supply an invoice number.')
  if (!isSwissUid(vatNumber)) throw new RangeError('Supply a valid Swiss business identifier for the VAT number.')
  const result = calculateInvoiceTotals(lines, { cashRounding })
  if (result.totalCents <= 0 || result.totalCents > 99_999_999_999)
    throw new RangeError('A payable CHF QR invoice must total between 0.01 and 999999999.99.')
  const l = words[locale]
  const swissLocale = locale === 'en' ? 'de-CH' : locale
  const amount = (cents: number) => formatCentimes(BigInt(cents), swissLocale)
  const number = (value: string | number) => formatSwissNumber(value, locale)
  const columnAmount = (cents: number) => amount(cents).replace('CHF', '').trim()
  const rate = (value: number) => number(value) + '\u00a0%'
  const bill = { ...payment, currency: 'CHF' as const, amount: (result.totalCents / 100).toFixed(2) }
  const statement = <div className="al-invoice-statement">
    <h2>{l.invoice} <bdi>{invoiceNumber}</bdi></h2>
    <div className="al-invoice-parties">
      <Party title={l.from} party={payment.creditor} /><Party title={l.to} party={payment.debtor} />
    </div>
    <p className="al-invoice-id">{l.vat} <bdi>{formatSwissUid(vatNumber)} {locale === 'fr-CH' ? 'TVA' : locale === 'it-CH' ? 'IVA' : 'MWST'}</bdi></p>
    <dl className="al-invoice-dates">{([[l.issued, issueDate], [l.supplied, supplyDate], [l.due, dueDate]] as const).map(([label, date]) =>
      <div key={label}><dt>{label}</dt><dd><SwissDate value={date} locale={swissLocale} /></dd></div>)}</dl>
    <div className="al-invoice-items">
      <table aria-label={l.items}>
        <thead><tr>{[l.description, l.quantity, l.price, l.vat, l.net].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{lines.map((line, index) => <tr key={index}>
          <th scope="row">{line.description}</th>
          <td>{number(line.quantity)}{line.unit?.trim() && '\u00a0' + line.unit.trim()}</td>
          <td><data value={String(line.unitPrice)}>{columnAmount(invoiceUnitPriceCents(line.unitPrice))}</data></td>
          <td>{rate(line.vatRate)}</td><td>{columnAmount(result.lineNetCents[index])}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </div>
  return <article ref={ref} lang={locale} {...props} className={('al-invoice-document ' + className).trim()}>
    <InvoicePaper>
      <div className="al-invoice-pages">
        <div className="al-invoice-running" aria-hidden="true"><strong>{l.invoice} {invoiceNumber}</strong></div>
        {statement}
        <div className="al-invoice-summary">
          <dl>
            <div><dt>{l.net}</dt><dd>{amount(result.netCents)}</dd></div>
            {result.vat.map(bucket => <div key={bucket.rate}><dt>{l.vat} {rate(bucket.rate)} · {amount(bucket.baseCents)}</dt><dd>{amount(bucket.taxCents)}</dd></div>)}
            {result.roundingCents !== 0 && <div><dt>{l.adjustment}</dt><dd>{amount(result.roundingCents)}</dd></div>}
            <div className="al-invoice-total"><dt>{l.total}</dt><dd>{amount(result.totalCents)}</dd></div>
          </dl>
        </div>
      </div>
    </InvoicePaper>
    <div className="al-invoice-final">
      <div className="al-invoice-cut">{cutLabel[locale]}</div>
      <SwissQrBill fit bill={bill} locale={locale} printLayout="inline" />
    </div>
  </article>
})
