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

Set `locale` to `de-CH`, `fr-CH`, `it-CH`, `rm-CH`, or `en` for the prescribed headings. The encoded payment data stays the same. The payment slip uses the permitted document fonts and prints in black on white independently of the application theme.
