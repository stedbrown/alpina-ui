'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import {
  Alert, Avatar, Button, DescriptionList, Field, Grid, GridItem, Input, Label,
  LocaleSelect, Separator, Stack, Switch, Typography, localeNames, type SwissLocale,
} from 'alpina-ui'

export interface AccountSettings {
  fullName: string
  email: string
  locale: SwissLocale
  weeklyDigest: boolean
}

export interface AccountSettingsBlockProps {
  initial: AccountSettings
  onSave: (settings: AccountSettings) => void | Promise<void>
  workspaceName?: string
}

export function AccountSettingsBlock({
  initial, onSave, workspaceName = 'Atelier workspace',
}: AccountSettingsBlockProps) {
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [nameError, setNameError] = useState('')
  const submitting = useRef(false)
  const name = useRef<HTMLInputElement>(null)
  const digest = useId()
  const busy = status === 'saving'
  const dirty = saved.fullName !== draft.fullName || saved.email !== draft.email ||
    saved.locale !== draft.locale || saved.weeklyDigest !== draft.weeklyDigest

  function edit(patch: Partial<AccountSettings>) {
    setDraft(current => ({ ...current, ...patch }))
    setStatus('idle')
    if (patch.fullName !== undefined) setNameError('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !dirty) return
    const next = { ...draft, fullName: draft.fullName.trim(), email: draft.email.trim() }
    if (!next.fullName) {
      setNameError('Enter your name.')
      name.current?.focus()
      return
    }
    submitting.current = true
    setStatus('saving')
    try {
      await onSave(next)
      setSaved(next)
      setDraft(next)
      setStatus('saved')
    } catch {
      setStatus('error')
    } finally {
      submitting.current = false
    }
  }

  function discard() {
    setDraft(saved)
    setStatus('idle')
    setNameError('')
    name.current?.focus()
  }

  return (
    <Grid as="main" width="site" space="section" align="start">
      <GridItem medium={4} large={5}>
        <Stack gap={5}>
          <Typography variant="label">{workspaceName}</Typography>
          <Typography as="h1" variant="title">Account settings</Typography>
          <Stack surface="soft" inset={5} gap={4}>
            <Stack direction="row" gap={3}>
              <Avatar name={saved.fullName} decorative />
              <Typography as="h2" variant="heading">{saved.fullName}</Typography>
            </Stack>
            <DescriptionList aria-label="Saved account details" items={[
              { term: 'Email', detail: saved.email },
              { term: 'Language', detail: localeNames[saved.locale] },
              { term: 'Weekly digest', detail: saved.weeklyDigest ? 'On' : 'Off' },
            ]} />
          </Stack>
        </Stack>
      </GridItem>
      <GridItem medium={4} large={5} start={{ large: 7 }}>
        <form method="post" aria-label="Edit account settings" aria-busy={busy} onSubmit={save}>
          <Stack gap={4}>
            <Separator weight="section" />
            <Typography as="h2" variant="heading">Profile</Typography>
            <Field label="Full name" error={nameError}>{control =>
              <Input {...control} ref={name} name="fullName" autoComplete="name" required readOnly={busy}
                value={draft.fullName} onChange={event => edit({ fullName: event.currentTarget.value })} />
            }</Field>
            <Field label="Email address">{control =>
              <Input {...control} type="email" name="email" autoComplete="email" required readOnly={busy}
                value={draft.email} onChange={event => edit({ email: event.currentTarget.value })} />
            }</Field>
            <Separator />
            <Typography as="h2" variant="heading">Preferences</Typography>
            <Field label="Preferred language">{control =>
              <LocaleSelect {...control} name="locale" value={draft.locale} disabled={busy}
                onLocaleChange={locale => edit({ locale })} />
            }</Field>
            <Stack direction="row" justify="space-between" wrap={false}>
              <Stack gap={1}>
                <Label htmlFor={digest}>Weekly digest</Label>
                <Typography id={digest + '-hint'} variant="caption">Email me a summary of workspace activity.</Typography>
              </Stack>
              <Switch id={digest} name="weeklyDigest" aria-describedby={digest + '-hint'} disabled={busy}
                checked={draft.weeklyDigest} onChange={event => edit({ weeklyDigest: event.currentTarget.checked })} />
            </Stack>
            {status === 'error' && <Alert tone="danger" role="alert" title="Changes could not be saved">
              Your edits are still here. Try saving again.
            </Alert>}
            <Separator />
            <Stack direction="row" gap={3}>
              <Button type="submit" busy={busy} disabled={!dirty}>{busy ? 'Saving…' : 'Save changes'}</Button>
              <Button variant="ghost" disabled={busy || !dirty} onClick={discard}>Discard changes</Button>
            </Stack>
            <Typography role="status" variant="caption">
              {status === 'saved' ? 'Changes saved.' : dirty && !busy ? 'Unsaved changes' : ''}
            </Typography>
          </Stack>
        </form>
      </GridItem>
    </Grid>
  )
}
