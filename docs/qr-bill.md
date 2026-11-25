# Print a Swiss QR-bill

`SwissQrBill` renders the receipt, payment part and Swiss QR Code from the same validated payment data. The implementation follows SIX Implementation Guidelines 2.4, effective November 14, 2026. [SIX implementation guidelines](https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.4-en.pdf) · [SIX layout specifications](https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/style-guide-qr-bill-en.pdf)

Import the library stylesheet or the individual `alpina-ui/styles/swiss-qr-bill.css` file. These example details are for testing. Supply your own account and the creditor name registered with your bank when issuing an invoice.

```tsx
import { SwissQrBill, type SwissQrBillData } from 'alpina-ui'
import 'alpina-ui/styles.css'

const example: SwissQrBillData = {
  iban: 'CH58 0079 1123 0008 8901 2',
  creditor: {
    name: 'Atelier Beispiel', street: 'Musterstrasse', buildingNumber: '12',
    postalCode: '8000', town: 'Zürich', country: 'CH',
  },
  currency: 'CHF',
  amount: '125.00',
  reference: { type: 'SCOR', value: 'RF18 5390 0754 7034' },
}

export function PaymentSlip() {
  return <SwissQrBill bill={example} locale="de-CH" />
}
```

## Printing a document

The full Alpina stylesheet sets A4 portrait with 16 mm top and side margins and an 18 mm foot margin. Printed tables repeat their headings and keep rows together. Cards stay together when they fit a page, and document links show their destinations. Navigation and elements marked `data-al-print="hide"` disappear. Apps importing individual component styles can add `import 'alpina-ui/print.css'` for the same document rules. A standalone QR-bill uses its own zero-margin A4 page to preserve the physical dimensions of the payment section.

## Payment data

Both CH and LI accounts require a valid IBAN checksum. Account type and reference must agree.

| Account | Reference | Currency |
| --- | --- | --- |
| QR-IBAN with institution ID 30000–31999 | QRR, 27 digits with a recursive modulo-10 check digit | CHF |
| Ordinary IBAN | SCOR, a valid ISO 11649 creditor reference beginning with RF | CHF or EUR |
| Ordinary IBAN | Omit the reference, or specify `{ type: 'NON' }` | CHF or EUR |

Addresses use structured fields. Include the name, postal code, town and ISO country code. Omit `debtor` or `amount` to print boxes for completion by hand. The maximum amount is 999,999,999.99. Use a decimal string for an exact amount with up to two decimal places.

SIX also defines non-payable notifications. Use `amount: '0.00'` together with the exact §4.4 notification message in the correspondence language, for example `DO NOT USE FOR PAYMENT` in English.

`buildSwissQrPayload(bill)` returns the UTF-8 payment text with LF separators. Invalid input raises `RangeError` before a payable code can be produced. The encoder uses error correction M and the smallest supported symbol that fits the payload. The 7 mm recognition cross sits at the centre of the 46 mm QR Code.

The public `message` is shown on the payment part. `billingInformation` accepts a registered provider's structured string. Both fields together may contain up to 140 permitted characters. `alternativeProcedures` accepts up to two provider-specific strings. The issuer supplies correctly registered provider syntax. The component validates the envelope and length.

## Print and correspondence languages

For a print button inside an application, pass the mounted bill element to `printSwissQrBill`. The browser's print dialog then includes only the selected payment slip. Cancelling or finishing restores normal document printing.

```tsx
import { useRef } from 'react'
import { Button, SwissQrBill, printSwissQrBill, type SwissQrBillData } from 'alpina-ui'

export function PrintableSlip({ bill }: { bill: SwissQrBillData }) {
  const slip = useRef<HTMLDivElement>(null)
  return <>
    <SwissQrBill bill={bill} ref={slip} />
    <Button onClick={() => { if (slip.current) printSwissQrBill(slip.current) }}>
      Print payment slip
    </Button>
  </>
}
```

The default print layout places the 210 × 105 mm slip at the foot of its own A4 sheet. Use actual size (100%), zero margins, and disable browser headers and footers. For a print template that already positions the slip, set `printLayout="inline"` and reserve exactly 210 × 105 mm at the bottom edge. Put the bill outside columns or ancestors with print padding or scaling. The receipt occupies the left 62 mm, the payment part the right 148 mm. Test a physical print with the grid sheet and your bank's validation process before issuing bills. [SIX print grid and validation resources](https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/qr-bill.html)

Set `locale` to `de-CH`, `fr-CH`, `it-CH`, `rm-CH`, or `en` for the prescribed headings. In Romansh, the two sections are headed *Quittanza* and *Part da pajament*. SIX IG 2.4 introduced the Romansh correspondence headings on 1 January 2026. Annex C, table 23 specifies the printed terms. The encoded payment data stays the same in every language. [SIX implementation guide, annex C](https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.4-en.pdf#page=62) · [SIX effective dates](https://www.six-group.com/fr/products-services/banking-services/payment-standardization/standards/qr-bill.html)

Pass a locale as the second argument to `buildSwissQrPayload(bill, 'rm-CH')` or `prepareSwissQrBill(bill, 'rm-CH')` for localized validation. The default for the pure functions is English. A rejected bill throws a `SwissQrValidationError`, a `RangeError` with a stable `code`, a field path such as `debtor.postalCode`, and a localized `message`. The payment slip uses the permitted document fonts and prints in black on white independently of the application theme.

## Printing a complete VAT invoice

`InvoiceDocument` takes the seller and customer from the payment data. Supply an invoice number, the supplier's Swiss VAT UID, issue, supply and due dates, and VAT-exclusive CHF line items. Each line specifies its description, quantity, unit price and VAT rate. Choose the rate applicable to the supply. The Swiss standard, reduced and accommodation rates are 8.1%, 2.6% and 3.8%. Zero is also supported for untaxed lines. [Federal Tax Administration rates](https://www.estv.admin.ch/en/vat-rates-switzerland) · [Live invoice example](https://alpina-ui.vercel.app/docs/components/invoice-document/)

Use decimal strings for imported amounts and fractional quantities. The calculator accepts up to four decimal places. Discounts take a negative unit price. It rounds each line's net to the nearest centime, groups the resulting bases by VAT rate, then rounds each group's VAT to the nearest centime. Half-centime ties round away from zero. An optional `cashRounding` adjustment rounds only the final total to five centimes. The summary, receipt and QR code all use that payable total. `calculateInvoiceTotals(lines, { cashRounding })` exposes the same calculation in integer centimes.

Short itemizations can share one A4 page with the payment slip. Longer ones flow across pages with repeated table headings, followed by a payment sheet with the totals and a single 210 × 105 mm slip at the bottom. The paper route requires perforated stock. Electronic PDFs include the separation instruction above the slip. Use the same A4 print settings as for a standalone Swiss QR-bill, and use `printSwissDocument` on the invoice ref to include the complete document. [SIX QR-bill implementation guidelines, sections 3.1 and 3.7](https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.4-en.pdf)
