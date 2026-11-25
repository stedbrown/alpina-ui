import { Collapsible, CurrencyCHF, Stack, SwissDate, Tabs, TextLink, Typography } from 'alpina-ui'
import { initialInvoices, invoiceTotalCHF } from '../catalog/invoice-data.js'

const languages = [
  { locale: 'de-CH', language: 'German', total: 'Rechnungsbetrag', due: 'Fällig am' },
  { locale: 'fr-CH', language: 'French', total: 'Montant total', due: 'Échéance' },
  { locale: 'it-CH', language: 'Italian', total: 'Totale fattura', due: 'Scadenza' },
] as const

export function TypeSpecimen() {
  const invoice = initialInvoices[0]
  return (
    <Stack id="type-specimen" role="region" aria-labelledby="invoice-title" gap={4} surface="ink" inset={6}>
      <Stack gap={1}>
        <Typography variant="caption">{invoice.supplier}</Typography>
        <Typography as="h2" variant="heading" id="invoice-title">Invoice {invoice.id}</Typography>
      </Stack>
      <Typography>Switch the language to compare local date and currency formats.</Typography>
      <Stack gap={0} data-specimen-disclosures="">
        {languages.map(({ locale, language, total, due }) => (
          <Collapsible key={locale} name="invoice-language" summary={language} open={locale === 'de-CH'}>
            <Stack gap={4} lang={locale} data-specimen-sample="">
              <Stack gap={1}>
                <Typography variant="label">{total}</Typography>
                <Typography variant="display" numeric><CurrencyCHF amount={invoiceTotalCHF(invoice)} locale={locale} /></Typography>
              </Stack>
              <Stack gap={1}>
                <Typography variant="caption">{due}</Typography>
                <Typography numeric><SwissDate value={invoice.due} locale={locale} dateStyle="full" /></Typography>
              </Stack>
            </Stack>
          </Collapsible>
        ))}
      </Stack>
      <template>
        <Tabs label="Invoice language" defaultValue="de-CH"
          items={languages.map(({ locale, language }) => ({ value: locale, label: language, content: null }))} />
      </template>
      <TextLink href="/examples/invoice-review/">Open invoice review →</TextLink>
    </Stack>
  )
}
