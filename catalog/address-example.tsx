import { useState } from 'react'
import { Stack, Typography, Field, SwissAddressForm, LocaleSelect, type SwissLocale } from 'alpina-ui'

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
    <Stack gap={4}>
      <Field label="Form language">
        {(control) => <LocaleSelect {...control} value={locale} onLocaleChange={setLocale} />}
      </Field>
      <Stack gap={0} onChange={() => setSaved(false)}>
        <SwissAddressForm locale={locale} format="ech-organisation" onSave={() => setSaved(true)} />
      </Stack>
      <Typography as="output" aria-live="polite" lang={locale}>
        {saved ? confirmation[locale] : ''}
      </Typography>
    </Stack>
  )
}
