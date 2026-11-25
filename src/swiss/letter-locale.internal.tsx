'use client'
import { forwardRef } from 'react'
import { Letter, type LetterProps } from './letter.js'
import { useSwissLocale } from './locale-context.internal.js'

export const LocalizedLetter = forwardRef<HTMLElement, LetterProps>(function LocalizedLetter(props, ref) {
  const locale = useSwissLocale(props.locale)
  return <Letter {...props} locale={locale} ref={ref} />
})
