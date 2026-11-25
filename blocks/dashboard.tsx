'use client'

import { useState } from 'react'
import {
  Badge, Button, Chart, CurrencyCHF, DataTable, DescriptionList, Field, Grid, GridItem, Input,
  Select, Separator, Stack, SwissDate, Typography, formatCHF, type DataColumn,
} from 'alpina-ui'

export interface DashboardInvoice {
  id: string
  client: string
  /** ISO civil date, YYYY-MM-DD. */
  issuedOn: string
  amountCents: number
  status: 'Open' | 'Paid'
}

const sampleInvoices: readonly DashboardInvoice[] = [
  { id: 'A-2619', client: 'Maison des éditions', issuedOn: '2026-11-18', amountCents: 246000, status: 'Open' },
  { id: 'A-2618', client: 'Archiv für Gestaltung', issuedOn: '2026-11-06', amountCents: 325000, status: 'Paid' },
  { id: 'A-2617', client: 'Studio Pigna', issuedOn: '2026-10-22', amountCents: 168000, status: 'Paid' },
  { id: 'A-2616', client: 'Papeterie du Lac', issuedOn: '2026-10-09', amountCents: 84000, status: 'Open' },
  { id: 'A-2615', client: 'Studio Pigna', issuedOn: '2026-09-16', amountCents: 360000, status: 'Paid' },
  { id: 'A-2614', client: 'Archiv für Gestaltung', issuedOn: '2026-08-03', amountCents: 215000, status: 'Paid' },
  { id: 'A-2613', client: 'Papeterie du Lac', issuedOn: '2026-07-20', amountCents: 94000, status: 'Paid' },
  { id: 'A-2612', client: 'Maison des éditions', issuedOn: '2026-06-12', amountCents: 288000, status: 'Paid' },
]

const columns: readonly DataColumn<DashboardInvoice>[] = [
  { id: 'id', header: 'Invoice', cell: row => row.id, compare: (a, b) => a.id.localeCompare(b.id) },
  { id: 'client', header: 'Client', cell: row => row.client, compare: (a, b) => a.client.localeCompare(b.client, 'en') },
  { id: 'date', header: 'Issued', cell: row => <SwissDate value={row.issuedOn} locale="de-CH" />,
    compare: (a, b) => a.issuedOn.localeCompare(b.issuedOn) },
  { id: 'status', header: 'Status', cell: row => <Badge tone={row.status === 'Open' ? 'accent' : 'neutral'}>{row.status}</Badge>,
    compare: (a, b) => a.status.localeCompare(b.status) },
  { id: 'amount', header: 'Amount', align: 'end', cell: row => <CurrencyCHF amount={row.amountCents / 100} />,
    compare: (a, b) => a.amountCents - b.amountCents },
]

const monthName = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })

function searchText(value: string) {
  return value.trim().normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/ß/g, 'ss')
}

function reportingMonths(lastDate: string, count: number) {
  if (!lastDate) return []
  const last = new Date(lastDate.slice(0, 7) + '-01T00:00:00Z')
  return Array.from({length: count}, (_, index) => {
    const date = new Date(last)
    date.setUTCMonth(last.getUTCMonth() - count + 1 + index)
    return { key: date.toISOString().slice(0, 7), label: monthName.format(date) }
  })
}

export interface DashboardBlockProps {
  invoices?: readonly DashboardInvoice[]
}

export function DashboardBlock({ invoices = sampleInvoices }: DashboardBlockProps = {}) {
  const [range, setRange] = useState(3)
  const [status, setStatus] = useState('All')
  const [search, setSearch] = useState('')
  const latest = invoices.reduce((date, invoice) => invoice.issuedOn > date ? invoice.issuedOn : date, '')
  const months = reportingMonths(latest, range)
  const totals = new Map(months.map(month => [month.key, 0]))
  const query = searchText(search)
  const rows = invoices.filter(invoice => totals.has(invoice.issuedOn.slice(0, 7)) &&
    (status === 'All' || invoice.status === status) && searchText(invoice.client).includes(query))
  let paid = 0
  let open = 0
  for (const invoice of rows) {
    const month = invoice.issuedOn.slice(0, 7)
    totals.set(month, totals.get(month)! + invoice.amountCents)
    if (invoice.status === 'Paid') paid += invoice.amountCents
    else open += invoice.amountCents
  }
  const chartData = months.map(month => ({ label: month.label, value: totals.get(month.key)! / 100 }))

  return (
    <Grid as="main" width="site" space="section" align="end">
      <GridItem medium={5} large={8}>
        <Stack gap={2}>
          <Typography as="h1" variant="title">Studio accounts</Typography>
          <Typography>{months.length ? months[0].label + ' – ' + months[months.length - 1].label : 'No invoices recorded'}</Typography>
        </Stack>
      </GridItem>
      <GridItem medium={3} large={4}>
        <Field label="Reporting period">{props => <Select {...props} value={range} onChange={e => setRange(Number(e.target.value))}>
          <option value={3}>Last 3 months</option><option value={6}>Last 6 months</option>
        </Select>}</Field>
      </GridItem>
      <GridItem><Separator weight="section" /></GridItem>
      <GridItem medium={4} large={5}>
        <Stack gap={4}>
          <Typography as="h2" variant="heading">Invoice totals</Typography>
          <Typography variant="display" numeric><CurrencyCHF amount={(paid + open) / 100} /></Typography>
          <DescriptionList items={[
            { term: 'Paid', detail: <CurrencyCHF amount={paid / 100} /> },
            { term: 'Outstanding', detail: <CurrencyCHF amount={open / 100} /> },
          ]} />
        </Stack>
      </GridItem>
      <GridItem medium={4} large={6} start={{large: 7}}>
        <Chart title="Invoiced by month" data={chartData} formatValue={formatCHF}
          categoryLabel="Month" valueLabel="Invoiced" emptyLabel="No invoice data" />
      </GridItem>
      <GridItem><Separator /></GridItem>
      <GridItem medium={4} large={4}>
        <Stack gap={2}>
          <Typography as="h2" variant="heading">Invoice register</Typography>
          <Typography variant="caption" role="status">{rows.length} {rows.length === 1 ? 'matching invoice' : 'matching invoices'}</Typography>
        </Stack>
      </GridItem>
      <GridItem medium={4} large={4}>
        <Field label="Find a client">{props => <Input {...props} type="search" value={search} onChange={e => setSearch(e.target.value)} />}</Field>
      </GridItem>
      <GridItem medium={4} large={2}>
        <Field label="Invoice status">{props => <Select {...props} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="All">All statuses</option><option value="Open">Open</option><option value="Paid">Paid</option>
        </Select>}</Field>
      </GridItem>
      <GridItem medium={4} large={2}>
        <Button variant="outline" disabled={status === 'All' && !search}
          onClick={() => { setSearch(''); setStatus('All') }}>Clear filters</Button>
      </GridItem>
      <GridItem>
        <DataTable rows={rows} columns={columns} rowKey={row => row.id} defaultSort={{ column: 'date', direction: 'descending' }}
          caption="Invoices in the selected period" empty="No invoices match this view." />
      </GridItem>
    </Grid>
  )
}
