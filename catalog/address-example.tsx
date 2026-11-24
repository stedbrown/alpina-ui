import { useState } from 'react'
import { Field, SwissAddressForm, LocaleSelect, type SwissLocale } from 'alpina-ui'

export function SwissAddressFormExample() {
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [saved, setSaved] = useState(false)
  const confirmation = {
    'it-CH': 'Indirizzo confermato.',
    'de-CH': 'Adresse bestätigt.',
    'fr-CH': 'Adresse confirmée.',
    'rm-CH': 'Adressa confermada.',
  }
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Field label="Lingua del modulo">
        {(control) => <LocaleSelect {...control} value={locale} onLocaleChange={setLocale} />}
      </Field>
      <div onChange={() => setSaved(false)}>
        <SwissAddressForm locale={locale} onSave={() => setSaved(true)} />
      </div>
      <output aria-live="polite" lang={locale}>
        {saved ? confirmation[locale] : ''}
      </output>
    </div>
  )
}
