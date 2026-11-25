import { useNumericSetting } from './proof-setting.js'
import { Label, Separator, Slider, Stack, Typography } from 'alpina-ui'

export function TypeProof({ interactive = true }: { interactive?: boolean }) {
  const [size, setSize] = useNumericSetting('proof-scale', 144)
  const [spacing, setSpacing] = useNumericSetting('proof-spacing', -50)
  const tracking = spacing / 1000
  const trackingLabel = tracking.toFixed(3).replace('-', '−') + ' em'
  return <Stack gap={4} surface="ink">
    <Stack direction="row" justify="space-between" gap={2}>
      <Typography variant="label">Inter / Grotesk</Typography>
      <Typography variant="caption" numeric>600</Typography>
    </Stack>
    <Separator weight="section" />
    <Typography id={interactive ? 'type-proof' : undefined} variant="specimen" specimenSize={size} tracking={tracking}>Aa Rg</Typography>
    <Separator />
    {interactive ? <Stack gap={2}>
      <Stack direction="row" justify="space-between" align="baseline">
        <Label htmlFor="proof-scale">Type size</Label>
        <Typography as="output" variant="label" numeric htmlFor="proof-scale">{size + ' px'}</Typography>
      </Stack>
      <Slider id="proof-scale" min={48} max={192} step={4} value={size} aria-valuetext={size + ' pixels'}
        onChange={event => setSize(event.currentTarget.valueAsNumber)} />
      <Stack direction="row" justify="space-between" align="baseline">
        <Label htmlFor="proof-spacing">Letter spacing</Label>
        <Typography as="output" variant="label" numeric htmlFor="proof-spacing">{trackingLabel}</Typography>
      </Stack>
      <Slider id="proof-spacing" min={-80} max={80} step={5} value={spacing} aria-valuetext={trackingLabel}
        onChange={event => setSpacing(event.currentTarget.valueAsNumber)} />
    </Stack> : <Typography variant="label" numeric>{size + ' px / ' + trackingLabel}</Typography>}
  </Stack>
}
