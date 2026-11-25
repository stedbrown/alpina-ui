'use client'

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AhvInput, Alert, Button, DescriptionList, Field, FileInput, FormSteps, Grid, GridItem, Input,
  LanguageSwitcher, Separator, Stack, SwissAddressFields, TextLink, Typography, ahvSchema,
  swissValidationMessage, type SwissMessageLocale } from 'alpina-ui'
import { accessDraft, DraftConflict, type ServiceDraft } from './draft'
import { serviceMessages } from './messages'
import { stepFieldIds, translate, type FieldErrors, type PublicServiceDefinition, type PublicServiceRequest, type ServiceResult } from './definition'

type Notice = 'saved' | 'deleted' | 'conflict' | 'saveError' | 'readError' | 'deleteError' | 'sendError'
interface Props {
  service: PublicServiceDefinition
  initialLocale: SwissMessageLocale
  draftKey: string
  onSubmit?: (request: PublicServiceRequest) => ServiceResult | Promise<ServiceResult>
}
type Focus = { target: 'heading' | 'errors' } | { target: 'field'; id: string }

export function ServiceForm({ service, initialLocale, draftKey, onSubmit }: Props) {
  const prefix = useId()
  const [locale, setLocale] = useState(initialLocale)
  const [step, setStep] = useState(0)
  const steps = service.steps
  const section = steps[step]
  const fieldGroups = steps.map(stepFieldIds)
  const [empty] = useState<Record<string, string>>(() => {
    const keys = fieldGroups.flat()
    if (!steps.length || new Set(steps.map(item => item.id)).size !== steps.length || new Set(keys).size !== keys.length) {
      throw new Error('A service needs at least one step and unique step and field IDs.')
    }
    return Object.fromEntries(keys.filter(key => key !== 'attachments').map(key => [key, '']))
  })
  const [details, setDetails] = useState(empty)
  const [files, setFiles] = useState<File[]>([])
  const [offered, setOffered] = useState<ServiceDraft>()
  const [revision, setRevision] = useState<string>()
  const [stale, setStale] = useState(false)
  const [busy, setBusy] = useState(true)
  const [attempted, setAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const [notice, setNotice] = useState<Notice>()
  const [reference, setReference] = useState('')
  const locked = useRef(false)
  const requestId = useRef('')
  const panelHeading = useRef<HTMLElement>(null)
  const errorSummary = useRef<HTMLDivElement>(null)
  const [focus, setFocus] = useState<Focus>()
  const t = { ...serviceMessages[locale], ...service.copy?.[locale] }
  const stepLabels = steps.map(item => ({ id: item.id, label: translate(item.title, locale) }))
  const fieldLabels: Record<string, string> = { street: t.street, houseNumber: t.houseNumber, town: t.town, postalCode: t.postalCode, attachments: t.files }
  for (const item of steps) for (const field of item.fields ?? []) fieldLabels[field.id] = translate(field.label, locale)

  function validate() {
    const problems: FieldErrors = { ...service.validate?.(details, locale) }
    for (const item of steps) {
      for (const field of item.fields ?? []) {
        const value = details[field.id]?.trim()
        if (!value && field.required) problems[field.id] = swissValidationMessage('required', locale)
        else if (value && field.type === 'ahv') {
          const result = ahvSchema(locale)['~standard'].validate(value)
          if (result.issues) problems[field.id] = result.issues[0].message
        }
      }
      if (item.content === 'address') {
        for (const key of ['street', 'postalCode', 'town']) {
          if (!details[key]?.trim()) problems[key] = swissValidationMessage('required', locale)
        }
        if (details.postalCode && !/^[1-9][0-9]{3}$/.test(details.postalCode)) problems.postalCode = swissValidationMessage('postalCode', locale)
      }
    }
    return problems
  }
  const errors = { ...(attempted && validate()), ...serverErrors }
  const invalidFields = fieldGroups.flat().filter(key => errors[key] && (serverErrors[key] || fieldGroups[step].includes(key)))

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
    if (focus?.target === 'field') document.getElementById(prefix + '-' + focus.id)?.focus()
  }, [focus, prefix])

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
    setDetails({ ...empty, ...draft.details })
    setFiles(draft.attachments)
    requestId.current = draft.requestId
    setOffered(undefined)
    showStep(Math.min(draft.step, service.steps.length - 1))
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current || busy) return
    const final = step === steps.length - 1
    const problems = { ...validate(), ...serverErrors }
    const invalid = fieldGroups.findIndex((fields, index) => (final || step === index) && fields.some(key => problems[key]))
    if (invalid >= 0) {
      setStep(invalid)
      setAttempted(true)
      setFocus({ target: 'errors' })
      return
    }
    if (!final) { showStep(step + 1); return }
    void run(async () => {
      const id = requestId.current ||= crypto.randomUUID()
      const response = onSubmit ? await onSubmit({ requestId: id, locale, values: { ...details }, attachments: files })
        : 'DEMO-' + id.replaceAll('-', '').slice(0, 12).toUpperCase()
      if (typeof response !== 'string') {
        const validErrors = Object.fromEntries(fieldGroups.flat().filter(key => response?.fieldErrors?.[key]?.trim())
          .map(key => [key, response.fieldErrors[key]!.trim()]))
        if (!Object.keys(validErrors).length) throw new Error('A case number or known field error is required.')
        setServerErrors(validErrors)
        setFocus({ target: 'errors' })
        return
      }
      if (!response.trim()) throw new Error('A case number is required.')
      if (revision) {
        try { await accessDraft(draftKey, { previous: revision }); setRevision(undefined) }
        catch (error) { draftFailure(error, 'deleteError') }
      }
      setReference(response.trim())
      setDetails(empty)
      setFiles([])
      setFocus({ target: 'heading' })
    }, 'sendError')
  }

  function clearErrors(keys: readonly string[]) {
    setServerErrors(previous => Object.fromEntries(Object.entries(previous).filter(([id]) => !keys.includes(id))))
    setNotice(undefined)
  }
  function edit(patch: Record<string, string>) {
    setDetails(previous => ({ ...previous, ...patch }))
    clearErrors(Object.keys(patch))
  }
  const heading = (text: string) => <Typography as="h2" variant="heading" ref={panelHeading} tabIndex={-1}>{text}</Typography>
  function summary(index: number) {
    const part = steps[index]
    if (part.summary) return part.summary(details, locale)
    if (part.content === 'address') return <>{[details.street, details.houseNumber].filter(Boolean).join(' ')}<br />{details.postalCode} {details.town}<br />{t.country}</>
    if (part.content === 'attachments') return files.length ? <ul>{files.map((file, i) => <li key={i}>{file.name}</li>)}</ul> : t.noFiles
    return <DescriptionList items={(part.fields ?? []).map(field => ({ term: fieldLabels[field.id], detail: details[field.id] }))} />
  }
  const title = translate(service.title, locale)
  return <Grid as="main" lang={locale} width="site" space="section" align="start">
    <GridItem medium={4} large={6}><Stack gap={5}>
      <Typography as="h1" variant="title">{title}</Typography>
      <Typography measure="narrow">{onSubmit ? translate(service.introduction, locale) : t.demo}</Typography>
      <LanguageSwitcher label={t.language} value={locale} onLocaleChange={setLocale} disabled={busy} />
      {!reference && !offered && <FormSteps label={t.progress} items={stepLabels} current={section.id} compactLabel={t.stepCount} />}
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
      </> : <form method="post" noValidate onSubmit={next} aria-busy={busy} aria-label={title}>
        <Stack gap={4}>
          {heading(stepLabels[step].label)}
          {!!invalidFields.length && <Alert ref={errorSummary} tabIndex={-1} role="alert" tone="danger" title={t.issues}>
            <ul>{invalidFields.map(key => <li key={key}><TextLink href={'#' + prefix + '-' + key} onClick={event => {
              event.preventDefault()
              setStep(fieldGroups.findIndex(group => group.includes(key)))
              setFocus({ target: 'field', id: key })
            }}>{fieldLabels[key]} · {errors[key]}</TextLink></li>)}</ul>
          </Alert>}
          {(section.fields ?? []).map(field => <Field key={field.id} id={prefix + '-' + field.id} label={fieldLabels[field.id]}
            error={errors[field.id]}>{control => {
              const props = { ...control, name: field.id, value: details[field.id], required: field.required, disabled: busy,
                autoComplete: field.autoComplete, onChange: (event: ChangeEvent<HTMLInputElement>) => edit({ [field.id]: event.currentTarget.value }) }
              return field.type === 'ahv' ? <AhvInput {...props} locale={locale} /> : <Input {...props} />
            }}</Field>)}
          {section.content === 'address' && <SwissAddressFields locale={locale} format="ech-person" disabled={busy} idPrefix={prefix}
            fields={['street', 'houseNumber', 'postalCode', 'locality']} names={{ locality: 'town' }}
            labels={{ title: t.address, street: t.street, houseNumber: t.houseNumber, postalCode: t.postalCode, locality: t.town }}
            value={{ street: details.street, houseNumber: details.houseNumber, postalCode: details.postalCode, locality: details.town }}
            errors={{ ...errors, locality: errors.town }} onValueChange={(address, changed) => {
              const patch: Record<string, string> = {}
              for (const key of changed) if (key !== 'canton') patch[key === 'locality' ? 'town' : key] = address[key] ?? ''
              edit(patch)
            }} />}
          {section.content === 'attachments' && <Field id={prefix + '-attachments'} label={t.files} description={t.fileHint} error={errors.attachments}>{control =>
            <FileInput {...control} name="attachments" locale={locale} multiple disabled={busy} files={files}
              onFilesChange={nextFiles => { setFiles(nextFiles); clearErrors(['attachments']) }} />
          }</Field>}
          {section.content === 'review' && <Stack gap={4}>{steps.map((part, index) => part.content !== 'review' && <Stack key={part.id} gap={1} align="start">
            <DescriptionList items={[{ term: stepLabels[index].label, detail: summary(index) }]} />
            <Button variant="ghost" aria-label={t.edit + ' · ' + stepLabels[index].label} disabled={busy} onClick={() => showStep(index)}>{t.edit}</Button>
          </Stack>)}</Stack>}
          <Stack direction="row">
            {step > 0 && <Button variant="outline" disabled={busy} onClick={() => showStep(step - 1)}>{t.back}</Button>}
            <Button type="submit" disabled={busy}>{step === steps.length - 1 ? t.confirm : t.next}</Button>
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
