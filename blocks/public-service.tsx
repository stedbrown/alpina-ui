'use client'

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  AhvInput, Alert, Button, DescriptionList, Field, FileInput, Grid, GridItem, Input,
  Separator, Stack, Steps, SwissPostalCodeInput, TextLink, ToggleGroup, Typography,
  ahvSchema, echAddressSchema, formatAhvNumber, localeNames, swissLocales, swissValidationMessage,
  type EchMailAddress, type SwissMessageLocale,
} from 'alpina-ui'

export interface ResidenceRequest {
  requestId: string
  locale: SwissMessageLocale
  ahv: string
  address: EchMailAddress
  attachments: File[]
}

export interface PublicServiceBlockProps {
  initialLocale?: SwissMessageLocale
  /** Scope drafts to a service and, in an authenticated application, the current account. */
  draftKey?: string
  /** Return the case number allocated by your service. Without a handler, the demo runs locally. */
  onSubmit?: (request: ResidenceRequest) => string | Promise<string>
}

const steps = ['personal', 'address', 'attachments', 'review'] as const
const personalFields = ['firstName', 'lastName', 'ahv'] as const
const addressFields = ['street', 'houseNumber', 'postalCode', 'town'] as const
const fieldsByStep: readonly (readonly (keyof Details)[])[] = [personalFields, addressFields, [], []]
const autocomplete: Partial<Record<keyof Details, string>> = {
  firstName: 'given-name', lastName: 'family-name', town: 'address-level2',
}
const languages = [...swissLocales, 'en'] as const
const languageOptions = languages.map(value => ({
  value, label: <span lang={value}>{value === 'en' ? 'English' : localeNames[value]}</span>,
}))
type Notice = 'saved' | 'deleted' | 'conflict' | 'saveError' | 'readError' | 'deleteError' | 'sendError'

function addressOf(details: Details, country: string): EchMailAddress {
  return {
    person: { firstName: details.firstName.trim(), lastName: details.lastName.trim() },
    addressInformation: {
      street: details.street.trim(), ...(details.houseNumber.trim() && { houseNumber: details.houseNumber.trim() }),
      swissZipCode: /^[1-9][0-9]{3}$/.test(details.postalCode) ? Number(details.postalCode) : NaN,
      town: details.town.trim(), country: { countryIdISO2: 'CH', countryNameShort: country },
    },
  }
}

function errorsFor(details: Details, locale: SwissMessageLocale) {
  const errors: Partial<Record<keyof Details, string>> = {}
  const ahv = ahvSchema(locale)['~standard'].validate(details.ahv)
  if (ahv.issues) errors.ahv = ahv.issues[0].message
  const address = echAddressSchema(locale)['~standard'].validate(addressOf(details, serviceMessages[locale].country))
  for (const issue of address.issues ?? []) {
    const key = issue.path?.at(-1)
    if (key === 'swissZipCode') errors.postalCode = swissValidationMessage('postalCode', locale)
    else if (typeof key === 'string' && Object.hasOwn(emptyDetails, key)) errors[key as keyof Details] = issue.message
  }
  for (const field of [...personalFields, ...addressFields]) {
    if (field !== 'houseNumber' && !details[field].trim()) errors[field] = swissValidationMessage('required', locale)
  }
  return errors
}

export function PublicServiceBlock({ initialLocale = 'en', draftKey = 'residence-certificate', onSubmit }: PublicServiceBlockProps) {
  // Remount if the host changes account or service while a draft lookup is pending.
  return <ServiceForm key={draftKey} initialLocale={initialLocale} draftKey={draftKey} onSubmit={onSubmit} />
}

