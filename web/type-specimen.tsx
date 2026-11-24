import { Collapsible, Stack, SwissDate, Tabs, Typography } from 'alpina-ui'

const typeSpecimens = [
  { locale: 'de-CH', language: 'German', title: 'Druck\u00ADwerkstatt' },
  { locale: 'fr-CH', language: 'French', title: 'Atelier d’impression' },
  { locale: 'it-CH', language: 'Italian', title: 'Laboratorio di stampa' },
] as const

const specimenDate = '2026-06-18'

export function TypeSpecimen() {
  return (
    <Stack id="type-specimen" role="region" aria-labelledby="type-specimen-title" gap={2} data-al-theme="dark"
      style={{ padding: 'clamp(1rem, 2.6cqi, 2.5rem)', background: 'var(--al-bg)', color: 'var(--al-ink)' }}>
      <Typography as="h3" variant="label" id="type-specimen-title">Workshop notice</Typography>
      <Stack gap={0} data-specimen-disclosures="">
        {typeSpecimens.map(({ locale, language, title }) => (
          <Collapsible key={locale} name="specimen-language" summary={language} open={locale === 'de-CH'}>
            <Stack gap={4} lang={locale} data-specimen-sample="">
              <Typography variant="display" style={{ fontSize: 'clamp(2.25rem, 5cqi, 4.75rem)', lineHeight: 1 }}>{title}</Typography>
              <Stack direction="row" align="baseline" justify="space-between" gap={2}>
                <Typography numeric><SwissDate value={specimenDate} locale={locale} dateStyle="full" /></Typography>
                <Typography as="span" variant="caption" lang="en">{locale}</Typography>
              </Stack>
            </Stack>
          </Collapsible>
        ))}
      </Stack>
      <template>
        <Tabs
          label="Specimen language"
          defaultValue="de-CH"
          items={typeSpecimens.map(({ locale, language }) => ({ value: locale, label: language, content: null }))}
        />
      </template>
    </Stack>
  )
}
