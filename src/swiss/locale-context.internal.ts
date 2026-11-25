'use client'
import { createContext, useContext } from 'react'
import { defaultSwissLocale, type SwissLocale, type SwissMessageLocale } from './locales.js'

export const LocaleContext = createContext<SwissMessageLocale | undefined>(undefined)

export function useMessageLocale(locale: SwissMessageLocale | undefined, fallback: SwissMessageLocale) {
  const inherited = useContext(LocaleContext)
  return locale ?? inherited ?? fallback
}

export function useSwissLocale(locale?: SwissLocale) {
  const inherited = useContext(LocaleContext)
  return locale ?? (inherited === 'en' ? undefined : inherited) ?? defaultSwissLocale
}