function ServiceForm({ initialLocale, draftKey, onSubmit }: Required<Pick<PublicServiceBlockProps, 'initialLocale' | 'draftKey'>> & Pick<PublicServiceBlockProps, 'onSubmit'>) {
  const prefix = useId()
  const [locale, setLocale] = useState(initialLocale)
  const [step, setStep] = useState(0)
  const [details, setDetails] = useState<Details>(emptyDetails)
  const [files, setFiles] = useState<File[]>([])
  const [offered, setOffered] = useState<ServiceDraft>()
  const [revision, setRevision] = useState<string>()
  const [stale, setStale] = useState(false)
  const [busy, setBusy] = useState(true)
  const [attempted, setAttempted] = useState(false)
  const [notice, setNotice] = useState<Notice>()
  const [reference, setReference] = useState('')
  const locked = useRef(false)
  const requestId = useRef('')
  const panelHeading = useRef<HTMLElement>(null)
  const errorSummary = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState<{ target: 'heading' | 'errors' }>()
  const t = serviceMessages[locale]
  const errors = attempted ? errorsFor(details, locale) : {}
  const invalidFields = fieldsByStep[step].filter(key => errors[key])

  useEffect(() => {
    let active = true
    accessDraft(draftKey).then(draft => {
      if (!active || !draft) return
      setOffered(draft)
      setRevision(draft.revision)
      setLocale(draft.locale)
    }).catch(() => { if (active) setNotice('readError') })
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [draftKey])

  useEffect(() => {
    if (focus?.target === 'errors') errorSummary.current?.focus()
    if (focus?.target === 'heading') panelHeading.current?.focus()
  }, [focus])

  function showStep(next: number) {
    setAttempted(false)
    setNotice(undefined)
    setStep(next)
    setFocus({ target: 'heading' })
  }

  function draftFailure(error: unknown, failure: Notice) {
    if (error instanceof DraftConflict) {
      setRevision(undefined)
      setOffered(undefined)
      setStale(true)
      setNotice('conflict')
    } else setNotice(failure)
  }

  async function run(task: () => Promise<void>, failure: Notice) {
    if (locked.current || busy) return
    locked.current = true
    setBusy(true)
    setNotice(undefined)
    try { await task() }
    catch (error) { draftFailure(error, failure) }
    finally { locked.current = false; setBusy(false) }
  }

  function saveDraft() {
    void run(async () => {
      requestId.current ||= crypto.randomUUID()
      const next = { step, locale, details, attachments: files, revision: crypto.randomUUID(), requestId: requestId.current }
      await accessDraft(draftKey, { previous: revision, next })
      setRevision(next.revision)
      setNotice('saved')
    }, 'saveError')
  }

  function discardDraft() {
    void run(async () => {
      await accessDraft(draftKey, { previous: revision })
      setOffered(undefined)
      setRevision(undefined)
      setNotice('deleted')
      setFocus({ target: 'heading' })
    }, 'deleteError')
  }

  function resume(draft: ServiceDraft) {
    setDetails(draft.details)
    setFiles(draft.attachments)
    requestId.current = draft.requestId
    setOffered(undefined)
    showStep(draft.step)
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current || busy) return
    const problems = errorsFor(details, locale)
    const invalid = fieldsByStep.findIndex((fields, index) =>
      (step === 3 || step === index) && fields.some(field => problems[field]))
    if (invalid >= 0) {
      setStep(invalid)
      setAttempted(true)
      setFocus({ target: 'errors' })
      return
    }
    if (step < 3) { showStep(step + 1); return }
    void run(async () => {
      const id = requestId.current ||= crypto.randomUUID()
      const number = onSubmit
        ? await onSubmit({ requestId: id, locale, ahv: formatAhvNumber(details.ahv), address: addressOf(details, t.country), attachments: files })
        : 'DEMO-' + id.replaceAll('-', '').slice(0, 12).toUpperCase()
      if (typeof number !== 'string' || !number.trim()) throw new Error('A case number is required.')
      if (revision) {
        try { await accessDraft(draftKey, { previous: revision }); setRevision(undefined) }
        catch (error) { draftFailure(error, 'deleteError') }
      }
      setReference(number.trim())
      setDetails(emptyDetails)
      setFiles([])
      setFocus({ target: 'heading' })
    }, 'sendError')
  }

  function edit(field: keyof Details, event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value
    setDetails(previous => ({ ...previous, [field]: value }))
    setNotice(undefined)
  }

  function field(name: keyof Details) {
    return <Field key={name} id={prefix + '-' + name} label={t[name]} error={errors[name]}>{control => {
      const props = { ...control, name, value: details[name], required: name !== 'houseNumber', disabled: busy,
        onChange: (event: ChangeEvent<HTMLInputElement>) => edit(name, event) }
      if (name === 'ahv') return <AhvInput {...props} locale={locale} />
      if (name === 'postalCode') return <SwissPostalCodeInput {...props} locale={locale} />
      return <Input {...props} autoComplete={autocomplete[name]} />
    }}</Field>
  }

  const heading = (text: string) => <Typography as="h2" variant="heading" ref={panelHeading} tabIndex={-1}>{text}</Typography>
  const summary = [
    { term: t.personal, detail: <>{details.firstName} {details.lastName}<br />{t.ahv} · {formatAhvNumber(details.ahv)}</> },
    { term: t.address, detail: <>{[details.street, details.houseNumber].filter(Boolean).join(' ')}<br />{details.postalCode} {details.town}<br />{t.country}</> },
    { term: t.attachments, detail: files.length ? <ul>{files.map((file, index) => <li key={index}>{file.name}</li>)}</ul> : t.noFiles },
  ]

  return <Grid as="main" lang={locale} width="site" space="section" align="start">
    <GridItem medium={4} large={5}><Stack gap={5}>
      <Typography as="h1" variant="title">{t.title}</Typography>
      <Typography measure="narrow">{onSubmit ? t.introduction : t.demo}</Typography>
      <ToggleGroup label={t.language} options={languageOptions} value={[locale]} disabled={busy}
        onValueChange={([value]) => { if (languages.includes(value as SwissMessageLocale)) setLocale(value as SwissMessageLocale) }} />
      {!reference && !offered && <Steps label={t.progress} current={steps[step]} items={steps.map(id => ({ id, label: t[id] }))} />}
    </Stack></GridItem>
    <GridItem medium={4} large={6} start={{ large: 7 }}><Stack gap={4}>
      <Separator weight="section" />
      {reference ? <>
        {heading(onSubmit ? t.done : t.demoDone)}
        <DescriptionList items={[{ term: t.reference, detail: reference }]} />
        {revision && <Button variant="outline" disabled={busy} onClick={discardDraft}>{t.discard}</Button>}
        <Button disabled={busy || !!revision} onClick={() => { setReference(''); requestId.current = ''; showStep(0) }}>{t.again}</Button>
      </> : offered ? <>
        {heading(t.found)}
        <Typography>{t.privacy}</Typography>
        <Stack direction="row"><Button disabled={busy} onClick={() => resume(offered)}>{t.resume}</Button>
          <Button disabled={busy} variant="outline" onClick={discardDraft}>{t.discard}</Button></Stack>
      </> : <form method="post" noValidate onSubmit={next} aria-busy={busy} aria-label={t.title}>
        <Stack gap={4}>
          {heading(t[steps[step]])}
          {!!invalidFields.length && <Alert ref={errorSummary} tabIndex={-1} role="alert" tone="danger" title={t.issues}>
            <ul>{invalidFields.map(key => <li key={key}><TextLink href={'#' + prefix + '-' + key}>{t[key]} · {errors[key]}</TextLink></li>)}</ul>
          </Alert>}
          {fieldsByStep[step].map(field)}
          {step === 2 && <Field id={prefix + '-files'} label={t.files} description={t.fileHint}>{control =>
            <FileInput {...control} name="attachments" locale={locale} multiple disabled={busy} files={files}
              onFilesChange={nextFiles => { setFiles(nextFiles); setNotice(undefined) }} />
          }</Field>}
          {step === 3 && <Stack gap={4}>{summary.map(({ term, detail }, index) => <Stack key={steps[index]} gap={1} align="start">
            <DescriptionList items={[{ term, detail }]} />
            <Button variant="ghost" aria-label={t.edit + ' · ' + term} disabled={busy} onClick={() => showStep(index)}>{t.edit}</Button>
          </Stack>)}</Stack>}
          <Stack direction="row">
            {step > 0 && <Button variant="outline" disabled={busy} onClick={() => showStep(step - 1)}>{t.back}</Button>}
            <Button type="submit" disabled={busy}>{step === 3 ? t.confirm : t.next}</Button>
          </Stack>
          <Separator />
          <Typography variant="caption">{t.privacy}</Typography>
          <Stack direction="row"><Button variant="secondary" disabled={busy || stale} onClick={saveDraft}>{t.save}</Button>
            {revision && <Button variant="ghost" disabled={busy} onClick={discardDraft}>{t.discard}</Button>}</Stack>
        </Stack>
      </form>}
      {(notice || stale) && <Typography role={stale || notice?.endsWith('Error') ? 'alert' : 'status'}>{t[notice ?? 'conflict']}</Typography>}
    </Stack></GridItem>
  </Grid>
}

