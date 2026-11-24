import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Calendar } from '../src/swiss/calendar.js'
import { DatePicker } from '../src/swiss/date-picker.js'
import { LocaleSelect } from '../src/swiss/locale-select.js'
import type { SwissLocale } from '../src/swiss/locales.js'
import { InputOTP } from '../src/interactive/input-otp.js'
import { NativeSelect } from '../src/interactive/native-select.js'
import { ToggleGroup } from '../src/interactive/toggle-group.js'
import { Questionnaire } from '../src/interactive/questionnaire.js'
import { MessageScroller } from '../src/interactive/message-scroller.js'
import { Trace } from '../src/interactive/trace.js'
import '../src/theme.css'

function Fixture() {
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [completed, setCompleted] = useState('')
  const [otp, setOTP] = useState('')
  const [lines, setLines] = useState(16)
  return <>
    <LocaleSelect aria-label="Lingua" value={locale} onLocaleChange={setLocale} />
    <Calendar locale={locale} defaultValue="2024-02-29" min="2024-01-10" max="2025-03-01" />
    <form aria-label="Dati">
      <DatePicker locale={locale} name="giorno" label="Ritiro" defaultValue="2024-02-29" />
      <InputOTP aria-label="Codice" defaultValue="0123" name="otp" required />
      <InputOTP aria-label="Controllato" value={otp} onValueChange={setOTP} />
      <NativeSelect aria-label="Carta" name="carta" multiple defaultValue={['A4']}><option>A3</option><option>A4</option></NativeSelect>
      <ToggleGroup label="Canali" multiple name="canale" defaultValue={['a']} options={[{ value: 'a', label: 'Voce' }, { value: 'b', label: 'Testo' }]} />
      <button type="reset">Ripristina</button>
    </form>
    <Questionnaire label="Sondaggio" questions={[
      { id: 'carta', label: 'Quale carta?', options: [{ value: 'a', label: 'Ruvida' }, { value: 'b', label: 'Liscia' }] },
      { id: 'formato', label: 'Quale formato?', options: [{ value: 'std', label: 'Standard' }] },
    ]} onComplete={(answers) => setCompleted(JSON.stringify(answers))} />
    <output id="response">{completed}</output>
    <Trace label="Traccia" events={[{ id: 'stampa', title: 'Stampa', time: '15.00', dateTime: '15:00', detail: 'Lotto 12' }]} />
    <MessageScroller label="Messaggi">{Array.from({ length: lines }, (_, i) => <p key={i}>Messaggio {i + 1}</p>)}</MessageScroller>
    <button onClick={() => setLines(lines + 1)}>Aggiungi messaggio</button>
  </>
}
createRoot(document.getElementById('app')!).render(<Fixture />)
