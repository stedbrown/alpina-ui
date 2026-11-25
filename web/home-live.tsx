import { useEffect, useState } from 'react'
import {
  AhvInput, Badge, CantonSelect, DescriptionList, Field, Grid, GridItem, IbanInput, Input, Separator, Stack,
  SwissDate, SwissPostalCodeInput, SwissQrBill, ToggleGroup, Typography, formatCHF, lookupSwissPostalCode,
  swissHolidays, type CantonCode, type SwissLocale, type SwissQrBillData, type SwissQrBillLocale,
} from 'alpina-ui'

const languages = [
  { value: 'de-CH', label: 'Deutsch' }, { value: 'fr-CH', label: 'Français' },
  { value: 'it-CH', label: 'Italiano' }, { value: 'rm-CH', label: 'Rumantsch' },
] as const

const words: Record<SwissLocale, { ahv: string; iban: string; postcode: string; canton: string; holidays: string; town: string; check: string; ok: string; wait: string }> = {
  'de-CH': { ahv: 'AHV-Nummer', iban: 'IBAN', postcode: 'Postleitzahl', canton: 'Kanton', holidays: 'Nächste Feiertage', town: 'Ort', check: 'Prüfung', ok: 'Gültig', wait: 'Unvollständig' },
  'fr-CH': { ahv: 'Numéro AVS', iban: 'IBAN', postcode: 'Code postal', canton: 'Canton', holidays: 'Prochains jours fériés', town: 'Localité', check: 'Contrôle', ok: 'Valide', wait: 'Incomplet' },
  'it-CH': { ahv: 'Numero AVS', iban: 'IBAN', postcode: 'Numero postale', canton: 'Cantone', holidays: 'Prossimi giorni festivi', town: 'Località', check: 'Verifica', ok: 'Valido', wait: 'Incompleto' },
  'rm-CH': { ahv: 'Numer AVS', iban: 'IBAN', postcode: 'Numer postal', canton: 'Chantun', holidays: 'Proximas festas', town: 'Lieu', check: 'Controlla', ok: 'Valid', wait: 'Incomplet' },
}

/** Today in Zurich as YYYY-MM-DD, so the holiday list starts from the visitor's present. */
function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date())
}

export function SwissDesk() {
  const [locale, setLocale] = useState<SwissLocale>('de-CH')
  const [ahv, setAhv] = useState(false)
  const [iban, setIban] = useState(true)
  const [postcode, setPostcode] = useState('3011')
  const [town, setTown] = useState('Bern')
  const [canton, setCanton] = useState<CantonCode | ''>('BE')
  const [from, setFrom] = useState('2026-12-01')
  useEffect(() => { setFrom(today()) }, [])
  useEffect(() => {
    let active = true
    lookupSwissPostalCode(postcode).then(found => {
      if (!active || !found.length) return
      setTown(found[0].locality)
      setCanton(found[0].canton)
    })
    return () => { active = false }
  }, [postcode])
  const t = words[locale]
  const year = Number(from.slice(0, 4))
  const upcoming = canton ? [...swissHolidays(year, canton, { locale }), ...swissHolidays(year + 1, canton, { locale })]
    .filter(day => day.date >= from && day.scope !== 'sunday').slice(0, 3) : []
  return <Stack surface="paper" inset={3}><Grid space="compact" align="start">
    <GridItem><ToggleGroup label="Language of the form" options={languages}
      value={[locale]} onValueChange={values => values[0] && setLocale(values[0] as SwissLocale)} /></GridItem>
    <GridItem medium={4} large={6}><Stack gap={4}>
      <Field label={t.ahv}>{control => <AhvInput {...control} locale={locale} name="ahv" placeholder="756.1234.5678.97"
        onValueChange={(_, details) => setAhv(details.valid)} />}</Field>
      <Field label={t.iban}>{control => <IbanInput {...control} locale={locale} name="iban" defaultValue="CH93 0076 2011 6238 5295 7"
        onValueChange={(_, details) => setIban(details.valid)} />}</Field>
      <Stack direction="row" gap={4} wrap={false}>
        <Field label={t.postcode}>{control => <SwissPostalCodeInput {...control} locale={locale} name="postcode" value={postcode}
          onValueChange={value => setPostcode(value)} />}</Field>
        <Field label={t.town}>{control => <Input {...control} name="town" value={town} onChange={event => setTown(event.currentTarget.value)} />}</Field>
      </Stack>
      <Field label={t.canton}>{control => <CantonSelect {...control} locale={locale} value={canton} onCantonChange={setCanton} />}</Field>
    </Stack></GridItem>
    <GridItem medium={4} large={6}><Stack gap={4}>
      <Typography as="h3" variant="label">{t.check}</Typography>
      <DescriptionList items={[
        { term: t.ahv, detail: <Badge tone={ahv ? 'success' : 'neutral'}>{ahv ? t.ok : t.wait}</Badge> },
        { term: t.iban, detail: <Badge tone={iban ? 'success' : 'neutral'}>{iban ? t.ok : t.wait}</Badge> },
        { term: t.town, detail: (postcode + ' ' + town).trim() + (canton ? ' · ' + canton : '') },
      ]} />
      <Separator />
      <Typography as="h3" variant="label">{t.holidays + (canton ? ' · ' + canton : '')}</Typography>
      <DescriptionList aria-live="polite" items={upcoming.map(day => ({ term: day.name, detail: <SwissDate value={day.date} locale={locale} /> }))} />
    </Stack></GridItem>
  </Grid></Stack>
}

