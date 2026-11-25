'use client'

import { forwardRef, useImperativeHandle, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button } from '../ui/button.js'
import { Field } from '../ui/field.js'
import { Input } from '../ui/input.js'
import { Typography } from '../ui/typography.js'
import { TextLink } from '../portal/text-link.js'
import { CantonSelect } from './canton-select.js'
import { cantons, type CantonCode } from './cantons.js'
import { defaultSwissLocale, type SwissLocale } from './locales.js'
import { isSwissPostalCode } from './postal-code.js'
import { addressFieldLimit, isXmlAddressText, normalizeAddressText, type SwissAddress, type SwissAddressFormat } from './postal-address.js'
import { SwissPostalCodeInput } from './swiss-postal-code-input.js'
import './swiss-address-form.css'

export type { SwissAddress, SwissAddressFormat } from './postal-address.js'

const structuredLabels = {
  'de-CH': {
    firstName: 'Vorname (optional)',
    lastName: 'Nachname',
    organisation: 'Name der Organisation', addressLine1: 'Adresszusatz 1 (optional)', addressLine2: 'Adresszusatz 2 (optional)',
    streetName: 'Strasse',
    houseNumber: 'Hausnummer (optional)',
    required: 'Optionale Felder sind gekennzeichnet.',
    lengthError: 'Höchstens {n} Zeichen eingeben.',
    codeError: 'Geben Sie eine PLZ von 1000 bis 9999 ein.',
  },
  'fr-CH': {
    firstName: 'Prénom (facultatif)',
    lastName: 'Nom de famille',
    organisation: 'Nom de l’organisation', addressLine1: 'Complément d’adresse 1 (facultatif)', addressLine2: 'Complément d’adresse 2 (facultatif)',
    streetName: 'Rue',
    houseNumber: 'Numéro de maison (facultatif)',
    required: 'Les champs facultatifs sont indiqués.',
    lengthError: 'Saisissez au maximum {n} caractères.',
    codeError: 'Saisissez un NPA entre 1000 et 9999.',
  },
  'it-CH': {
    firstName: 'Nome (facoltativo)',
    lastName: 'Cognome',
    organisation: 'Nome dell’organizzazione', addressLine1: 'Complemento di indirizzo 1 (facoltativo)', addressLine2: 'Complemento di indirizzo 2 (facoltativo)',
    streetName: 'Via',
    houseNumber: 'Numero civico (facoltativo)',
    required: 'I campi facoltativi sono indicati.',
    lengthError: 'Inserisci al massimo {n} caratteri.',
    codeError: 'Inserisci un NPA compreso tra 1000 e 9999.',
  },
  'rm-CH': {
    firstName: 'Prenum (facultativ)',
    lastName: 'Num da famiglia',
    organisation: 'Num da l’organisaziun', addressLine1: 'Cumplement d’adressa 1 (facultativ)', addressLine2: 'Cumplement d’adressa 2 (facultativ)',
    streetName: 'Via',
    houseNumber: 'Numer da chasa (facultativ)',
    required: 'Ils champs facultativs èn inditgads.',
    lengthError: 'Endatai maximalmain {n} segns.',
    codeError: 'Endatai in NP tranter 1000 e 9999.',
  },
}

export interface SwissAddressLabels {
  title: string
  instruction: string
  recipient: string
  street: string
  postalCode: string
  locality: string
  canton: string
  selectCanton: string
  postalCodeHint: string
  requiredError: string
  postalCodeError: string
  submit: string
  saving: string
  saved?: string
  saveError: string
  errorSummary?: string
}

