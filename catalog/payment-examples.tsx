import { useRef } from 'react'
import {
  AhvInput, Button, Field, IbanInput, PhoneInput, Stack, SwissQrBill, Typography, printSwissQrBill,
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
