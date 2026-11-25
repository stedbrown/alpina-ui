'use server'

import { cookies } from 'next/headers'
import { billingLocale, localeCookie } from './preferences'

export async function saveBillingLocale(_previous: string, data: FormData): Promise<string> {
  const locale = billingLocale(data.get('locale'))
  if (!locale) return 'Choose one of the four billing languages.'
  const jar = await cookies()
  jar.set(localeCookie, locale, { httpOnly: true, sameSite: 'lax', path: '/' })
  return 'Billing language saved.'
}
