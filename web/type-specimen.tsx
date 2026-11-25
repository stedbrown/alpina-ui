import { Collapsible, CurrencyCHF, Stack, SwissDate, Tabs, TextLink, Typography } from 'alpina-ui'
import { initialInvoices, invoiceTotalCHF } from '../catalog/invoice-data.js'

const languages = [
  { locale: 'de-CH', language: 'German', total: 'Rechnungsbetrag', due: 'Fällig am' },
  { locale: 'fr-CH', language: 'French', total: 'Montant total', due: 'Échéance' },
  { locale: 'it-CH', language: 'Italian', total: 'Totale fattura', due: 'Scadenza' },
] as const

function InvoiceSample({ entry }: { entry: typeof languages[number] }) {
  const invoice = initialInvoices[0]
  return <Stack gap={4} lang={entry.locale}>
    <Stack gap={1}>
      <Typography variant="label">{entry.total}</Typography>
      <Typography variant="display" numeric><CurrencyCHF amount={invoiceTotalCHF(invoice)} locale={entry.locale} /></Typography>
    </Stack>
    <Stack gap={1}>
      <Typography variant="caption">{entry.due}</Typography>
      <Typography numeric><SwissDate value={invoice.due} locale={entry.locale} dateStyle="full" /></Typography>
    </Stack>
  </Stack>
}

export function TypeSpecimen() {
  const invoice = initialInvoices[0]
  return (
    <Stack id="type-specimen" role="region" aria-labelledby="invoice-title" gap={4} surface="ink" inset={6}>
      <Stack gap={1}>
        <Typography variant="caption">{invoice.supplier}</Typography>
        <Typography as="h2" variant="heading" id="invoice-title">Invoice {invoice.id}</Typography>
      </Stack>
      <Typography>Switch the language to compare local date and currency formats.</Typography>
      <Stack gap={0} data-showcase-live="">
        <Tabs label="Invoice language" defaultValue="de-CH"
          items={languages.map(entry => ({ value: entry.locale, label: entry.language, content: <InvoiceSample entry={entry} /> }))} />
      </Stack>
      <Stack data-showcase-fallback="" gap={0}>
        {languages.map(entry => (
          <Collapsible key={entry.locale} name="invoice-language" summary={entry.language} open={entry.locale === 'de-CH'}>
            <InvoiceSample entry={entry} />
          </Collapsible>
        ))}
      </Stack>
      <TextLink href="/examples/invoice-review/">Open invoice review →</TextLink>
    </Stack>
  )
}