const baseBill: SwissQrBillData = {
  iban: 'CH58 0079 1123 0008 8901 2', currency: 'CHF',
  creditor: { name: 'Atelier Nord', street: 'Rue du Lac', buildingNumber: '8', postalCode: '2000', town: 'Neuchâtel', country: 'CH' },
  debtor: { name: 'Clara Meier', street: 'Aarbergergasse', buildingNumber: '7', postalCode: '3011', town: 'Bern', country: 'CH' },
  reference: { type: 'SCOR', value: 'RF18 5390 0754 7034' },
}
const billLanguages = [
  { value: 'de-CH', label: 'DE' }, { value: 'fr-CH', label: 'FR' }, { value: 'it-CH', label: 'IT' }, { value: 'en', label: 'EN' },
] as const

export function QrDesk() {
  const [amount, setAmount] = useState('197.58')
  const [message, setMessage] = useState('Invoice AN-104')
  const [locale, setLocale] = useState<SwissQrBillLocale>('de-CH')
  const value = Number(amount)
  const valid = amount === '' || (/^\d{1,9}(\.\d{1,2})?$/.test(amount) && value > 0)
  const bill: SwissQrBillData = { ...baseBill, message: message.slice(0, 140) || undefined, amount: valid && amount ? value.toFixed(2) : undefined }
  // The slip runs edge to edge in its paper panel: a 320 px phone keeps the IBAN on one line.
  return <Stack gap={0} surface="paper">
    <Grid space="compact" align="end">
      <GridItem small={2} medium={2} large={3}><Field label="Amount in CHF" error={valid ? undefined : 'Enter an amount such as 197.58'}>
        {control => <Input {...control} name="amount" inputMode="decimal" value={amount} onChange={event => setAmount(event.currentTarget.value.replace(',', '.'))} />}
      </Field></GridItem>
      <GridItem small={2} medium={3} large={5}><Field label="Message">
        {control => <Input {...control} name="message" maxLength={140} value={message} onChange={event => setMessage(event.currentTarget.value)} />}
      </Field></GridItem>
      <GridItem medium={3} large={4}><ToggleGroup label="Slip language" options={billLanguages} value={[locale]}
        onValueChange={values => values[0] && setLocale(values[0] as typeof locale)} /></GridItem>
    </Grid>
    <Stack data-home-slip=""><SwissQrBill bill={bill} locale={locale} printLayout="inline" fit /></Stack>
    <Stack inset={3}><Typography variant="caption" aria-live="polite">{bill.amount ? 'Payable: ' + formatCHF(Number(bill.amount), 'de-CH') + '. The QR code changes as you type.' : 'Without an amount the payer fills it in by hand.'}</Typography></Stack>
  </Stack>
}
