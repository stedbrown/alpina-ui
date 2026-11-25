import { useRef, useState, type FormEvent } from 'react'
import {
  Badge, Button, Field, GridSpecimen, Input, Label, RadioGroup, Separator,
  Slider, Stack, Switch, Textarea, Typography,
} from 'alpina-ui'
import { useNumericSetting, useSwitchSetting } from './proof-setting.js'

export function AccessProof({ interactive = true }: { interactive?: boolean }) {
  const [zoom, setZoom] = useNumericSetting('proof-zoom', 100)
  const [system, setSystem] = useSwitchSetting('proof-contrast', false)
  const [reservation, setReservation] = useState('')
  const [error, setError] = useState<'name' | 'email'>()
  const name = useRef<HTMLInputElement>(null)
  const email = useRef<HTMLInputElement>(null)
  function reserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const visitor = name.current?.value.trim()
    if (!visitor) {
      setError('name')
      name.current?.focus()
    } else if (email.current?.validity.typeMismatch) {
      setError('email')
      email.current.focus()
    } else {
      const data = new FormData(event.currentTarget)
      const contact = email.current?.value.trim()
      const notes = String(data.get('notes') ?? '').trim()
      setReservation([visitor + ' · ' + data.get('seat') + ' desk', contact && 'Reply to ' + contact, notes].filter(Boolean).join(' · '))
    }
  }
  return <Stack gap={4}>
    {interactive && <Stack surface="soft" inset={4} gap={3}>
      <Stack direction="row" justify="space-between" align="baseline">
        <Label htmlFor="proof-zoom">Preview zoom</Label>
        <Typography as="output" htmlFor="proof-zoom" variant="label" numeric>{zoom + '%'}</Typography>
      </Stack>
      <Slider id="proof-zoom" min={100} max={400} step={25} value={zoom} aria-valuetext={zoom + '%'} onChange={event => setZoom(event.currentTarget.valueAsNumber)} />
      <Stack direction="row" justify="space-between" gap={3}>
        <Stack direction="row" gap={2}><Switch id="proof-contrast" checked={system} onChange={event => setSystem(event.currentTarget.checked)} /><Label htmlFor="proof-contrast">Simulate forced colors</Label></Stack>
        <Button size="sm" variant="secondary" onClick={() => name.current?.focus()}>Test keyboard focus</Button>
      </Stack>
    </Stack>}
    <GridSpecimen label="Reading desk reservation" zoom={zoom / 100} palette={system ? 'system' : undefined} tabIndex={-1}>
      <Stack inset={2} gap={4}>
        <Stack direction="row" justify="space-between" gap={2}>
          <Stack gap={1}>
            <Typography variant="label">Print archive</Typography>
            <Typography as="h3" variant="heading">Reading room</Typography>
          </Stack>
          <Badge tone={reservation ? 'success' : 'accent'}>{reservation ? 'Held' : 'Open'}</Badge>
        </Stack>
        <Separator />
        {interactive ? <Stack asChild gap={4}>
          <form noValidate onSubmit={reserve} aria-label="Hold a desk" onChange={() => { setError(undefined); setReservation('') }}>
            <Stack direction="row" align="start" gap={4}>
              <Field label="Name" id="desk-name" error={error === 'name' ? 'Enter a name.' : undefined}>{props =>
                <Input {...props} ref={name} name="name" autoComplete="off" size={19} required />}</Field>
              <Field label="Email (optional)" id="desk-email" error={error === 'email' ? 'Check the email address.' : undefined}>{props =>
                <Input {...props} ref={email} type="email" name="email" autoComplete="off" size={23} />}</Field>
            </Stack>
            <RadioGroup label="Desk" name="seat" orientation="horizontal" defaultValue="Window"
              options={[{ value: 'Window', label: 'Window' }, { value: 'Aisle', label: 'Aisle' }]} />
            <Field label="Access notes (optional)" id="desk-notes">{props =>
              <Textarea {...props} name="notes" rows={2} />}</Field>
            <Separator />
            <Stack direction="row" justify="space-between" gap={3}>
              <Typography role="status" aria-live="polite" aria-atomic="true" variant="caption">
                {reservation ? 'Held for ' + reservation : 'One desk per reader.'}
              </Typography>
              <Button type="submit" size="sm">Hold</Button>
            </Stack>
          </form>
        </Stack> : <Typography>Desks by the window and aisle are available to readers. Bring your archive pass to check in.</Typography>}
      </Stack>
    </GridSpecimen>
  </Stack>
}
