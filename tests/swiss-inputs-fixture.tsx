import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { IbanInput } from '../src/swiss/iban-input.js'
import { AhvInput } from '../src/swiss/ahv-input.js'
import { PhoneInput } from '../src/swiss/phone-input.js'

function Fixture() {
  const [phone, setPhone] = useState('0791234567')
  const [changes, setChanges] = useState(0)
  const iban = useRef<HTMLInputElement>(null)
  return <>
    <form id="identifiers">
      <label htmlFor="iban">IBAN</label>
      <IbanInput id="iban" ref={iban} name="account" className="account-field" required
        defaultValue="CH9300762011623852957" validationMessage="Check the account number." />
      <label htmlFor="ahv">AHV</label>
      <AhvInput id="ahv" name="insurance" validationMessage="Check the insurance number." />
      <label htmlFor="phone">Phone</label>
      <PhoneInput id="phone" name="phone" value={phone} onChange={event => {
        setPhone(event.currentTarget.value)
        setChanges(value => value + 1)
      }} />
      <button type="reset">Reset form</button>
    </form>
    <button onClick={() => iban.current?.focus()}>Focus account</button>
    <button onClick={() => setPhone('0441234567')}>Load saved phone</button>
    <button onClick={() => setPhone('')}>Clear saved phone</button>
    <output id="events">{changes}</output>
  </>
}

createRoot(document.getElementById('app')!).render(<Fixture />)
