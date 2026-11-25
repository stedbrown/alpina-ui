'use client'
import { createElement, type ReactNode } from 'react'
import { LocaleContext } from './locale-context.internal.js'
import type { SwissMessageLocale } from './locales.js'

export interface AlpinaProviderProps {
  locale: SwissMessageLocale
  children?: ReactNode
}

/** Supply the default component language for a subtree, including its portals. */
export function AlpinaProvider({ locale, children }: AlpinaProviderProps) {
  return createElement(LocaleContext.Provider, { value: locale }, children)
}
