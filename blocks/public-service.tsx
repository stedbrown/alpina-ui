'use client'

import { echAddressSchema, formatAhvNumber, swissValidationMessage, type EchMailAddress, type SwissMessageLocale } from 'alpina-ui'
import { ServiceForm } from './public-service/form'
import { serviceMessages, type Messages } from './public-service/messages'
import type { PublicServiceDefinition, PublicServiceRequest, ServiceResult } from './public-service/definition'
export type { FieldErrors, PublicServiceDefinition, PublicServiceRequest, ServiceField, ServiceResult, ServiceStep, ServiceText } from './public-service/definition'

export interface ResidenceRequest {
  requestId: string
  locale: SwissMessageLocale
  ahv: string
  address: EchMailAddress
  attachments: File[]
}
interface BaseProps {
  initialLocale?: SwissMessageLocale
  /** Scope drafts to a service and, in an authenticated application, the current account. */
  draftKey?: string
}
interface ResidenceServiceProps extends BaseProps {
  service?: undefined
  onSubmit?: (request: ResidenceRequest) => ServiceResult | Promise<ServiceResult>
}
interface ConfiguredServiceProps extends BaseProps {
  service: PublicServiceDefinition
  onSubmit?: (request: PublicServiceRequest) => ServiceResult | Promise<ServiceResult>
}
export type PublicServiceBlockProps = ResidenceServiceProps | ConfiguredServiceProps

function usesServiceDefinition(props: PublicServiceBlockProps): props is ConfiguredServiceProps {
  return props.service !== undefined
}

function addressOf(values: Record<string, string>, language: SwissMessageLocale): EchMailAddress {
  return {
    person: { firstName: values.firstName.trim(), lastName: values.lastName.trim() },
    addressInformation: {
      street: values.street.trim(), ...(values.houseNumber.trim() && { houseNumber: values.houseNumber.trim() }),
      swissZipCode: /^[1-9][0-9]{3}$/.test(values.postalCode) ? Number(values.postalCode) : NaN,
      town: values.town.trim(), country: { countryIdISO2: 'CH', countryNameShort: serviceMessages[language].country },
    },
  }
}
function phrase(key: keyof Messages) {
  return { en: serviceMessages.en[key], 'de-CH': serviceMessages['de-CH'][key], 'fr-CH': serviceMessages['fr-CH'][key],
    'it-CH': serviceMessages['it-CH'][key], 'rm-CH': serviceMessages['rm-CH'][key] }
}

export const residenceCertificate: PublicServiceDefinition = {
  id: 'residence-certificate', title: phrase('title'), introduction: phrase('introduction'),
  steps: [
    { id: 'personal', title: phrase('personal'), fields: [
      { id: 'firstName', label: phrase('firstName'), required: true, autoComplete: 'given-name' },
      { id: 'lastName', label: phrase('lastName'), required: true, autoComplete: 'family-name' },
      { id: 'ahv', label: phrase('ahv'), required: true, type: 'ahv' },
    ], summary: (values, locale) => <>{values.firstName} {values.lastName}<br />{serviceMessages[locale].ahv} · {formatAhvNumber(values.ahv)}</> },
    { id: 'address', title: phrase('address'), content: 'address' },
    { id: 'attachments', title: phrase('attachments'), content: 'attachments' },
    { id: 'review', title: phrase('review'), content: 'review' },
  ],
  validate(values, locale) {
    const errors: Record<string, string> = {}
    const address = echAddressSchema(locale)['~standard'].validate(addressOf(values, locale))
    for (const issue of address.issues ?? []) {
      const key = issue.path?.at(-1)
      if (key === 'swissZipCode') errors.postalCode = swissValidationMessage('postalCode', locale)
      else if (typeof key === 'string' && Object.hasOwn(values, key)) errors[key] = issue.message
    }
    return errors
  },
}

export function PublicServiceBlock(props: PublicServiceBlockProps) {
  const service = props.service ?? residenceCertificate
  const draftKey = props.draftKey ?? service.id
  const handler = usesServiceDefinition(props) ? props.onSubmit : props.onSubmit && ((request: PublicServiceRequest) =>
    props.onSubmit!({ requestId: request.requestId, locale: request.locale, attachments: request.attachments,
      ahv: formatAhvNumber(request.values.ahv), address: addressOf(request.values, request.locale) }))
  return <ServiceForm key={service.id + ':' + draftKey} service={service} initialLocale={props.initialLocale ?? 'en'}
    draftKey={draftKey} onSubmit={handler} />
}
