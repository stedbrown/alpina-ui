import { LocalizedSwissQrBill } from './swiss-qr-bill-locale.internal.js'
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { formatCreditorReference, formatQrReference, prepareSwissQrBill, type SwissQrAddress, type SwissQrBillData } from './qr-payment.js'
import { qrMatrix } from './qr-matrix.js'
import type { SwissLocale } from './locales.js'
import './swiss-qr-bill.css'

export type SwissQrBillLocale = SwissLocale | 'en'
export interface SwissQrBillProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  bill: SwissQrBillData
  locale?: SwissQrBillLocale
  /** Page prints a separate A4 sheet. Inline leaves page positioning to the invoice. */
  printLayout?: 'page' | 'inline'
  /** Scale the complete slip to fit a narrow screen. Printed dimensions stay in millimetres. */
  fit?: boolean
}

// The five correspondence languages and fixed headings are specified in SIX IG 2.4, Annex C.
function labels(receipt: string, payment: string, creditor: string, reference: string, additional: string,
  debtor: string, openDebtor: string, currency: string, amount: string, acceptance: string) {
  return { receipt, payment, creditor, reference, additional, debtor, openDebtor, currency, amount, acceptance }
}
type BillLabels = ReturnType<typeof labels>
const headings = {
  'de-CH': labels('Empfangsschein', 'Zahlteil', 'Konto / Zahlbar an', 'Referenz', 'Zusätzliche Informationen', 'Zahlbar durch', 'Zahlbar durch (Name/Adresse)', 'Währung', 'Betrag', 'Annahmestelle'),
  'fr-CH': labels('Récépissé', 'Section paiement', 'Compte / Payable à', 'Référence', 'Informations supplémentaires', 'Payable par', 'Payable par (nom/adresse)', 'Monnaie', 'Montant', 'Point de dépôt'),
  'it-CH': labels('Ricevuta', 'Sezione pagamento', 'Conto / Pagabile a', 'Riferimento', 'Informazioni supplementari', 'Pagabile da', 'Pagabile da (nome/indirizzo)', 'Valuta', 'Importo', 'Punto di accettazione'),
  'rm-CH': labels('Quittanza', 'Part da pajament', 'Conto / Da pajar a', 'Referenza', 'Infurmaziuns supplementaras', 'Da pajar da', 'Da pajar da (num/adressa)', 'Valuta', 'Import', 'Post da recepziun'),
  en: labels('Receipt', 'Payment part', 'Account / Payable to', 'Reference', 'Additional information', 'Payable by', 'Payable by (name/address)', 'Currency', 'Amount', 'Acceptance point'),
} satisfies Record<SwissQrBillLocale, BillLabels>

type Payment = ReturnType<typeof prepareSwissQrBill>

const pendingPrint = new WeakMap<Document, () => void>()

/** Opens the browser print dialog for one mounted slip, excluding surrounding application content. */
export function printSwissQrBill(element: HTMLElement): void {
  const document = element.ownerDocument
  const view = document.defaultView
  if (!view || !element.isConnected || !element.classList.contains('al-qr-bill'))
    throw new TypeError('Pass the mounted element from a SwissQrBill ref.')
  pendingPrint.get(document)?.()
  const ancestors: HTMLElement[] = []
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    ancestors.push(ancestor)
    ancestor.setAttribute('data-al-qr-print-path', '')
  }
  element.setAttribute('data-al-qr-print-target', '')
  function restore() {
    element.removeAttribute('data-al-qr-print-target')
    for (const ancestor of ancestors) ancestor.removeAttribute('data-al-qr-print-path')
    view?.removeEventListener('afterprint', restore)
    pendingPrint.delete(document)
  }
  pendingPrint.set(document, restore)
  view.addEventListener('afterprint', restore)
  try { view.print() } catch (error) { restore(); throw error }
}

function grouped(value: string, width: number): string {
  const parts = []
  for (let index = 0; index < value.length; index += width) parts.push(value.slice(index, index + width))
  return parts.join(' ')
}

const qrNames = { en: 'Swiss QR Code', 'de-CH': 'Swiss QR Code', 'fr-CH': 'Code QR suisse', 'it-CH': 'Codice QR svizzero', 'rm-CH': 'Code QR svizzer' }

const readingLabels = {
  en: 'Read payment details', 'de-CH': 'Zahlungsangaben lesen', 'fr-CH': 'Lire les données de paiement',
  'it-CH': 'Leggi i dati di pagamento', 'rm-CH': 'Leger las indicaziuns da pajament',
}

const blankLabels = {
  en: 'To be completed', 'de-CH': 'Auszufüllen', 'fr-CH': 'À compléter', 'it-CH': 'Da compilare', 'rm-CH': 'D’emplenir',
}

function QrCode({ payload, label }: { payload: string; label: string }) {
  const matrix = qrMatrix(payload)
  const path = matrix.flatMap((row, y) => {
    const runs = []
    for (let x = 0; x < row.length;) {
      if (!row[x]) { x++; continue }
      const start = x
      while (x < row.length && row[x]) x++
      const length = x - start
      runs.push('M' + start + ' ' + y + 'h' + length + 'v1h-' + length + 'z')
    }
    return runs
  }).join('')
  return (
    <svg viewBox="0 0 46 46" className="al-bill-qr" role="img" aria-label={label}>
      <svg viewBox={'0 0 ' + matrix.length + ' ' + matrix.length} width="46" height="46">
        <rect width="100%" height="100%" fill="white" />
        <path d={path} fill="black" shapeRendering="crispEdges" />
      </svg>
      <svg x="19.5" y="19.5" width="7" height="7" viewBox="0 0 7 7">
        <rect width="7" height="7" fill="white" />
        <rect x=".5" y=".5" width="6" height="6" fill="black" />
        <path fill="white" d="M2.93 1.41H4.1V5.3H2.93z M1.56 2.79h3.89v1.17H1.56z" />
      </svg>
    </svg>
  )
}

