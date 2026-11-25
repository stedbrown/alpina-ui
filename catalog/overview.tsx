import { useState } from 'react'
import { componentHref, guideHref } from './paths.js'
import {
  Badge, Button, Card, CardContent, CardFooter, CardHeader, Empty, Grid, GridItem, Icon, Item, Separator, Stack, ToggleGroup, Typography,
  TextLink,
  CantonCombobox,
  cantons,
  CurrencyCHF,
  DataTable,
  localeNames,
  Sheet,
  SwissAddressForm,
  SwissDate,
  swissAddressLabels,
  type CantonCode,
  type SwissAddress,
  type SwissLocale,
} from 'alpina-ui'

const initialContacts: { id: string; address: SwissAddress; amount: number; date: string }[] = [
  {
    id: 'BA',
    address: {
      recipient: 'Bureau Arve',
      street: 'Rue des Ateliers 8',
      postalCode: '1201',
      locality: 'Genève',
      canton: 'GE',
    },
    amount: 1280.5,
    date: '2026-11-24',
  },
  {
    id: 'FT',
    address: {
      recipient: 'Forma Ticino',
      street: 'Via delle Officine 12',
      postalCode: '6500',
      locality: 'Bellinzona',
      canton: 'TI',
    },
    amount: 420,
    date: '2026-11-18',
  },
  {
    id: 'KN',
    address: {
      recipient: 'Kollektiv Nord',
      street: 'Werkstrasse 4',
      postalCode: '8004',
      locality: 'Zürich',
      canton: 'ZH',
    },
    amount: 96.5,
    date: '2026-11-21',
  },
  {
    id: 'SR',
    address: {
      recipient: 'Studio Rain',
      street: 'Via da la Staziun 6',
      postalCode: '7503',
      locality: 'Samedan',
      canton: 'GR',
    },
    amount: 875,
    date: '2026-11-09',
  },
]
const locales: SwissLocale[] = ['it-CH', 'de-CH', 'fr-CH', 'rm-CH']
const country: Record<SwissLocale, string> = {
  'it-CH': 'Svizzera',
  'de-CH': 'Schweiz',
  'fr-CH': 'Suisse',
  'rm-CH': 'Svizra',
}

