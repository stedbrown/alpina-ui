import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import {
  Alert, Button, CurrencyCHF, DescriptionList, Field, Grid, GridItem, Input,
  RadioGroup, Separator, Stack, Steps, SwissDate, Typography,
} from 'alpina-ui'

const sessions = [
  { id: 'letterpress', title: 'Letterpress composition', date: '2027-03-18', time: '09:00–12:00', fee: 85, full: false },
  { id: 'overprinting', title: 'Two-colour overprinting', date: '2027-03-19', time: '13:30–17:00', fee: 95, full: false },
  { id: 'bookbinding', title: 'Hand bookbinding', date: '2027-03-20', time: '09:00–12:00', fee: 70, full: true },
]
const steps = [
  { id: 'details', label: 'Your details' },
  { id: 'review', label: 'Review' },
  { id: 'confirmed', label: 'Confirmation' },
]
type Stage = 'details' | 'review' | 'confirmed'
type Registration = { sessionId: string; name: string; email: string }
const emptyRegistration = { sessionId: sessions[0].id, name: '', email: '' }

function emailError(input: HTMLInputElement) {
  if (!input.value.trim()) return 'Enter an email address.'
  return input.validity.typeMismatch ? 'Enter an email address such as name@example.org.' : ''
}

export function WorkshopRegistration() {
  const [stage, setStage] = useState<Stage>('details')
  const [draft, setDraft] = useState<Registration>(emptyRegistration)
  const [saved, setSaved] = useState<Registration | null>(null)
  const [errors, setErrors] = useState({ name: '', email: '' })
  const nameInput = useRef<HTMLInputElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const previousStage = useRef(stage)
  const heading = useId()
  const session = sessions.find(({ id }) => id === draft.sessionId)!
  useEffect(() => {
    if (previousStage.current !== stage) document.getElementById(heading)?.focus()
    previousStage.current = stage
  }, [stage, heading])

  function review(event: FormEvent) {
    event.preventDefault()
    const name = draft.name.trim()
    const nextErrors = {
      name: name ? '' : 'Enter the name of the person attending.',
      email: emailError(emailInput.current!),
    }
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email) {
      requestAnimationFrame(() => (nextErrors.name ? nameInput : emailInput).current?.focus())
      return
    }
    setDraft({ ...draft, name, email: draft.email.trim() })
    setStage('review')
  }

  return (
    <Grid as="main" id="main-content" width="site" space="section" tabIndex={-1}>
      <GridItem large={5}>
        <Stack gap={4}>
          <Typography as="h1" variant="display">Workshop registration</Typography>
          <Typography variant="label">Basel Print Room</Typography>
          <Typography measure="narrow">Book one place at a hands-on print workshop. Materials and use of the press are included.</Typography>
          <Separator />
          <Typography variant="caption">This is a demo. Your registration stays on this page until you reload it.</Typography>
        </Stack>
      </GridItem>
      <GridItem large={6} start={{ large: 7 }}>
        <Stack gap={6}>
          <Steps label="Registration progress" items={steps} current={stage} />
          <Typography as="h2" id={heading} tabIndex={-1} variant="heading">
            {{ details: 'Choose a session', review: 'Review your registration', confirmed: 'Registration confirmed' }[stage]}
          </Typography>
          {stage === 'details' ? (
            <form onSubmit={review} noValidate>
              <Stack gap={5}>
                <RadioGroup
                  label="Workshop session" name="workshop" value={draft.sessionId}
                  onValueChange={(sessionId) => setDraft({ ...draft, sessionId })}
                  options={sessions.map((item) => ({
                    value: item.id,
                    disabled: item.full,
                    label: <>{item.title}{item.full ? ' · Fully booked' : ''}<br />
                      <SwissDate value={item.date} locale="de-CH" dateStyle="medium" /> · {item.time} · <CurrencyCHF locale="de-CH" amount={item.fee} /></>,
                  }))}
                />
                <Separator />
                <Field label="Attendee name" error={errors.name}>
                  {(control) => <Input {...control} ref={nameInput} name="name" autoComplete="name" required value={draft.name}
                    onChange={({ currentTarget }) => {
                      setDraft({ ...draft, name: currentTarget.value })
                      if (errors.name && currentTarget.value.trim()) setErrors({ ...errors, name: '' })
                    }} />}
                </Field>
                <Field label="Email address" error={errors.email}>
                  {(control) => <Input {...control} ref={emailInput} name="email" type="email" autoComplete="email" required value={draft.email}
                    onChange={({ currentTarget }) => {
                      setDraft({ ...draft, email: currentTarget.value })
                      if (errors.email) setErrors({ ...errors, email: emailError(currentTarget) })
                    }} />}
                </Field>
                <Stack direction="row" gap={3}>
                  <Button type="submit">Review registration</Button>
                  {saved && <Button variant="ghost" onClick={() => {
                    setDraft(saved)
                    setErrors({ name: '', email: '' })
                    setStage('confirmed')
                  }}>Discard changes</Button>}
                </Stack>
              </Stack>
            </form>
          ) : (
            <Stack gap={5}>
              {stage === 'confirmed' && <Alert tone="success" title="One place reserved">{draft.name} is on the demo attendance list.</Alert>}
              <DescriptionList aria-label="Registration details" items={[
                { term: 'Workshop', detail: session.title },
                { term: 'Date and time', detail: <><SwissDate value={session.date} locale="de-CH" dateStyle="medium" /> · {session.time}</> },
                { term: 'Fee', detail: <CurrencyCHF locale="de-CH" amount={session.fee} /> },
                { term: 'Attendee', detail: draft.name },
                { term: 'Email', detail: draft.email },
              ]} />
              <Stack direction="row" gap={3}>
                {stage === 'review' && <Button onClick={() => { setSaved(draft); setStage('confirmed') }}>
                  {saved ? 'Confirm changes' : 'Confirm registration'}
                </Button>}
                <Button variant="outline" onClick={() => setStage('details')}>
                  {stage === 'confirmed' ? 'Change registration' : 'Edit details'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </GridItem>
    </Grid>
  )
}
