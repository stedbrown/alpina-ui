'use client'

import { useActionState } from 'react'
import { Button } from 'alpina-ui/ui/button'
import { Stack } from 'alpina-ui/ui/stack'
import { Field } from 'alpina-ui/ui/field'
import { LocaleSelect } from 'alpina-ui/swiss/locale-select'
import type { SwissLocale } from 'alpina-ui/swiss/locales'
import { saveBillingLocale } from './actions'

export function BillingForm({ locale }: { locale: SwissLocale }) {
  const [message, submit, pending] = useActionState(saveBillingLocale, '')
  return (
    <form action={submit}>
      <Stack align="start">
        <Field label="Billing language">
          {control => <LocaleSelect {...control} name="locale" defaultValue={locale} />}
        </Field>
        <Button type="submit" busy={pending}>Save language</Button>
        <p role="status">{message}</p>
      </Stack>
    </form>
  )
}
