import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { IbanInput } from '../src/swiss/iban-input.js'
import { AhvInput } from '../src/swiss/ahv-input.js'
import { PhoneInput } from '../src/swiss/phone-input.js'
import { LocaleSelect, type SwissLocale, type SwissInputValueDetails, SwissPostalCodeInput } from 'alpina-ui'
import { UidInput } from '../src/swiss/uid-input.js'

function Fixture() {
  const [phone, setPhone] = useState('0791234567')
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [changes, setChanges] = useState(0)
  const [values, setValues] = useState<Record<string, SwissInputValueDetails & { value: string }>>({})
  const record = (key: string) => (value: string, details: SwissInputValueDetails) =>
    setValues(previous => ({ ...previous, [key]: { value, ...details } }))
  const iban = useRef<HTMLInputElement>(null)
  return <>
    <form id="identifiers">
      <label htmlFor="iban">IBAN</label>
      <IbanInput id="iban" ref={iban} name="account" className="account-field" required onValueChange={record('iban')}
        defaultValue="CH9300762011623852957" validationMessage="Check the account number." />
      <label htmlFor="ahv">AHV</label>
      <AhvInput id="ahv" name="insurance" onValueChange={record('ahv')} validationMessage="Check the insurance number." />
      <label htmlFor="phone">Phone</label>
      <PhoneInput id="phone" name="phone" value={phone} onValueChange={record('phone')} onChange={event => {
        setPhone(event.currentTarget.value)
        setChanges(value => value + 1)
      }} />
      <button type="reset">Reset form</button>
    </form>
    <button onClick={() => iban.current?.focus()}>Focus account</button>
    <button onClick={() => setPhone('0441234567')}>Load saved phone</button>
    <button onClick={() => setPhone('')}>Clear saved phone</button>
    <label htmlFor="uid">Business identifier</label>
    <UidInput id="uid" defaultValue="CHE109322551" onValueChange={record('uid')} validationMessage="Check the business identifier." />
    <section aria-label="Localized validation">
      <label>Language <LocaleSelect value={locale} onLocaleChange={setLocale} /></label>
      <label>Postal code <SwissPostalCodeInput locale={locale} required onValueChange={record('postal')} /></label>
      <label>Social insurance number <AhvInput locale={locale} required /></label>
    </section>
    <output id="events">{changes}</output>
    <output id="values">{JSON.stringify(values)}</output>
  </>
}

createRoot(document.getElementById('app')!).render(<Fixture />)
