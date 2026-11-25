'use server'

import { ibanSchema } from 'alpina-ui/swiss/schemas'
import { cookies } from 'next/headers'
import { billingLocale, localeCookie } from './preferences'

export async function saveBillingLocale(_previous: string, data: FormData): Promise<string> {
  const locale = billingLocale(data.get('locale'))
  if (!locale) return 'Choose one of the four billing languages.'
  const jar = await cookies()
  jar.set(localeCookie, locale, { httpOnly: true, sameSite: 'lax', path: '/' })
  return 'Billing language saved.'
}

export async function checkPaymentAccount(_previous: { input: string; error: string; lastFour: string }, data: FormData) {
  const locale = billingLocale((await cookies()).get(localeCookie)?.value) ?? 'de-CH'
  const submitted = data.get('iban')
  const input = typeof submitted === 'string' ? submitted : ''
  const result = ibanSchema(locale)['~standard'].validate(submitted)
  if (result.issues) return { input, error: result.issues[0].message, lastFour: '' }
  return { input, error: '', lastFour: result.value.slice(-4) }
}
