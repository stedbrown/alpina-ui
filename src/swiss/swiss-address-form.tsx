'use client'

import { forwardRef, useImperativeHandle, useEffect, useId, useRef, useState, type ChangeEvent, type ComponentPropsWithoutRef, type FormEvent } from 'react'
import { Button } from '../ui/button.js'
import { Field } from '../ui/field.js'
import { Input } from '../ui/input.js'
import { Typography } from '../ui/typography.js'
import { TextLink } from '../portal/text-link.js'
import { NativeSelect } from '../interactive/native-select.js'
import { CantonSelect } from './canton-select.js'
import { cantons, type CantonCode } from './cantons.js'
import { defaultSwissLocale, type SwissLocale, type SwissMessageLocale } from './locales.js'
import { isSwissPostalCode } from './postal-code.js'
import { lookupSwissPostalCode, type SwissPostalLocality } from './postal-localities.js'
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
    chooseLocality: 'Ort und Kanton übernehmen',
    suggestions: 'Vorschläge für {code}',
    manualLocality: 'Kein Vorschlag. Ort und Kanton von Hand eingeben.',
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
    chooseLocality: 'Utiliser une localité et un canton',
    suggestions: 'Suggestions pour le NPA {code}',
    manualLocality: 'Aucune suggestion. Saisissez la localité et le canton.',
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
    chooseLocality: 'Usa una località e un cantone',
    suggestions: 'Suggerimenti per il NPA {code}',
    manualLocality: 'Nessun suggerimento. Inserisci la località e il cantone.',
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
    chooseLocality: 'Surpigliar in lieu ed in chantun',
    suggestions: 'Propostas per il NP {code}',
    manualLocality: 'Nagina proposta. Endatai il lieu ed il chantun.',
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
  chooseLocality?: string
  suggestions?: string
  manualLocality?: string
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
const englishAddress = {
  title: 'Postal address', instruction: 'All fields are required.', recipient: 'Recipient', street: 'Street and house number',
  postalCode: 'Postcode', locality: 'Town or city', canton: 'Canton', selectCanton: 'Choose a canton', postalCodeHint: '4 digits',
  firstName: 'First name (optional)', lastName: 'Last name', organisation: 'Organisation',
  addressLine1: 'Additional address line 1 (optional)', addressLine2: 'Additional address line 2 (optional)',
  streetName: 'Street', houseNumber: 'House number (optional)', required: 'Optional fields are marked.',
  chooseLocality: 'Use a locality and canton', suggestions: 'Suggestions for {code}', manualLocality: 'Enter the locality and canton manually.',
}

type AddressField = keyof SwissAddress
type AddressFieldLabels = Partial<Record<AddressField, string>> & Partial<Pick<SwissAddressLabels,
  'title' | 'postalCodeHint' | 'selectCanton' | 'chooseLocality' | 'suggestions' | 'manualLocality'>>

export interface SwissAddressFieldsProps extends Omit<ComponentPropsWithoutRef<'fieldset'>, 'children' | 'defaultValue' | 'onChange'> {
  locale?: SwissMessageLocale
  format?: SwissAddressFormat
  /** Address fields to collect in their display order. Native field names may be overridden. */
  fields?: readonly AddressField[]
  names?: Partial<Record<AddressField, string>>
  idPrefix?: string
  labels?: AddressFieldLabels
  value?: Partial<SwissAddress>
  defaultValue?: Partial<SwissAddress>
  errors?: Partial<Record<AddressField, string>>
  onValueChange?: (address: Partial<SwissAddress>, changedFields: readonly AddressField[]) => void
}

