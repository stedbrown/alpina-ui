'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  AhvInput, AlpinaProvider, Button, Field, Grid, GridItem, Stack, SwissAddressFields, Typography,
  ahvSchema, cantons, echAddressSchema, type SwissAddress,
} from 'alpina-ui'
import 'alpina-ui/styles.css'

const fields = ['recipient', 'firstName', 'street', 'houseNumber', 'postalCode', 'locality', 'canton'] as const
type AddressKey = (typeof fields)[number]
type Errors = Partial<Record<AddressKey | 'ahv', string>>
const issueFields: Record<string, AddressKey> = {
  lastName: 'recipient', firstName: 'firstName', street: 'street', houseNumber: 'houseNumber',
  swissZipCode: 'postalCode', town: 'locality',
}
const avs = ahvSchema('it-CH')['~standard']
const postal = echAddressSchema('it-CH')['~standard']

function collect(form: HTMLFormElement) {
  const data = new FormData(form)
  const text = (key: AddressKey) => String(data.get(key) ?? '').trim()
  const ahv = avs.validate(data.get('ahv'))
  const errors: Errors = {}
  if (ahv.issues) errors.ahv = ahv.issues[0]?.message
  const postcode = text('postalCode')
  const first = text('firstName')
  const house = text('houseNumber')
  const address = postal.validate({
    person: { lastName: text('recipient'), ...(first && { firstName: first }) },
    addressInformation: {
      street: text('street'), ...(house && { houseNumber: house }), town: text('locality'),
      swissZipCode: /^[1-9][0-9]{3}$/.test(postcode) ? Number(postcode) : undefined,
      country: { countryIdISO2: 'CH', countryNameShort: 'Svizzera' },
    },
  })
  for (const issue of address.issues ?? []) {
    const key = issueFields[String(issue.path?.at(-1))]
    if (key) errors[key] = issue.message
  }
  if (!text('recipient')) errors.recipient = 'Inserisci il cognome del destinatario.'
  if (!text('street')) errors.street = 'Inserisci il nome della via.'
  if (!text('locality')) errors.locality = 'Inserisci la località.'
  if (!/^[1-9][0-9]{3}$/.test(postcode)) errors.postalCode = 'Inserisci un NPA di quattro cifre compreso tra 1000 e 9999.'
  const canton = cantons.find(entry => entry.code === text('canton'))
  if (!canton) errors.canton = 'Scegli il cantone dell’indirizzo postale.'

  const receipt = !ahv.issues && !address.issues && canton && !Object.keys(errors).length
    ? { address: address.value, canton: canton.code, lastDigits: ahv.value.slice(-2) }
    : null
  return { errors, receipt }
}

export default function Residence() {
  const [errors, setErrors] = useState<Errors>({})
  const [receipt, setReceipt] = useState<ReturnType<typeof collect>['receipt']>(null)
  const form = useRef<HTMLFormElement>(null)
  const confirmation = useRef<HTMLHeadingElement>(null)
  const attempted = useRef(false)
  useEffect(() => { document.documentElement.lang = 'it-CH' }, [])
  useEffect(() => { if (receipt) confirmation.current?.focus() }, [receipt])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    attempted.current = true
    const result = collect(event.currentTarget)
    setErrors(result.errors)
    setReceipt(result.receipt)
    const first = ['ahv', ...fields].find(key => result.errors[key as keyof Errors])
    if (first) {
      const control = event.currentTarget.elements.namedItem(first)
      if (control instanceof HTMLElement) control.focus()
    }
  }

  function edited() {
    if (attempted.current && form.current) setErrors(collect(form.current).errors)
    setReceipt(null)
  }

  return (
    <AlpinaProvider locale="it-CH">
      <Grid as="main" lang="it-CH" space="section" width="site" surface="paper">
        <GridItem medium={3} large={4}>
          <Stack gap={4}>
            <Typography variant="label" tone="accent">Sportello comunale · Controllo abitanti</Typography>
            <Typography as="h1" variant="display" responsive>Comunicare il recapito postale</Typography>
            <Typography measure="narrow">Tieni a portata di mano il numero AVS e inserisci l’indirizzo al quale ricevi la corrispondenza.</Typography>
            <Typography variant="caption">In questa dimostrazione la richiesta viene elaborata in questa pagina.</Typography>
          </Stack>
        </GridItem>
        <GridItem medium={5} large={6} start={{ large: 6 }}>
          <form ref={form} method="post" noValidate onSubmit={submit} onChange={edited}>
            <Stack gap={6}>
              <Field label="Numero AVS" description="13 cifre, con prefisso 756." error={errors.ahv}>
                {control => <AhvInput {...control} name="ahv" locale="it-CH" required
                  onBlur={event => {
                    if (!event.currentTarget.value) return
                    const result = avs.validate(event.currentTarget.value)
                    setErrors(previous => ({ ...previous, ahv: result.issues?.[0]?.message }))
                  }} />}
              </Field>
              <Typography as="h2" variant="heading" id="recapito">Indirizzo postale</Typography>
              <SwissAddressFields locale="it-CH" format="ech-person" aria-labelledby="recapito"
                fields={fields} errors={errors as Partial<Record<keyof SwissAddress, string>>} />
              <Stack align="start">
                <Button type="submit">Invia la richiesta</Button>
              </Stack>
            </Stack>
          </form>
          {receipt && <section aria-labelledby="conferma" style={{ marginBlockStart: '2rem' }}>
            <h2 ref={confirmation} tabIndex={-1} id="conferma">Richiesta acquisita nella dimostrazione</h2>
            <Typography>Numero AVS con cifre finali {receipt.lastDigits}.</Typography>
            <Typography as="address">
              {[receipt.address.person?.firstName, receipt.address.person?.lastName].filter(Boolean).join(' ')}<br />
              {[receipt.address.addressInformation.street, receipt.address.addressInformation.houseNumber].filter(Boolean).join(' ')}<br />
              {receipt.address.addressInformation.swissZipCode} {receipt.address.addressInformation.town} ({receipt.canton})
            </Typography>
          </section>}
        </GridItem>
      </Grid>
    </AlpinaProvider>
  )
}
