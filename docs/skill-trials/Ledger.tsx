'use client'

import { useEffect } from 'react'
import { AlpinaProvider, DataTable, Grid, GridItem, Stack, Typography, type DataTableColumn } from 'alpina-ui'
import 'alpina-ui/styles.css'

const entries = [
  { id: 'B-001', date: '2026-11-01', title: 'Anfangsbestand', amount: '1200.00' },
  { id: 'B-002', date: '2026-11-04', title: 'Honorar für Modellbau', amount: '860.50' },
  { id: 'B-003', date: '2026-11-10', title: 'Einkauf von Zeichenpapier', amount: '-74.80' },
  { id: 'B-004', date: '2026-11-18', title: 'Rückerstattung an Kundin', amount: '-125.00' },
  { id: 'B-005', date: '2026-11-24', title: 'Verkauf von Plandrucken', amount: '219.95' },
]
type Booking = (typeof entries)[number]
const collator = new Intl.Collator('de-CH', { numeric: true })
const columns: DataTableColumn<Booking>[] = [
  { id: 'date', header: 'Datum', format: 'swiss-date', value: row => row.date },
  { id: 'id', header: 'Beleg', cell: row => row.id, nowrap: true, compare: (a, b) => collator.compare(a.id, b.id) },
  { id: 'title', header: 'Buchungstext', cell: row => row.title, compare: (a, b) => collator.compare(a.title, b.title) },
  { id: 'amount', header: 'Betrag', format: 'chf', value: row => row.amount, aggregate: 'sum' },
]

export default function Ledger() {
  useEffect(() => { document.documentElement.lang = 'de-CH' }, [])

  return (
    <AlpinaProvider locale="de-CH">
      <Grid as="main" lang="de-CH" space="section" width="site" surface="paper">
        <GridItem medium={7} large={8}>
          <Stack gap={3}>
            <Typography variant="label" tone="accent">Buchhaltung · November 2026</Typography>
            <Typography as="h1" variant="title" responsive>Kassabuch</Typography>
          </Stack>
        </GridItem>
        <GridItem>
          <DataTable rows={entries} columns={columns} rowKey={row => row.id}
            defaultSort={{ column: 'date', direction: 'ascending' }} locale="de-CH"
            caption="Buchungen der Atelierkasse" empty="Keine Buchungen vorhanden."
            sortHint="Wählen Sie eine Spaltenüberschrift, um die Buchungen zu sortieren."
            negativeStyle="parentheses" totalLabel="Schlusssaldo" />
        </GridItem>
      </Grid>
    </AlpinaProvider>
  )
}