export const swissAddressLabels: Readonly<Record<SwissLocale, Readonly<SwissAddressLabels>>> = {
  'it-CH': {
    title: 'Indirizzo postale',
    instruction: 'Tutti i campi sono obbligatori.',
    recipient: 'Destinatario',
    street: 'Via e numero civico',
    postalCode: 'NPA',
    locality: 'Località',
    canton: 'Cantone',
    selectCanton: 'Scegli un cantone',
    postalCodeHint: '4 cifre',
    requiredError: 'Campo obbligatorio.',
    postalCodeError: 'Inserisci un NPA di quattro cifre.',
    submit: 'Salva indirizzo',
    saving: 'Salvataggio…',
    saved: 'Indirizzo salvato.',
    saveError: 'Salvataggio non riuscito. Riprova.',
    errorSummary: 'Campi da correggere',
  },
  'de-CH': {
    title: 'Postadresse',
    instruction: 'Alle Felder sind Pflichtfelder.',
    recipient: 'Empfängerin oder Empfänger',
    street: 'Strasse und Hausnummer',
    postalCode: 'PLZ',
    locality: 'Ort',
    canton: 'Kanton',
    selectCanton: 'Kanton wählen',
    postalCodeHint: '4 Ziffern',
    requiredError: 'Pflichtfeld.',
    postalCodeError: 'Geben Sie eine vierstellige PLZ ein.',
    submit: 'Adresse speichern',
    saving: 'Wird gespeichert…',
    saved: 'Adresse gespeichert.',
    saveError: 'Speichern fehlgeschlagen. Bitte erneut versuchen.',
    errorSummary: 'Zu korrigierende Felder',
  },
  'fr-CH': {
    title: 'Adresse postale',
    instruction: 'Tous les champs sont obligatoires.',
    recipient: 'Destinataire',
    street: 'Rue et numéro',
    postalCode: 'NPA',
    locality: 'Localité',
    canton: 'Canton',
    selectCanton: 'Choisir un canton',
    postalCodeHint: '4 chiffres',
    requiredError: 'Champ obligatoire.',
    postalCodeError: 'Saisissez un NPA à quatre chiffres.',
    submit: 'Enregistrer l’adresse',
    saving: 'Enregistrement…',
    saved: 'Adresse enregistrée.',
    saveError: 'Échec de l’enregistrement. Veuillez réessayer.',
    errorSummary: 'Champs à corriger',
  },
  'rm-CH': {
    title: 'Adressa postala',
    instruction: 'Tut ils champs èn obligatorics.',
    recipient: 'Num u firma',
    street: 'Via e numer',
    postalCode: 'NP',
    locality: 'Lieu',
    canton: 'Chantun',
    selectCanton: 'Tscherner in chantun',
    postalCodeHint: '4 cifras',
    requiredError: 'Champ obligatoric.',
    postalCodeError: 'Endatai in NP da quatter cifras.',
    submit: 'Arcunar l’adressa',
    saving: 'L’adressa vegn arcunada…',
    saved: 'Adressa arcunada.',
    saveError: 'L’adressa n’ha betg pudì vegnir arcunada. Empruvai anc ina giada.',
    errorSummary: 'Champs da curreger',
  },
}

export interface SwissAddressValidationResult {
  /** Human-readable application errors, translated by the caller. */
  fieldErrors: Partial<Record<keyof SwissAddress, string>>
}

export interface SwissAddressFormProps {
  locale?: SwissLocale
  /** Collect separate person or organisation fields for eCH-0010 street delivery. */
  format?: SwissAddressFormat
  initialValue?: Partial<SwissAddress>
  onSave: (
    address: SwissAddress,
  ) => void | SwissAddressValidationResult | Promise<void | SwissAddressValidationResult>
  labels?: Partial<SwissAddressLabels>
  className?: string
}

const requiredFields: (keyof SwissAddress)[] = ['recipient', 'street', 'postalCode', 'locality', 'canton']
type AddressField = keyof SwissAddress
type Issue = 'requiredError' | 'postalCodeError' | 'lengthError' | 'codeError' | 'characterError' | { message: string }
type AddressErrors = Partial<Record<AddressField, Issue>>

function fieldIssue(key: AddressField, value: string, format: SwissAddressFormat): Issue | undefined {
  if (!value && requiredFields.includes(key)) return 'requiredError'
  if (format !== 'compact' && !isXmlAddressText(value)) return 'characterError'
  const limit = addressFieldLimit(key, format)
  if (limit && [...value].length > limit) return 'lengthError'
  if (key === 'postalCode' && format !== 'compact' && !/^[1-9]\d{3}$/.test(value)) return 'codeError'
  if (key === 'postalCode' && !isSwissPostalCode(value)) return 'postalCodeError'
  if (key === 'canton' && !cantons.some(({ code }) => code === value)) return 'requiredError'
}

