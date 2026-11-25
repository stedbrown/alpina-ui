'use client'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { requiredMessages } from './input-messages.internal.js'
import type { SwissMessageLocale } from './locales.js'
import { Input } from '../ui/input.js'

export interface SwissIdentifierInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'children'> {
  value?: string
  defaultValue?: string
  /** Native constraint validation message for a nonempty invalid value. */
  validationMessage?: string
  /** Language used for native validation feedback. */
  locale?: SwissMessageLocale
}
interface IdentifierFieldProps extends SwissIdentifierInputProps {
  type?: 'text' | 'tel'
  messages: Readonly<Record<SwissMessageLocale, string>>
  validate: (value: string) => boolean
  format: (value: string) => string
}

export const IdentifierField = forwardRef<HTMLInputElement, IdentifierFieldProps>(function IdentifierField(
  { value, defaultValue = '', validate, format, messages, locale, validationMessage = messages[locale ?? 'en'], onChange, onBlur, ...props }, ref,
) {
  const node = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => node.current!, [])
  const [local, setLocal] = useState(defaultValue)
  const [editing, setEditing] = useState(false)
  const source = value ?? local
  const display = editing ? source : format(source)
  function validateInput(input: HTMLInputElement) {
    const missing = input.required && !input.value
    input.setCustomValidity(missing ? requiredMessages[locale ?? 'en'] : input.value && !validate(input.value) ? validationMessage : '')
  }
  useEffect(() => {
    if (node.current) validateInput(node.current)
  }, [display, validate, validationMessage, locale, props.required])
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
  }, [value, defaultValue, format, validate, validationMessage, locale, props.required, props.form])
  return <Input lang={locale} {...props} ref={node} dir={props.dir ?? 'ltr'} spellCheck={false} value={display}
    onChange={event => {
      setEditing(true)
      validateInput(event.currentTarget)
      if (value === undefined) setLocal(event.currentTarget.value)
      onChange?.(event)
    }}
    onBlur={event => {
      setEditing(false)
      validateInput(event.currentTarget)
      onBlur?.(event)
    }}
  />
})
