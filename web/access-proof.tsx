import { useRef, useState, type FormEvent } from 'react'
import { Badge, Button, Field, GridSpecimen, Input, Label, Separator, Slider, Stack, Switch, Typography } from 'alpina-ui'

export function AccessProof({ interactive = true }: { interactive?: boolean }) {
  const [zoom, setZoom] = useState(100)
  const [system, setSystem] = useState(false)
  const [held, setHeld] = useState(false)
  const [missing, setMissing] = useState(false)
  const name = useRef<HTMLInputElement>(null)
  function reserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.current?.value.trim()) {
      setMissing(true)
      name.current?.focus()
      return
    }
    setMissing(false)
    setHeld(true)
  }
  return <Stack gap={4}>
    {interactive && <Stack gap={2}>
      <Stack direction="row" justify="space-between" align="baseline">
        <Label htmlFor="proof-zoom">Preview zoom</Label>
        <Typography as="output" htmlFor="proof-zoom" variant="label" numeric>{zoom + '%'}</Typography>
      </Stack>
      <Slider id="proof-zoom" min={100} max={400} step={25} value={zoom} aria-valuetext={zoom + '%'} onChange={event => setZoom(event.currentTarget.valueAsNumber)} />
      <Stack direction="row" gap={2}><Switch id="proof-contrast" checked={system} onChange={event => setSystem(event.currentTarget.checked)} /><Label htmlFor="proof-contrast">Simulate forced colors</Label></Stack>
    </Stack>}
    <GridSpecimen label="Reading desk reservation" zoom={zoom / 100} palette={system ? 'system' : undefined} tabIndex={-1}>
      <Stack inset={2} gap={3}>
        <Stack direction="row" justify="space-between" gap={2}>
          <Typography as="h3" variant="heading">Desk B</Typography>
          <Stack role="status" aria-live="polite" aria-atomic="true"><Badge tone={held ? 'success' : 'accent'}>{held ? 'Held' : 'Open'}</Badge></Stack>
        </Stack>
        <Separator />
        {interactive ? <Stack asChild direction="row" align="end" gap={3}>
          <form noValidate onSubmit={reserve} aria-label="Hold a desk">
            <Field label="Name" id="desk-name" error={missing ? 'Enter a name.' : undefined}>{props =>
              <Input {...props} ref={name} name="name" autoComplete="off" size={12} required onChange={() => { setMissing(false); setHeld(false) }} />}</Field>
            <Button type="submit" size="sm">Hold</Button>
          </form>
        </Stack> : <Typography>Available to reserve during opening hours.</Typography>}
      </Stack>
    </GridSpecimen>
  </Stack>
}