function defaultFields(format: SwissAddressFormat): AddressField[] {
  return ['recipient', ...(format === 'ech-person' ? ['firstName' as const] : []),
    ...(format !== 'compact' ? ['addressLine1' as const, 'addressLine2' as const] : []), 'street',
    ...(format !== 'compact' ? ['houseNumber' as const] : []), 'postalCode', 'locality', 'canton']
}

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
  const addressFields = defaultFields(format)
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

  function edit(address: Partial<SwissAddress>, changed: readonly AddressField[]) {
    if (validationStarted.current) setErrors(current => {
      const next = { ...current }
      for (const key of changed) next[key] = fieldIssue(key, normalizeAddressText(address[key] ?? ''), format)
      return next
    })
    setStatus('idle')
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
      <SwissAddressFields idPrefix={prefix} locale={locale} format={format} labels={text} defaultValue={defaults}
        disabled={status === 'saving'} aria-labelledby={prefix + '-title'} onValueChange={edit}
        errors={Object.fromEntries(addressFields.map(key => [key, message(key)]))} />
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

export const SwissAddressFields = forwardRef<HTMLFieldSetElement, SwissAddressFieldsProps>(function SwissAddressFields(
  { locale = defaultSwissLocale, format = 'compact', fields = defaultFields(format), names, idPrefix,
    labels, value, defaultValue, errors, onValueChange, className = '', ...rest }, forwardedRef,
) {
  const generated = useId()
  const prefix = idPrefix ?? generated
  const group = useRef<HTMLFieldSetElement>(null)
  useImperativeHandle(forwardedRef, () => group.current!, [])
  const base = locale === 'en' ? englishAddress : { ...swissAddressLabels[locale], ...structuredLabels[locale] }
  const text = { ...base, ...(format !== 'compact' && { street: base.streetName,
    recipient: format === 'ech-person' ? base.lastName : base.organisation }), ...labels }
  const [local, setLocal] = useState<Partial<SwissAddress>>(() => defaultValue ?? {})
  const address = value ?? local
  const initial = useRef(value ?? defaultValue)
  const [editedPostal, setEditedPostal] = useState(false)
  const completeInitial = !editedPostal && initial.current?.locality && initial.current.canton &&
    initial.current.postalCode === address.postalCode
  const query = fields.includes('postalCode') && !completeInitial ? address.postalCode ?? '' : ''
  const [result, setResult] = useState<{ code: string; places: SwissPostalLocality[] }>()
  const [chosen, setChosen] = useState('')
  const places = result?.code === query ? result.places : undefined

  useEffect(() => {
    if (!/^[1-9][0-9]{3}$/.test(query)) return
    let active = true
    const show = (places: SwissPostalLocality[]) => { if (active) setResult({ code: query, places }) }
    lookupSwissPostalCode(query).then(show, () => show([]))
    return () => { active = false }
  }, [query])
  useEffect(() => {
    const form = group.current?.form
    function reset(event: Event) {
      queueMicrotask(() => {
        if (event.defaultPrevented) return
        setLocal(defaultValue ?? {})
        setChosen('')
        setEditedPostal(false)
      })
    }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [defaultValue, rest.form])

  function update(patch: Partial<SwissAddress>) {
    const next = { ...address, ...patch }
    if (value === undefined) setLocal(next)
    onValueChange?.(next, Object.keys(patch) as AddressField[])
  }

  function renderField(key: AddressField, shared = false) {
    const name = names?.[key] ?? key
    const id = prefix + '-' + name
    const section = key === 'recipient' || key === 'canton' || key === 'locality' ? key : key === 'postalCode' ? 'postcode' : 'street'
    return <Field key={key} id={id} className={'al-address-' + section} label={text[key]}
      error={shared ? undefined : errors?.[key]}
      describedBy={shared ? [
        errors?.[key] && id + '-error',
        key === 'postalCode' && text.postalCodeHint && id + '-hint',
        key === 'postalCode' && places && prefix + '-postal-matches',
      ].filter(Boolean).join(' ') : undefined}>
      {control => {
        const common = { ...control, name, 'aria-invalid': errors?.[key] ? true as const : undefined, required: requiredFields.includes(key),
          onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            if (key === 'postalCode') setEditedPostal(true)
            if (['postalCode', 'locality', 'canton'].includes(key)) setChosen('')
            update({ [key]: event.currentTarget.value })
          } }
        if (key === 'postalCode') return <SwissPostalCodeInput {...common} value={address.postalCode ?? ''} locale={locale} />
        if (key === 'canton') return <CantonSelect {...common} value={address.canton ?? ''} locale={locale === 'en' ? 'de-CH' : locale}
          order="name" autoComplete="address-level1" placeholder={text.selectCanton} />
        const autoComplete = key === 'recipient' ? (format === 'ech-person' ? 'family-name' : format === 'ech-organisation' ? 'organization' : 'name')
          : key === 'firstName' ? 'given-name' : key === 'street' ? 'address-line1' : key === 'locality' ? 'address-level2' : undefined
        return <Input {...common} value={address[key] ?? ''} autoComplete={autoComplete} />
      }}
    </Field>
  }

  // Keep the caller's field order, including a standalone locality or canton.
  const rows: AddressField[][] = []
  const isLocation = (key: AddressField) => key === 'postalCode' || key === 'locality' || key === 'canton'
  for (const key of fields) {
    const last = rows.at(-1)
    if (last && isLocation(last[0]!) && isLocation(key)) last.push(key)
    else rows.push([key])
  }

  return <fieldset ref={group} lang={locale} aria-label={text.title} {...rest}
    className={('al-address-fields ' + className).trim()}>
    {rows.map(row => {
      if (!isLocation(row[0]!)) return renderField(row[0]!)
      return <div key={row[0]} className="al-address-location">
        <div className="al-address-row">{row.map(key => renderField(key, true))}</div>
        {row.map(key => {
          const id = prefix + '-' + (names?.[key] ?? key)
          const hint = key === 'postalCode' && text.postalCodeHint
          if (!errors?.[key] && !hint) return null
          return <div key={key} className="al-address-feedback">
            {errors?.[key] && <div className="al-field-error" id={id + '-error'}>{text[key]}: {errors[key]}</div>}
            {hint && <div className="al-field-hint" id={id + '-hint'}>{text[key]}: {hint}</div>}
          </div>
        })}
      </div>
    })}
    {fields.includes('postalCode') && <div className="al-address-suggestions">
      <span id={prefix + '-postal-matches'} aria-live="polite">{places && (places.length
        ? text.suggestions.replace('{code}', query) + ' (' + places.length + ') · ©swisstopo' : text.manualLocality)}</span>
      {!!places?.length && <NativeSelect aria-labelledby={prefix + '-postal-matches'} appearance="outline"
        value={chosen} onChange={event => {
          const index = event.currentTarget.value
          const place = places[Number(index)]
          if (!place || index === '') return
          setChosen(index)
          update({ locality: place.locality, canton: place.canton })
        }}>
        <option disabled value="">{text.chooseLocality}</option>
        {places.map(({ locality, canton }, index) => <option key={locality + canton} value={index}>{locality} ({canton})</option>)}
      </NativeSelect>}
    </div>}
  </fieldset>
})
