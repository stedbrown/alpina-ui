import Link from 'next/link'
import { TextLink } from 'alpina-ui'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'alpina-ui/ui/card'
import { Stack } from 'alpina-ui/ui/stack'
import { CurrencyCHF } from 'alpina-ui/swiss/currency-chf'
import { localeNames } from 'alpina-ui/swiss/locales'
import { PaymentForm } from './payment-form'
import { BillingForm } from './billing-form'
import { billingLocale, localeCookie } from './preferences'

export default async function BillingPreferences() {
  const jar = await cookies()
  const locale = billingLocale(jar.get(localeCookie)?.value) ?? 'de-CH'
  return (
    <main>
      <Stack inset={6}>
        <Card>
          <CardHeader>
            <CardTitle as="h1">Billing preferences</CardTitle>
            <CardDescription>Choose the language for your next invoice.</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack>
              <p>Invoice language: <span lang={locale}>{localeNames[locale]}</span></p>
              <p>Annual subscription: <CurrencyCHF locale={locale} amount={1250} /></p>
              <TextLink asChild><Link href="/invoices/AP-104">Open sample invoice</Link></TextLink>
              <BillingForm locale={locale} />
              <PaymentForm locale={locale} />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </main>
  )
}
