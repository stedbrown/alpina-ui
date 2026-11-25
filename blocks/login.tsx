'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  Alert, Button, Field, Grid, GridItem, Input, InputGroup, Separator,
  Stack, TextLink, Typography,
} from 'alpina-ui'

export interface LoginBlockProps {
  onSignIn: (credentials: { email: string; password: string }) => void | Promise<void>
  initialEmail?: string
  workspaceName?: string
  recoveryHref?: string
  continueHref?: string
}

export function LoginBlock({
  onSignIn, initialEmail, workspaceName = 'Atelier workspace', recoveryHref, continueHref,
}: LoginBlockProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'error' | 'success'>('idle')
  const [visible, setVisible] = useState(false)
  const password = useRef<HTMLInputElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const submitting = useRef(false)
  const busy = status === 'pending'
  useEffect(() => {
    if (status === 'success') heading.current?.focus()
    if (status === 'error') password.current?.focus()
  }, [status])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current || !password.current) return
    const email = String(new FormData(event.currentTarget).get('email')).trim()
    submitting.current = true
    setStatus('pending')
    try {
      await onSignIn({ email, password: password.current.value })
      if (password.current) password.current.value = ''
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      submitting.current = false
    }
  }

  return (
    <Grid as="main" width="site" space="section" align="start">
      <GridItem medium={4} large={5}>
        <Stack surface="ink" inset={6} gap={6}>
          <Typography variant="label">{workspaceName}</Typography>
          <Separator />
          <Typography as="h1" variant="title" tabIndex={-1} ref={heading}>
            {status === 'success' ? 'Signed in' : 'Sign in'}
          </Typography>
          <Typography measure="narrow">
            {status === 'success' ? 'Your workspace is ready.' : 'Use your work email and password to open your account.'}
          </Typography>
        </Stack>
      </GridItem>
      <GridItem medium={4} large={5} start={{ large: 7 }}>
        {status === 'success' ? (
          <Stack gap={4} align="start">
            <Alert tone="success" title="Sign-in complete">You now have access to {workspaceName}.</Alert>
            {continueHref && <TextLink variant="action" href={continueHref}>Continue to workspace</TextLink>}
          </Stack>
        ) : (
          <form method="post" aria-label="Account sign-in" aria-busy={busy} onSubmit={signIn}
            onChange={() => { if (status === 'error') setStatus('idle') }}>
            <Stack gap={5}>
              <Separator weight="section" />
              <Field label="Email address">{control =>
                <Input {...control} name="email" type="email" autoComplete="username"
                  defaultValue={initialEmail} readOnly={busy} required />
              }</Field>
              <Field label="Password">{control =>
                <InputGroup trailing={<Button variant="ghost" size="sm" disabled={busy}
                  aria-controls={control.id} onClick={() => setVisible(!visible)}>
                  {visible ? 'Hide password' : 'Show password'}
                </Button>}>
                  <Input {...control} ref={password} type={visible ? 'text' : 'password'}
                    autoComplete="current-password" readOnly={busy} required />
                </InputGroup>
              }</Field>
              {status === 'error' && <Alert role="alert" tone="danger" title="Sign-in unsuccessful">
                Check your email and password, then try again.
              </Alert>}
              <Stack direction="row" justify="space-between" gap={3}>
                <Button busy={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</Button>
                {recoveryHref && <TextLink href={recoveryHref}>Forgot your password?</TextLink>}
              </Stack>
            </Stack>
          </form>
        )}
      </GridItem>
    </Grid>
  )
}