function Blank({ width, height }: { width: number; height: number }) {
  const w = width - .14, h = height - .14
  return <svg className="al-bill-blank" aria-hidden="true" width={width + 'mm'} height={height + 'mm'}
    viewBox={'0 0 ' + width + ' ' + height}>
    <path d={`M.14 3.14v-3h3 M${w-3} .14h3v3 M${w} ${h-3}v3h-3 M3.14 ${h}h-3v-3`}
      fill="none" stroke="black" strokeWidth=".2646" />
  </svg>
}

function Address({ address, omitStreet }: { address: SwissQrAddress; omitStreet: boolean }) {
  const street = [address.street, address.buildingNumber].filter(Boolean).join(' ')
  return <>
    <span>{address.name}</span>
    {street && !omitStreet && <span>{street}</span>}
    <span>{address.country === 'CH' ? '' : address.country + '-'}{address.postalCode} {address.town}</span>
  </>
}

function Entry({ title, children }: { title: string; children: ReactNode }) {
  return <div className="al-bill-entry"><dt>{title}</dt><dd>{children}</dd></div>
}

function Details({ bill, words, receipt = false, blankLabel }: { bill: Payment; words: BillLabels; receipt?: boolean; blankLabel?: string }) {
  const reference = bill.type === 'QRR'
    ? formatQrReference(bill.reference)
    : bill.type === 'SCOR' ? formatCreditorReference(bill.reference) : ''
  const omitStreet = receipt && [bill.creditor, bill.debtor].some(party => party &&
    (party.name.length > 22 || party.town.length + party.postalCode.length > 21 ||
     (party.street?.length ?? 0) + (party.buildingNumber?.length ?? 0) > 22))
  return <dl className="al-bill-details">
    <Entry title={words.creditor}><span className="al-bill-number">{grouped(bill.iban, 4)}</span><Address address={bill.creditor} omitStreet={omitStreet} /></Entry>
    {reference && <Entry title={words.reference}><span className="al-bill-number">{reference}</span></Entry>}
    {!receipt && (bill.message || bill.billingInformation) &&
      <Entry title={words.additional}><span>{bill.message}</span><span>{bill.billingInformation}</span></Entry>}
    <Entry title={bill.debtor ? words.debtor : words.openDebtor}>
      {bill.debtor ? <Address address={bill.debtor} omitStreet={omitStreet} /> :
        blankLabel ?? <Blank width={receipt ? 52 : 65} height={receipt ? 20 : 25} />}
    </Entry>
  </dl>
}

function Amount({ bill, words, receipt = false, blankLabel }: { bill: Payment; words: BillLabels; receipt?: boolean; blankLabel?: string }) {
  const [whole, cents] = bill.amount.split('.')
  const printed = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '.' + cents
  return <dl className="al-bill-amount">
    <Entry title={words.currency}>{bill.currency}</Entry>
    <Entry title={words.amount}>{bill.amount ? printed : blankLabel ?? <Blank width={receipt ? 30 : 40} height={receipt ? 10 : 15} />}</Entry>
  </dl>
}

export const SwissQrBill = forwardRef<HTMLDivElement, SwissQrBillProps>(function SwissQrBill(input, ref) {
  if (input.locale === undefined) return <LocalizedSwissQrBill {...input} ref={ref} />
  const { bill, locale, printLayout = 'page', fit = false, className = '', ...props } = input
  const payment = prepareSwissQrBill(bill, locale)
  const words = headings[locale]
  const dense = !payment.amount || [payment.creditor, payment.debtor].some(party => party &&
    (party.name.length > 36 || (party.street?.length ?? 0) > 42 || party.town.length > 24)) ||
    payment.message.length + payment.billingInformation.length > 60
  return (
    <><div {...props} ref={ref} className={('al-qr-bill ' + className).trim()} data-print-layout={printLayout} data-fit={fit || undefined}
      lang={locale} dir="ltr" role="region" aria-label={props['aria-label'] ?? words.receipt + ' / ' + words.payment} tabIndex={props.tabIndex ?? (fit ? undefined : 0)}>
      <div className="al-bill-slip">
        <section className="al-bill-receipt" aria-label={words.receipt}>
          <h2>{words.receipt}</h2>
          <Details bill={payment} words={words} receipt />
          <Amount bill={payment} words={words} receipt />
          <strong className="al-bill-accept">{words.acceptance}</strong>
        </section>
        <section className="al-bill-payment" aria-label={words.payment} data-dense={dense || undefined}>
          <h2>{words.payment}</h2>
          <QrCode payload={payment.payload} label={qrNames[locale]} />
          <Amount bill={payment} words={words} />
          <Details bill={payment} words={words} />
          {payment.alternatives.length > 0 && <div className="al-bill-procedures">
            {payment.alternatives.map((line, index) => {
              const name = line.match(/^[A-Za-z0-9]+/)?.[0] ?? ''
              return <div key={index}><b>{name}</b>{line.slice(name.length)}</div>
            })}
          </div>}
        </section>
      </div>
    </div>
    <details className="al-bill-reading" lang={locale}>
      <summary>{readingLabels[locale]}</summary>
      <Details bill={payment} words={words} blankLabel={blankLabels[locale]} />
      <Amount bill={payment} words={words} blankLabel={blankLabels[locale]} />
      {payment.alternatives.map((line, index) => <p key={index}>{line}</p>)}
    </details></>
  )
})
