import type { ReactNode } from 'react'
import type { SwissMessageLocale } from 'alpina-ui'
import type { Messages } from './messages'

export type ServiceText = string | Partial<Record<SwissMessageLocale, string>> & { en: string }
export type FieldErrors = Partial<Record<string, string>>
export type ServiceResult = string | { fieldErrors: FieldErrors }
export interface PublicServiceRequest {
  requestId: string
  locale: SwissMessageLocale
  values: Record<string, string>
  attachments: File[]
}
export interface ServiceField {
  id: string
  label: ServiceText
  type?: 'text' | 'ahv'
  required?: boolean
  autoComplete?: string
}
export interface ServiceStep {
  id: string
  title: ServiceText
  fields?: readonly ServiceField[]
  content?: 'address' | 'attachments' | 'review'
  summary?: (values: Record<string, string>, language: SwissMessageLocale) => ReactNode
}
export interface PublicServiceDefinition {
  id: string
  title: ServiceText
  introduction: ServiceText
  steps: readonly ServiceStep[]
  copy?: Partial<Record<SwissMessageLocale, Partial<Messages>>>
  validate?: (values: Record<string, string>, language: SwissMessageLocale) => FieldErrors
}

export function translate(text: ServiceText, locale: SwissMessageLocale) {
  return typeof text === 'string' ? text : text[locale] ?? text.en
}
export function stepFieldIds(step: ServiceStep): string[] {
  return [...(step.fields ?? []).map(field => field.id),
    ...(step.content === 'address' ? ['street', 'houseNumber', 'postalCode', 'town'] : step.content === 'attachments' ? ['attachments'] : [])]
}
