import { useState } from 'react'
import { Button, Calendar, DatePicker, Field, InputOTP, MessageScroller, NativeSelect, Questionnaire, ToggleGroup, Trace } from 'alpina-ui'

export function CalendarExample() {
  return <Calendar defaultValue="2026-04-09" locale="it-CH" />
}

export function DatePickerExample() {
  return <DatePicker label="Data di ritiro" name="ritiro" defaultValue="2026-04-09" />
}

export function InputOTPExample() {
  return <Field label="Codice di verifica" description="Inserisci le sei cifre ricevute via SMS.">
    {(control) => <InputOTP {...control} name="verifica" length={6} defaultValue="04" required />}
  </Field>
}

export function NativeSelectExample() {
  return <Field label="Formato di stampa">{(control) => <NativeSelect {...control} defaultValue="A4">
    <option>A5</option><option>A4</option><option>A3</option><option>A2</option>
  </NativeSelect>}</Field>
}

export function ToggleGroupExample() {
  return <ToggleGroup label="Viste del catalogo" defaultValue={['anno']} options={[
    { value: 'anno', label: 'Per anno' }, { value: 'autore', label: 'Per autore' },
    { value: 'tecnica', label: 'Per tecnica' },
  ]} />
}

export function QuestionnaireExample() {
  const [summary, setSummary] = useState('')
  return <><Questionnaire label="Richiesta di consultazione" onComplete={(answers) => setSummary(answers.fondo + ' · ' + answers.sede)} questions={[
    { id: 'fondo', label: 'Quale fondo vuoi consultare?', options: [{ value: 'Manifesti', label: 'Manifesti' }, { value: 'Periodici', label: 'Periodici' }] },
    { id: 'sede', label: 'In quale sala?', options: [{ value: 'Lugano', label: 'Lugano' }, { value: 'Bellinzona', label: 'Bellinzona' }] },
  ]} />{summary && <p><output>{summary}</output></p>}</>
}

export function MessageScrollerExample() {
  const [runs, setRuns] = useState(1)
  return <div><MessageScroller label="Registro della tiratura">
    {Array.from({ length: runs }, (_, i) => <p key={i}><strong>Tiratura {i + 1}.</strong> Prova di stampa registrata.</p>)}
  </MessageScroller><Button variant="outline" onClick={() => setRuns((n) => n + 1)}>Registra una prova</Button></div>
}

export function TraceExample() {
  return <Trace label="Revisione della bozza" events={[
    { id: 'invio', time: '09.10', dateTime: '09:10', title: 'Bozza ricevuta' },
    { id: 'controllo', time: '09.45', dateTime: '09:45', title: 'Controllo tipografico', detail: 'Verificati gli accenti sulle maiuscole e l’allineamento delle cifre.' },
    { id: 'stampa', time: '11.20', dateTime: '11:20', title: 'Visto si stampi' },
  ]} />
}
