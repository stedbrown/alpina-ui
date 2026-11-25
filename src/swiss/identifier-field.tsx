'use client'
import { useMessageLocale } from './locale-context.internal.js'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import type { IdentifierIssue } from './identifier-checks.internal.js'
import type { SwissInputValueDetails } from './identifiers.js'
import { requiredMessages } from './input-messages.internal.js'
import type { SwissMessageLocale } from './locales.js'
import { Input } from '../ui/input.js'

export interface SwissIdentifierInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'children'> {
  value?: string
  defaultValue?: string
  /** Fires while editing and when blur changes the displayed value. */
  onValueChange?: (value: string, details: SwissInputValueDetails) => void
  /** Native constraint validation message for a nonempty invalid value. */
  validationMessage?: string
  /** Language used for native validation feedback. */
  locale?: SwissMessageLocale
}
interface IdentifierFieldProps extends SwissIdentifierInputProps {
  type?: 'text' | 'tel'
  messages: Readonly<Record<SwissMessageLocale, string>>
  validate: (value: string) => IdentifierIssue | boolean
  checksumMessages?: Readonly<Record<SwissMessageLocale, string>>
  format: (value: string) => string
}

export const IdentifierField = forwardRef<HTMLInputElement, IdentifierFieldProps>(function IdentifierField(
  { value, defaultValue = '', validate, format, messages, checksumMessages = messages, locale: requestedLocale, validationMessage,
    onChange, onBlur, onValueChange, ...props }, ref,
) {
  const locale = useMessageLocale(requestedLocale, 'en')
  const node = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => node.current!, [])
  const [local, setLocal] = useState(defaultValue)
  const [editing, setEditing] = useState(false)
  const source = value ?? local
  const display = editing ? source : format(source)
  function validateInput(input: HTMLInputElement) {
    const missing = input.required && !input.value
    const result = input.value ? validate(input.value) : true
    const invalid = result === false || result === 'format' || result === 'checksum'
    const translated = result === 'checksum' ? checksumMessages : messages
    input.setCustomValidity(missing ? requiredMessages[locale] : invalid ? validationMessage ?? translated[locale] : '')
    return !missing && !invalid
  }
  function report(displayed: string, valid: boolean) {
    // Valid IBANs and phone numbers use grouping spaces only in their display form.
    onValueChange?.(displayed, { normalized: displayed && valid ? format(displayed).replaceAll(' ', '') : null, valid })
  }
  useEffect(() => {
    if (node.current) validateInput(node.current)
  }, [display, validate, messages, checksumMessages, validationMessage, locale, props.required])
  useEffect(() => {
    const form = node.current?.form
    function reset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return
        setEditing(false)
        setLocal(defaultValue)
        // React controls the displayed value even when the parent uses defaultValue.
        if (node.current) {
          node.current.value = format(value ?? defaultValue)
          validateInput(node.current)
        }
      })
    }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [value, defaultValue, format, validate, messages, checksumMessages, validationMessage, locale, props.required, props.form])
  return <Input lang={locale} {...props} ref={node} dir={props.dir ?? 'ltr'} spellCheck={false} value={display}
    onChange={event => {
      setEditing(true)
      const edited = event.currentTarget.value
      const valid = validateInput(event.currentTarget)
      if (value === undefined) setLocal(edited)
      onChange?.(event)
      report(edited, valid)
    }}
    onBlur={event => {
      setEditing(false)
      const edited = event.currentTarget.value
      const formatted = format(edited)
      const valid = validateInput(event.currentTarget)
      onBlur?.(event)
      if (formatted !== edited) report(formatted, valid)
    }}
  />
})
