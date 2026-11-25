'use client'

import { useActionState, useState } from 'react'
import { Button, Field, IbanInput, Stack } from 'alpina-ui'
import { compactIban } from 'alpina-ui/swiss/identifiers'
import { ibanSchema } from 'alpina-ui/swiss/schemas'
import type { SwissLocale } from 'alpina-ui/swiss/locales'
import { checkPaymentAccount } from './actions'

export function PaymentForm({ locale }: { locale: SwissLocale }) {
  const [iban, setIban] = useState('')
  const [error, setError] = useState('')
  const [state, action, pending] = useActionState(checkPaymentAccount, { input: '', error: '', lastFour: '' })
  const current = compactIban(state.input) === compactIban(iban)
  return <form action={action} noValidate>
    <Stack align="start">
      <Field label="Payment account" error={error || (current && state.error)}>
        {props => <IbanInput {...props} locale={locale} name="iban" value={iban} required
          onChange={event => { setIban(event.target.value); setError('') }}
          onBlur={() => setError(ibanSchema(locale)['~standard'].validate(iban).issues?.[0].message ?? '')} />}
      </Field>
      <Button type="submit" busy={pending}>Check payment account</Button>
      <p role="status">{current && state.lastFour && 'Account verified · ' + state.lastFour}</p>
    </Stack>
  </form>
}
