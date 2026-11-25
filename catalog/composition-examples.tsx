import { useState } from 'react'
import { Button, CurrencyCHF, DescriptionList, Figure, Stack, Steps, SwissDate, Typography } from 'alpina-ui'

export function DescriptionListExample() {
  return <DescriptionList aria-label="Invoice details" items={[
    { term: 'Studio', detail: 'Atelier Limmat' },
    { term: 'Due', detail: <SwissDate value="2026-12-15" locale="de-CH" /> },
    { term: 'Total', detail: <CurrencyCHF amount={480} locale="de-CH" /> },
  ]} />
}

export function FigureExample() {
  return <Figure caption="Two words from the same printing vocabulary.">
    <Stack gap={1} inset={4} surface="soft">
      <Typography variant="display" lang="de">Satz</Typography>
      <Typography lang="en">Typesetting</Typography>
    </Stack>
  </Figure>
}

export function StepsExample() {
  const [step, setStep] = useState(0)
  const items = [{ id: 'session', label: 'Session' }, { id: 'details', label: 'Details' }, { id: 'review', label: 'Review' }]
  return <Stack gap={4}>
    <Steps label="Registration progress" items={items} current={items[step].id} />
    <Stack direction="row" gap={2}>
      <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
      <Button disabled={step === items.length - 1} onClick={() => setStep(step + 1)}>Continue</Button>
    </Stack>
  </Stack>
}
