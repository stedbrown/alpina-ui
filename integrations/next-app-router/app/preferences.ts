import { swissLocales } from 'alpina-ui/swiss/locales'

export const localeCookie = 'billing-locale'
export function billingLocale(value: unknown) {
  return swissLocales.find(locale => locale === value)
}