const emptyDetails = {
  firstName: '', lastName: '', ahv: '', street: '', houseNumber: '', postalCode: '', town: '',
}
type Details = typeof emptyDetails

interface ServiceDraft {
  revision: string
  requestId: string
  step: number
  locale: SwissMessageLocale
  details: Details
  attachments: File[]
}

class DraftConflict extends Error {}

// IndexedDB's structured clone preserves File bytes, names, MIME types and modification dates.
function accessDraft(key: string, change?: { previous: string | undefined; next?: ServiceDraft }): Promise<ServiceDraft | undefined> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('alpina-public-service-v1', 1)
    let blocked = false
    open.onblocked = () => { blocked = true; reject(new Error('Draft store unavailable')) }
    open.onupgradeneeded = () => open.result.createObjectStore('drafts')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      if (blocked) { db.close(); return }
      const transaction = db.transaction('drafts', change ? 'readwrite' : 'readonly')
      const drafts = transaction.objectStore('drafts')
      const read = drafts.get(key)
      let result: ServiceDraft | undefined
      let conflict = false
      read.onsuccess = () => {
        result = read.result
        if (!change) return
        // Another tab may have saved a newer revision since this form opened.
        if (result?.revision !== change.previous) {
          conflict = true
          transaction.abort()
          return
        }
        result = change.next
        if (result) drafts.put(result, key)
        else drafts.delete(key)
      }
      transaction.oncomplete = () => { db.close(); resolve(result) }
      transaction.onabort = () => { db.close(); reject(conflict ? new DraftConflict() : transaction.error) }
    }
  })
}

