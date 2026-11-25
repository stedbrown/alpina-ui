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
    <LocaleSelect aria-label="Language" value={locale} onLocaleChange={setLocale} />
    <Calendar locale={locale} canton="NE" defaultValue="2024-02-29" min="2024-01-10" max="2025-03-01" />
    <form aria-label="Data">
      <DatePicker locale={locale} canton="NE" name="day" label="Collection" defaultValue="2024-02-29" clearable />
      <InputOTP aria-label="Code" defaultValue="0123" name="otp" required />
      <InputOTP aria-label="Controlled" value={otp} onValueChange={setOTP} />
      <NativeSelect aria-label="Paper" name="paper" multiple defaultValue={['A4']}><option>A3</option><option>A4</option></NativeSelect>
      <ToggleGroup label="Channels" multiple name="channel" defaultValue={['a']} options={[{ value: 'a', label: 'Voice' }, { value: 'b', label: 'Text' }]} />
      <button type="reset">Reset</button>
    </form>
    <Questionnaire label="Survey" questions={[
      { id: 'paper', label: 'Which paper?', options: [{ value: 'a', label: 'Rough' }, { value: 'b', label: 'Smooth' }] },
      { id: 'size', label: 'Which size?', options: [{ value: 'std', label: 'Standard' }] },
    ]} onComplete={(answers) => setCompleted(JSON.stringify(answers))} />
    <output id="response">{completed}</output>
    <Trace label="Trace" events={[{ id: 'print', title: 'Printing', time: '15.00', dateTime: '15:00', detail: 'Batch 12' }]} />
    <MessageScroller label="Messages">{Array.from({ length: lines }, (_, i) => <p key={i}>Message {i + 1}</p>)}</MessageScroller>
    <button onClick={() => setLines(lines + 1)}>Add message</button>
  </>
}
createRoot(document.getElementById('app')!).render(<Fixture />)
