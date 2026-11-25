import { useRef } from 'react'
import {
  MultilingualField, AhvInput, Button, Field, IbanInput, PhoneInput, Stack, SwissQrBill, Typography, UidInput, printSwissQrBill,
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
  return <Stack gap={4}>
    <Stack direction="row" justify="space-between">
      <Typography variant="label">Sample payment slip</Typography>
      <Button variant="outline" onClick={() => { if (slip.current) printSwissQrBill(slip.current) }}>Print payment slip</Button>
    </Stack>
    <SwissQrBill ref={slip} fit locale="en" bill={{
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
