import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from 'alpina-ui/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'alpina-ui/ui/card'
import { Field } from 'alpina-ui/ui/field'
import { Stack } from 'alpina-ui/ui/stack'
import { IbanInput } from 'alpina-ui/swiss/iban-input'
import { UidInput } from 'alpina-ui/swiss/uid-input'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { ibanSchema, uidSchema, type SwissStandardSchema } from 'alpina-ui/swiss/schemas'

function fieldSchema(schema: SwissStandardSchema<string>) {
  const checked = schema satisfies StandardSchemaV1<string, string>
  return z.string().transform((input, ctx) => {
    const result = checked['~standard'].validate(input)
    if (!result.issues) return result.value
    ctx.addIssue({ code: 'custom', message: result.issues[0].message })
    return z.NEVER
  })
}
import 'alpina-ui/styles.css'

const supplier = z.object({
  uid: fieldSchema(uidSchema()),
  iban: fieldSchema(ibanSchema()),
})

function SupplierForm() {
  const [confirmation, setConfirmation] = useState('')
  const { control, handleSubmit } = useForm<z.input<typeof supplier>, unknown, z.output<typeof supplier>>({
    resolver: zodResolver(supplier),
    defaultValues: { uid: '', iban: '' },
  })
  return (
    <main><Stack inset={6}>
      <Card>
        <CardHeader>
          <CardTitle as="h1">Supplier payment details</CardTitle>
          <CardDescription>Check the business identifier and bank account together.</CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onChange={() => setConfirmation('')} onSubmit={handleSubmit(({ uid, iban }) =>
            setConfirmation(uid + ' · Account ending in ' + iban.slice(-4)))}>
            <Stack align="start">
              <Controller name="uid" control={control} render={({ field, fieldState }) =>
                <Field label="Business UID" error={fieldState.error?.message}>
                  {props => <UidInput {...props} {...field} required />}
                </Field>} />
              <Controller name="iban" control={control} render={({ field, fieldState }) =>
                <Field label="IBAN" error={fieldState.error?.message}>
                  {props => <IbanInput {...props} {...field} required />}
                </Field>} />
              <Button type="submit">Check supplier</Button>
              <p role="status">{confirmation}</p>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Stack></main>
  )
}

createRoot(document.getElementById('root')!).render(<SupplierForm />)
