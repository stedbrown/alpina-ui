import { useRef, useState } from 'react'
import {
  InvoiceDocument, Letter, NativeSelect, localeNames, swissLocales, type SwissQrBillLocale, printSwissDocument, MultilingualField, AhvInput, Button, Field, IbanInput, PhoneInput, QrBillScanner, Stack, SwissQrBill, UidInput, printSwissQrBill,
} from 'alpina-ui'

export function IbanInputExample() {
  return <Field label="Payout account" description="Swiss or Liechtenstein IBAN">
    {props => <IbanInput {...props} name="iban" defaultValue="CH9300762011623852957" />}
  </Field>
}
export function AhvInputExample() {
  return <Field label="AHV number" description="13 digits, beginning with 756">
    {props => <AhvInput {...props} name="ahv" placeholder="756.xxxx.xxxx.xx" />}
  </Field>
}
export function PhoneInputExample() {
  return <Field label="Telephone" description="Enter a domestic number or include +41.">
    {props => <PhoneInput {...props} name="phone" placeholder="+41 32 765 43 21" />}
  </Field>
}
export function UidInputExample() {
  return <Field label="Swiss business identifier" description="CHE followed by nine digits, including the check digit.">
    {props => <UidInput {...props} name="uid" defaultValue="CHE-109.322.551" />}
  </Field>
}
export function SwissQrBillExample() {
  const slip = useRef<HTMLDivElement>(null)
  const [locale, setLocale] = useState<SwissQrBillLocale>('en')
  return <Stack gap={4}>
    <Stack direction="row" justify="space-between">
      <Field label="Payment slip language">{props => <NativeSelect {...props} value={locale}
        onChange={event => setLocale(event.currentTarget.value as SwissQrBillLocale)}>
        <option value="en" lang="en">English</option>
        {swissLocales.map(tag => <option key={tag} value={tag} lang={tag}>{localeNames[tag]}</option>)}
      </NativeSelect>}</Field>
      <Button variant="outline" onClick={() => { if (slip.current) printSwissQrBill(slip.current) }}>Print payment slip</Button>
    </Stack>
    <SwissQrBill ref={slip} fit locale={locale} bill={{
      iban: 'CH58 0079 1123 0008 8901 2', currency: 'CHF', amount: '211.00',
      creditor: { name: 'Muster Krankenkasse', street: 'Musterstrasse', buildingNumber: '12', postalCode: '8000', town: 'Seldwyla', country: 'CH' },
      debtor: { name: 'Sarah Beispiel', street: 'Musterstrasse', buildingNumber: '1', postalCode: '8000', town: 'Seldwyla', country: 'CH' },
      reference: { type: 'SCOR', value: 'RF18539007547034' },
    }} />
  </Stack>
}

export function MultilingualFieldExample() {
  return <MultilingualField name="title" label="Exhibition title" defaultValue={{ de: 'Die neue Typografie', fr: 'La nouvelle typographie' }} />
}

export function LetterExample() {
  const letter = useRef<HTMLElement>(null)
  return <Stack gap={4}>
    <Button variant="outline" onClick={() => { if (letter.current) printSwissDocument(letter.current) }}>Print letter</Button>
    <Letter ref={letter} sender={['Atelier Nord', 'Rue du Lac 8', '2000 Neuchâtel']}
      recipient={['Clara Meier', 'Aarbergergasse 7', '3011 Bern']} subject="Your first proof"
      date="2026-11-25" place="Neuchâtel" windowPosition="left">
      <p>Dear Clara,</p><p>The printed proofs are ready for review. Please return the marked sheets by Friday.</p>
      <p>Sincerely,<br />Atelier Nord</p>
    </Letter>
  </Stack>
}

export function InvoiceDocumentExample() {
  const invoice = useRef<HTMLElement>(null)
  return <Stack gap={4}>
    <Button variant="outline" onClick={() => { if (invoice.current) printSwissDocument(invoice.current) }}>Print invoice</Button>
    <InvoiceDocument ref={invoice} invoiceNumber="AN-104" issueDate="2026-11-25" supplyDate="2026-11-24"
      dueDate="2026-12-25" vatNumber="CHE-109.322.551" locale="en"
      lines={[{ description: 'Proof review', quantity: 2, unit: 'h', unitPrice: '80.00', vatRate: 8.1 },
        { description: 'Printed catalogue', quantity: 1, unitPrice: '24.00', vatRate: 2.6 }]}
      payment={{ iban: 'CH5800791123000889012',
        creditor: { name: 'Atelier Nord', street: 'Rue du Lac', buildingNumber: '8', postalCode: '2000', town: 'Neuchâtel', country: 'CH' },
        debtor: { name: 'Clara Meier', street: 'Aarbergergasse', buildingNumber: '7', postalCode: '3011', town: 'Bern', country: 'CH' } }} />
  </Stack>
}

export function QrBillScannerExample() {
  return <QrBillScanner locale="en" />
}
