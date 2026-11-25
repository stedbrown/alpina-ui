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
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const emailField = useRef<HTMLInputElement>(null)
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
    setEmailError(emailField.current?.validity.valid ? '' : 'Enter a valid email address.')
    setPasswordError(password.current.value ? '' : 'Enter your password.')
    if (!emailField.current?.validity.valid) {
      emailField.current?.focus()
      return
    }
    if (!password.current.value) {
      password.current.focus()
      return
    }
    const email = emailField.current.value.trim()
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
        <Stack gap={4}>
          <Typography as="h1" variant="title" tabIndex={-1} ref={heading}>
            {status === 'success' ? 'Signed in' : 'Sign in'}
          </Typography>
          <Typography variant="label">{workspaceName}</Typography>
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
          <form noValidate method="post" aria-label="Account sign-in" aria-busy={busy} onSubmit={signIn}
            onChange={() => { if (status === 'error') setStatus('idle') }}>
            <Stack gap={5}>
              <Separator weight="section" />
              <Field label="Email address" error={emailError}>{control =>
                <Input {...control} ref={emailField} onChange={() => setEmailError('')} name="email" type="email" autoComplete="username"
                  defaultValue={initialEmail} readOnly={busy} required />
              }</Field>
              <Field label="Password" error={passwordError}>{control =>
                <InputGroup trailing={<Button variant="ghost" size="sm" disabled={busy}
                  aria-controls={control.id} onClick={() => setVisible(!visible)}>
                  {visible ? 'Hide password' : 'Show password'}
                </Button>}>
                  <Input {...control} ref={password} onChange={() => setPasswordError('')} type={visible ? 'text' : 'password'}
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
