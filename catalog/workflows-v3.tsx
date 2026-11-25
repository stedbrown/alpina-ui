import { useState } from 'react'
import { Stack, Typography, Button, Calendar, DatePicker, Field, InputOTP, MessageScroller, NativeSelect, Questionnaire, ToggleGroup, Trace } from 'alpina-ui'

export function CalendarExample() {
  return <Calendar defaultValue="2026-04-09" canton="TI" locale="it-CH" />
}

export function DatePickerExample() {
  return <DatePicker locale="it-CH" canton="TI" name="collection" defaultValue="2026-04-09" />
}

export function InputOTPExample() {
  return <Field label="Verification code" description="Enter the six digits you received by SMS.">
    {(control) => <InputOTP {...control} name="verification" length={6} defaultValue="04" required />}
  </Field>
}

export function NativeSelectExample() {
  return <Field label="Print format">{(control) => <NativeSelect {...control} defaultValue="A4">
    <option>A5</option><option>A4</option><option>A3</option><option>A2</option>
  </NativeSelect>}</Field>
}

export function ToggleGroupExample() {
  return <ToggleGroup label="Catalog views" defaultValue={['year']} options={[
    { value: 'year', label: 'By year' }, { value: 'author', label: 'By author' },
    { value: 'technique', label: 'By technique' },
  ]} />
}

export function QuestionnaireExample() {
  const [summary, setSummary] = useState('')
  return <><Questionnaire label="Reading room request" onComplete={(answers) => setSummary(answers.collection + ' · ' + answers.room)} questions={[
    { id: 'collection', label: 'Which collection would you like to consult?', options: [{ value: 'Posters', label: 'Posters' }, { value: 'Periodicals', label: 'Periodicals' }] },
    { id: 'room', label: 'Which reading room?', options: [{ value: 'Lugano', label: 'Lugano' }, { value: 'Bellinzona', label: 'Bellinzona' }] },
  ]} />{summary && <Typography as="output">{summary}</Typography>}</>
}

export function MessageScrollerExample() {
  const [runs, setRuns] = useState(1)
  return <Stack align="start" gap={3}><MessageScroller label="Print run log">
    {Array.from({ length: runs }, (_, i) => <Typography key={i}><strong>Print run {i + 1}.</strong> Print proof recorded.</Typography>)}
  </MessageScroller><Button variant="outline" onClick={() => setRuns((n) => n + 1)}>Record a proof</Button></Stack>
}

export function TraceExample() {
  return <Trace label="Draft review" events={[
    { id: 'submission', time: '09.10', dateTime: '09:10', title: 'Draft received' },
    { id: 'type-check', time: '09.45', dateTime: '09:45', title: 'Type check', detail: 'Checked the accents on capital letters and the alignment of numerals.' },
    { id: 'print', time: '11.20', dateTime: '11:20', title: 'Approved for printing' },
  ]} />
}