export function Overview({ hosted = false }: { hosted?: boolean }) {
  const [contacts, setContacts] = useState(initialContacts)
  const [current, setCurrent] = useState('BA')
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [filter, setFilter] = useState<CantonCode | ''>('')
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const visible = contacts.filter((c) => !filter || c.address.canton === filter)
  const active = visible.find((c) => c.id === current) ?? visible[0]
  const labels = swissAddressLabels[locale]
  function save(address: SwissAddress) {
    if (!active) return
    setContacts((items) => items.map((c) => (c.id === active.id ? { ...c, address } : c)))
    if (filter && address.canton !== filter) setFilter('')
    setCurrent(active.id)
    setOpen(false)
    setNotice('Address updated.')
  }
  return (
    <Stack gap={8}>
      <Grid as="header" space="section" align="end">
        <GridItem medium={6} large={9}>
          <Stack gap={3}>
            <Typography as="h1" variant="title">Client address book</Typography>
            <Typography measure="narrow">Filter clients by canton, edit an address, or sort order totals.
              Any changes last for this session.</Typography>
          </Stack>
        </GridItem>
        <GridItem medium={2} large={3}><TextLink href={guideHref('start', hosted)}>
          Quick start <Icon name="arrow-up-right" />
        </TextLink></GridItem>
      </Grid>
      <Grid as="section" aria-labelledby="studio-title" align="start">
        <GridItem>
          <Stack direction="row" align="baseline" justify="space-between">
            <Typography as="h2" variant="heading" id="studio-title">Contacts</Typography>
            <ToggleGroup label="Data language" value={[locale]}
              options={locales.map(lang => ({ value: lang, label: <Typography as="span" variant="inherit" lang={lang}>{localeNames[lang]}</Typography> }))}
              onValueChange={([value]) => {
                const selected = locales.find(lang => lang === value)
                if (selected) setLocale(selected)
              }} />
          </Stack>
          <Separator />
        </GridItem>
        <GridItem medium={3} large={5}>
          <Stack gap={3}>
            <CantonCombobox id="client-canton-filter" locale={locale} placeholder="TI" value={filter} onCantonChange={c => {
              setFilter(c)
              setNotice('')
            }} />
            <Stack role="list" aria-label="Clients" gap={0}>
              {visible.map(c => <Item role="listitem" key={c.id} current={active?.id === c.id}
                leading={<Badge aria-hidden="true">{c.id}</Badge>}
                title={<Button variant="ghost" size="sm" aria-pressed={active?.id === c.id} onClick={() => {
                  setCurrent(c.id)
                  setNotice('')
                }}>{c.address.recipient}</Button>}
                description={c.address.locality + ' · ' + c.address.canton} />)}
            </Stack>
            {!visible.length && <Empty title="No clients in this canton." action={
              <Button size="sm" variant="outline" onClick={() => setFilter('')}>Clear filter</Button>
            } />}
          </Stack>
        </GridItem>
        <GridItem medium={5} large={7}>
          {active ? <>
            <Card lang={locale}>
              <CardHeader>
                <Stack direction="row" justify="space-between">
                  <Typography variant="caption">{labels.recipient}</Typography>
                  <Typography variant="caption">CH</Typography>
                </Stack>
              </CardHeader>
              <CardContent>
                <Stack>
                  <Typography as="address">
                    <Stack gap={1}>
                      <Typography as="span" variant="heading">{active.address.recipient}</Typography>
                      <Typography as="span">{active.address.street}</Typography>
                      <Typography as="span">{active.address.postalCode} {active.address.locality}</Typography>
                    </Stack>
                  </Typography>
                  <Typography variant="caption">
                    {cantons.find(c => c.code === active.address.canton)?.names[locale]} / {country[locale]}
                  </Typography>
                </Stack>
              </CardContent>
              <CardFooter lang="en">
                <Stack direction="row" justify="space-between">
                  <Button size="sm" onClick={() => { setNotice(''); setOpen(true) }}>Edit address</Button>
                  <TextLink href={componentHref('swiss-address-form', hosted)}>Component <Icon name="arrow-up-right" /></TextLink>
                </Stack>
              </CardFooter>
            </Card>
            <Sheet open={open} onOpenChange={setOpen} title={active.address.recipient} closeLabel="Close">
              {open && <SwissAddressForm key={active.id} locale={locale} initialValue={active.address} onSave={save} />}
            </Sheet>
          </> : <Typography>Select a client to see their address.</Typography>}
        </GridItem>
        <GridItem><Typography role="status" variant="label">{notice}</Typography></GridItem>
      </Grid>
      <Grid as="section" aria-label="Client orders">
        <GridItem>
          <Stack direction="row" align="baseline" justify="space-between">
            <Typography as="h2" variant="heading">Order register</Typography>
            <TextLink href={componentHref('data-table', hosted)}>Sortable table <Icon name="arrow-up-right" /></TextLink>
          </Stack>
        </GridItem>
        <GridItem>
        <DataTable
          rows={visible}
          rowKey={(row) => row.id}
          caption="Orders for clients in the address book"
          empty="No orders for this canton."
          columns={[
            {
              id: 'client',
              header: 'Client',
              cell: (r) => r.address.recipient,
              compare: (a, b) => a.address.recipient.localeCompare(b.address.recipient, locale),
            },
            {
              id: 'date',
              header: 'Date',
              cell: (r) => <SwissDate value={r.date} locale={locale} />,
              compare: (a, b) => a.date.localeCompare(b.date),
            },
            {
              id: 'total',
              header: 'Total',
              align: 'end',
              cell: (r) => <CurrencyCHF amount={r.amount} locale={locale} />,
              compare: (a, b) => a.amount - b.amount,
            },
          ]}
        />
        </GridItem>
      </Grid>
    </Stack>
  )
}