const english = {
  title: 'Residence certificate', language: 'Form language', progress: 'Application steps',
  demo: 'Try this service with fictional details. The demo creates a local case number.',
  introduction: 'Enter your details to request a residence certificate.',
  personal: 'Personal details', address: 'Postal address', attachments: 'Supporting documents', review: 'Review your request',
  firstName: 'First name', lastName: 'Last name', ahv: 'AHV number', street: 'Street',
  houseNumber: 'House number (optional)', postalCode: 'Postal code', town: 'Town', country: 'Switzerland',
  files: 'Attachments (optional)', fileHint: 'Add any documents that support your request.', noFiles: 'No attachments',
  next: 'Continue', back: 'Back', edit: 'Edit', confirm: 'Confirm request', issues: 'Check the following fields',
  save: 'Save draft', saved: 'Draft saved on this device.', found: 'A saved draft is available',
  resume: 'Resume draft', discard: 'Delete saved draft', deleted: 'Saved draft deleted.',
  privacy: 'Saving keeps your personal details and files in this browser until you delete the draft or finish the request.',
  conflict: 'The saved draft changed in another tab. Reload to open the latest draft, or continue here without saving.',
  saveError: 'The draft could not be saved on this device. You can still continue.',
  readError: 'Draft storage is unavailable. You can still complete the form.',
  deleteError: 'The saved draft could not be deleted. Try again.',
  sendError: 'Your request could not be completed. Your details are still here. Try again.',
  done: 'Request confirmed', demoDone: 'Demo complete', reference: 'Case number', again: 'Start another request',
}
type Messages = Record<keyof typeof english, string>