export const SwissAddressForm = forwardRef<HTMLFormElement, SwissAddressFormProps>(function SwissAddressForm(
  {
    locale = defaultSwissLocale,
    format = 'compact',
    initialValue,
    onSave,
    labels,
    className,
  },
  forwardedRef,
) {
  const prefix = useId()
  const structured = format !== 'compact'
  const extra = structuredLabels[locale]
  const text = { ...swissAddressLabels[locale], ...extra,
    ...(structured && { recipient: format === 'ech-person' ? extra.lastName : extra.organisation,
      instruction: extra.required, street: extra.streetName }), ...labels }
  const extraFields: AddressField[] = structured ? ['addressLine1', 'addressLine2'] : []
  const addressFields: AddressField[] = ['recipient', ...(format === 'ech-person' ? ['firstName' as const] : []),
    ...extraFields, 'street', ...(structured ? ['houseNumber' as const] : []), 'postalCode', 'locality', 'canton']
  const form = useRef<HTMLFormElement>(null)
  useImperativeHandle(forwardedRef, () => form.current!, [])
  const pendingFocus = useRef<AddressField | null>(null)
  const submitButton = useRef<HTMLButtonElement>(null)
  const validationStarted = useRef(false)
  const saving = useRef(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle')
  const [errors, setErrors] = useState<AddressErrors>({})
  // Retain the initial snapshot across language changes and parent re-renders.
  const [defaults] = useState(() => ({ ...initialValue }))
  const invalidFields = addressFields.filter((field) => errors[field])

  function focusField(name: AddressField) {
    const field = form.current?.elements.namedItem(name)
    if (field instanceof HTMLElement) field.focus()
  }

  function focusWithinForm() {
    const active = form.current?.ownerDocument.activeElement
    return active === form.current?.ownerDocument.body || (!!active && form.current?.contains(active))
  }

  useEffect(() => {
    const name = pendingFocus.current
    if (!name) return
    pendingFocus.current = null
    focusField(name)
  }, [errors])

  useEffect(() => {
    if (status === 'failed' && focusWithinForm()) submitButton.current?.focus()
  }, [status])

  function showErrors(issues: AddressErrors, focus: boolean) {
    const first = addressFields.find((field) => issues[field])
    pendingFocus.current = focus && first ? first : null
    validationStarted.current = !!first
    setErrors(issues)
    return !!first
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving.current) return
    const data = new FormData(event.currentTarget)
    const values = Object.fromEntries(
      addressFields.map((key) => [key, normalizeAddressText(String(data.get(key) ?? ''))]),
    ) as Record<AddressField, string>
    const issues: AddressErrors = {}
    for (const field of addressFields) {
      const issue = fieldIssue(field, values[field], format)
      if (issue) issues[field] = issue
    }
    if (showErrors(issues, true)) {
      setStatus('idle')
      return
    }
    saving.current = true
    setStatus('saving')
    try {
      const result = await onSave({ ...values, canton: values.canton as CantonCode })
      if (result?.fieldErrors) {
        const returned: AddressErrors = {}
        for (const field of addressFields) {
          const message = result.fieldErrors[field]?.trim()
          if (message) returned[field] = { message }
        }
        if (showErrors(returned, !!focusWithinForm())) {
          setStatus('idle')
          return
        }
      }
      setStatus('saved')
    } catch {
      setStatus('failed')
    } finally {
      saving.current = false
    }
  }

  function edit(event: FormEvent<HTMLFormElement>) {
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return
    const { name, value } = target
    const key = name as AddressField
    if (validationStarted.current && addressFields.includes(key)) {
      const next = fieldIssue(key, normalizeAddressText(value), format)
      setErrors((current) => (current[key] === next ? current : { ...current, [key]: next }))
    }
    if (status === 'failed' || status === 'saved') setStatus('idle')
  }

  function message(key: AddressField) {
    const issue = errors[key]
    if (issue === 'characterError') return {
      'it-CH': 'Rimuovi i caratteri di controllo non validi.', 'de-CH': 'Entfernen Sie die ungültigen Steuerzeichen.',
      'fr-CH': 'Retirez les caractères de contrôle non valides.', 'rm-CH': 'Allontanai ils segns da controlla nunvalaivels.',
    }[locale]
    if (issue === 'lengthError') return text.lengthError.replace('{n}', String(addressFieldLimit(key, format)))
    return typeof issue === 'string' ? text[issue] : issue?.message
  }

  function optionalField(key: 'firstName' | 'addressLine1' | 'addressLine2' | 'houseNumber') {
    return <Field key={key} id={prefix + '-' + key} className="al-address-street" label={text[key]} error={message(key)}>
      {control => <Input {...control} name={key} defaultValue={defaults[key]} autoComplete={key === 'firstName' ? 'given-name' : undefined} />}
    </Field>
  }

  return (
    <form
      ref={form}
      className={['al-address-form', className].filter(Boolean).join(' ')}
      lang={locale}
      aria-labelledby={prefix + '-title'}
      aria-describedby={prefix + '-instruction'}
      aria-busy={status === 'saving'}
      method="dialog"
      noValidate
      onSubmit={submit}
      onChange={edit}
    >
      <div className="al-address-heading">
        <Typography as="h2" variant="heading" id={prefix + '-title'}>
          {text.title}
        </Typography>
        <Typography as="p" variant="label" id={prefix + '-instruction'}>
          {text.instruction}
        </Typography>
      </div>
      {invalidFields.length > 1 && (
        <div className="al-address-summary" role="group" aria-labelledby={prefix + '-issues'}>
          <Typography as="h3" variant="label" id={prefix + '-issues'}>
            {text.errorSummary ?? swissAddressLabels[locale].errorSummary} ({invalidFields.length})
          </Typography>
          <ul>
            {invalidFields.map((field) => (
              <li key={field}>
                <TextLink
                  href={'#' + prefix + '-' + field}
                  onClick={(event) => {
                    event.preventDefault()
                    focusField(field)
                  }}
                >
                  {text[field]}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      )}
      <fieldset
        className="al-address-fields"
        disabled={status === 'saving'}
        aria-labelledby={prefix + '-title'}
      >
        <Field
          id={prefix + '-recipient'}
          className="al-address-recipient"
          label={text.recipient}
          error={message('recipient')}
        >
          {(control) => (
            <Input
              {...control}
              name="recipient"
              autoComplete={format === 'ech-person' ? 'family-name' : format === 'ech-organisation' ? 'organization' : 'name'}
              defaultValue={defaults.recipient}
              required
            />
          )}
        </Field>
        {format === 'ech-person' && optionalField('firstName')}
        {structured && optionalField('addressLine1')}
        {structured && optionalField('addressLine2')}
        <Field
          id={prefix + '-street'}
          className="al-address-street"
          label={text.street}
          error={message('street')}
        >
          {(control) => (
            <Input
              {...control}
              name="street"
              autoComplete="address-line1"
              defaultValue={defaults.street}
              required
            />
          )}
        </Field>
        {structured && optionalField('houseNumber')}
        <Field
          id={prefix + '-postalCode'}
          className="al-address-postcode"
          label={text.postalCode}
          description={text.postalCodeHint}
          error={message('postalCode')}
        >
          {(control) => (
            <SwissPostalCodeInput
              {...control}
              locale={locale}
              name="postalCode"
              defaultValue={defaults.postalCode ?? ''}
              required
            />
          )}
        </Field>
        <Field
          id={prefix + '-locality'}
          className="al-address-locality"
          label={text.locality}
          error={message('locality')}
        >
          {(control) => (
            <Input
              {...control}
              name="locality"
              autoComplete="address-level2"
              defaultValue={defaults.locality}
              required
            />
          )}
        </Field>
        <Field
          id={prefix + '-canton'}
          className="al-address-canton"
          label={text.canton}
          error={message('canton')}
        >
          {(control) => (
            <CantonSelect
              {...control}
              name="canton"
              autoComplete="address-level1"
              locale={locale}
              order="name"
              placeholder={text.selectCanton}
              defaultValue={defaults.canton ?? ''}
              required
            />
          )}
        </Field>
      </fieldset>
      <div className="al-address-actions">
        <span role="status">{status === 'saved' ? text.saved : null}</span>
        {status === 'failed' && (
          <span className="al-address-save-error" role="alert">
            {text.saveError}
          </span>
        )}
        <Button ref={submitButton} type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? text.saving : text.submit}
        </Button>
      </div>
    </form>
  )
})