const serviceMessages: Record<SwissMessageLocale, Messages> = {
  en: english,
  'de-CH': {
    title: 'Wohnsitzbestätigung', language: 'Formularsprache', progress: 'Schritte des Gesuchs',
    demo: 'Testen Sie das Formular mit fiktiven Angaben. Die Demo erstellt eine lokale Geschäftsnummer.',
    introduction: 'Geben Sie Ihre Daten ein, um eine Wohnsitzbestätigung zu beantragen.',
    personal: 'Personalien', address: 'Postadresse', attachments: 'Beilagen', review: 'Gesuch prüfen',
    firstName: 'Vorname', lastName: 'Nachname', ahv: 'AHV-Nummer', street: 'Strasse',
    houseNumber: 'Hausnummer (optional)', postalCode: 'Postleitzahl', town: 'Ort', country: 'Schweiz',
    files: 'Dateien (optional)', fileHint: 'Fügen Sie bei Bedarf Belege für Ihr Gesuch hinzu.', noFiles: 'Keine Beilagen',
    next: 'Weiter', back: 'Zurück', edit: 'Bearbeiten', confirm: 'Gesuch bestätigen', issues: 'Prüfen Sie die folgenden Felder',
    save: 'Entwurf speichern', saved: 'Entwurf auf diesem Gerät gespeichert.', found: 'Ein gespeicherter Entwurf ist vorhanden',
    resume: 'Entwurf fortsetzen', discard: 'Gespeicherten Entwurf löschen', deleted: 'Gespeicherter Entwurf gelöscht.',
    privacy: 'Beim Speichern bleiben Ihre Personalien und Dateien in diesem Browser, bis Sie den Entwurf löschen oder das Gesuch abschliessen.',
    conflict: 'Der gespeicherte Entwurf wurde in einem anderen Tab geändert. Laden Sie die Seite neu, um den aktuellen Entwurf zu öffnen, oder fahren Sie hier ohne Speichern fort.',
    saveError: 'Der Entwurf konnte auf diesem Gerät nicht gespeichert werden. Sie können trotzdem fortfahren.',
    readError: 'Der Entwurfsspeicher ist nicht verfügbar. Sie können das Formular trotzdem ausfüllen.',
    deleteError: 'Der gespeicherte Entwurf konnte nicht gelöscht werden. Versuchen Sie es erneut.',
    sendError: 'Das Gesuch konnte nicht abgeschlossen werden. Ihre Angaben bleiben erhalten. Versuchen Sie es erneut.',
    done: 'Gesuch bestätigt', demoDone: 'Demo abgeschlossen', reference: 'Geschäftsnummer', again: 'Neues Gesuch beginnen',
  },
  'fr-CH': {
    title: 'Attestation de domicile', language: 'Langue du formulaire', progress: 'Étapes de la demande',
    demo: 'Essayez ce service avec des données fictives. La démo génère un numéro de dossier local.',
    introduction: 'Saisissez vos coordonnées pour demander une attestation de domicile.',
    personal: 'Données personnelles', address: 'Adresse postale', attachments: 'Pièces justificatives', review: 'Vérifier la demande',
    firstName: 'Prénom', lastName: 'Nom de famille', ahv: 'Numéro AVS', street: 'Rue',
    houseNumber: 'Numéro de rue (facultatif)', postalCode: 'Numéro postal', town: 'Localité', country: 'Suisse',
    files: 'Fichiers (facultatif)', fileHint: 'Ajoutez les pièces utiles à votre demande.', noFiles: 'Aucune pièce jointe',
    next: 'Continuer', back: 'Retour', edit: 'Modifier', confirm: 'Confirmer la demande', issues: 'Vérifiez les champs suivants',
    save: 'Enregistrer le brouillon', saved: 'Brouillon enregistré sur cet appareil.', found: 'Un brouillon est disponible',
    resume: 'Reprendre le brouillon', discard: 'Supprimer le brouillon enregistré', deleted: 'Brouillon supprimé.',
    privacy: 'Les données personnelles et les fichiers enregistrés restent dans ce navigateur jusqu’à la suppression du brouillon ou à la fin de la demande.',
    conflict: 'Le brouillon a changé dans un autre onglet. Rechargez la page pour ouvrir la dernière version ou continuez ici sans enregistrer.',
    saveError: 'Impossible d’enregistrer le brouillon sur cet appareil. Vous pouvez continuer.',
    readError: 'Le stockage des brouillons est indisponible. Vous pouvez remplir le formulaire.',
    deleteError: 'Impossible de supprimer le brouillon. Veuillez réessayer.',
    sendError: 'Impossible de terminer la demande. Vos données sont conservées dans le formulaire. Veuillez réessayer.',
    done: 'Demande confirmée', demoDone: 'Démo terminée', reference: 'Numéro de dossier', again: 'Commencer une autre demande',
  },
  'it-CH': {
    title: 'Certificato di domicilio', language: 'Lingua del modulo', progress: 'Fasi della richiesta',
    demo: 'Prova il servizio con dati fittizi. La demo genera un numero di pratica locale.',
    introduction: 'Inserisci i tuoi dati per richiedere un certificato di domicilio.',
    personal: 'Dati personali', address: 'Indirizzo postale', attachments: 'Documenti giustificativi', review: 'Verifica la richiesta',
    firstName: 'Nome', lastName: 'Cognome', ahv: 'Numero AVS', street: 'Via',
    houseNumber: 'Numero civico (facoltativo)', postalCode: 'NPA', town: 'Località', country: 'Svizzera',
    files: 'Allegati (facoltativi)', fileHint: 'Aggiungi eventuali documenti a sostegno della richiesta.', noFiles: 'Nessun allegato',
    next: 'Continua', back: 'Indietro', edit: 'Modifica', confirm: 'Conferma la richiesta', issues: 'Verifica i seguenti campi',
    save: 'Salva bozza', saved: 'Bozza salvata su questo dispositivo.', found: 'È disponibile una bozza salvata',
    resume: 'Riprendi bozza', discard: 'Elimina la bozza salvata', deleted: 'Bozza eliminata.',
    privacy: 'I dati personali e gli allegati salvati rimangono in questo browser finché non elimini la bozza o completi la richiesta.',
    conflict: 'La bozza è stata modificata in un’altra scheda. Ricarica la pagina per aprire l’ultima versione o continua qui senza salvare.',
    saveError: 'Impossibile salvare la bozza su questo dispositivo. Puoi comunque continuare.',
    readError: 'La memoria per le bozze non è disponibile. Puoi comunque compilare il modulo.',
    deleteError: 'Impossibile eliminare la bozza. Riprova.',
    sendError: 'Impossibile completare la richiesta. I tuoi dati sono ancora nel modulo. Riprova.',
    done: 'Richiesta confermata', demoDone: 'Demo completata', reference: 'Numero di pratica', again: 'Inizia una nuova richiesta',
  },
  'rm-CH': {
    title: 'Attest da domicil', language: 'Lingua dal formular', progress: 'Pass da la dumonda',
    demo: 'Empruvai quest servetsch cun indicaziuns fictivas. La demonstraziun generescha in numer da dossier local.',
    introduction: 'Endatai Vossas indicaziuns per dumandar in attest da domicil.',
    personal: 'Indicaziuns persunalas', address: 'Adressa postala', attachments: 'Documents cumprovants', review: 'Controllar la dumonda',
    firstName: 'Prenum', lastName: 'Num da famiglia', ahv: 'Numer AVS', street: 'Via',
    houseNumber: 'Numer da chasa (facultativ)', postalCode: 'Numer postal', town: 'Lieu', country: 'Svizra',
    files: 'Agiuntas (facultativas)', fileHint: 'Agiuntai ils documents che sustegnan Vossa dumonda.', noFiles: 'Naginas agiuntas',
    next: 'Cuntinuar', back: 'Enavos', edit: 'Modifitgar', confirm: 'Confermar la dumonda', issues: 'Controllai ils suandants champs',
    save: 'Memorisar il sboz', saved: 'Il sboz è memorisà sin quest apparat.', found: 'In sboz memorisà è disponibel',
    resume: 'Cuntinuar cun il sboz', discard: 'Stizzar il sboz memorisà', deleted: 'Il sboz è stizzà.',
    privacy: 'Las indicaziuns persunalas e las datotecas memorisadas restan en quest navigatur fin che Vus stizzais il sboz u terminaias la dumonda.',
    conflict: 'Il sboz è vegnì midà en in auter tab. Chargiai la pagina da nov per avrir la versiun actuala u cuntinuai qua senza memorisar.',
    saveError: 'Il sboz na po betg vegnir memorisà sin quest apparat. Vus pudais tuttina cuntinuar.',
    readError: 'La memoria per sbozs n’è betg disponibla. Vus pudais tuttina emplenir il formular.',
    deleteError: 'Il sboz na po betg vegnir stizzà. Empruvai anc ina giada.',
    sendError: 'La dumonda na po betg vegnir terminada. Vossas indicaziuns èn anc en il formular. Empruvai anc ina giada.',
    done: 'Dumonda confermada', demoDone: 'Demonstraziun terminada', reference: 'Numer da dossier', again: 'Cumenzar ina nova dumonda',
  },
}
