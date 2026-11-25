import { useState } from 'react'
import { BarChart, ChartTable, LineChart, Sparkline, CantonCombobox, type CantonCode, DataTable } from 'alpina-ui'

export function CantonComboboxExample() {
  const [code, setCode] = useState<CantonCode | ''>('')
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <p>Search for the same canton using Genève, Genf, or Ginevra.</p>
      <CantonCombobox
        locale="it-CH"
        value={code}
        onCantonChange={setCode}
      />
      <output aria-live="polite">
        {code ? 'Selected code · ' + code : 'No canton selected'}
      </output>
    </div>
  )
}

export function DataTableExample() {
  const entries = [
    { id: 'P-104', entry: 'Cover proofs', date: '03.11.2026', amount: '480.00', account: 'Prepress' },
    { id: 'P-105', entry: 'Plate credit', date: '28.10.2026', amount: '-32.50', account: 'Prepress' },
    { id: 'P-106', entry: 'Press run', date: '18.11.2026', amount: '1280.50', account: 'Printing' },
    { id: 'P-107', entry: 'Binding', date: '04.11.2026', amount: '96', account: 'Printing' },
  ]
  return <DataTable caption="Print ledger" empty="No entries" rows={entries} rowKey={row => row.id}
    locale="de-CH" negativeStyle="parentheses" stickyHeader stickyFirstColumn maxHeight="34rem"
    groupBy={row => row.account} subtotalLabel={name => name + ' subtotal'} totalLabel="Invoice total"
    columns={[
      { id: 'entry', header: 'Work', cell: row => row.entry },
      { id: 'date', header: 'Booked', format: 'swiss-date', value: row => row.date },
      { id: 'amount', header: 'Amount', format: 'chf', value: row => row.amount, aggregate: 'sum' },
    ]} />
}

export function BarChartExample() {
  return <BarChart title="Change in library loans" description="Change against the previous quarter, in loans."
    categoryLabel="Branch" valueLabel="Change" data={[
      { label: 'Oerlikon', value: 128 }, { label: 'Altstadt', value: 84 }, { label: 'Wiedikon', value: -32 },
    ]} />
}

export function LineChartExample() {
  return <LineChart title="Passenger counts" description="Morning departures at the station, Monday through Friday."
    categoryLabel="Day" valueLabel="Passengers" data={[
      { label: 'Mon', value: 420 }, { label: 'Tue', value: 520 }, { label: 'Wed', value: 480 },
      { label: 'Thu', value: 560 }, { label: 'Fri', value: 460 },
    ]} />
}

export function SparklineExample() {
  return <Sparkline title="Reservoir level" description="Water level across four readings, in metres."
    categoryLabel="Time" valueLabel="Metres" formatValue={n => n + ' m'} data={[
      { label: '06:00', value: 18 }, { label: '09:00', value: 16 },
      { label: '12:00', value: 17 }, { label: '15:00', value: 14 },
    ]} />
}

export function ChartTableExample() {
  return <ChartTable title="Printed editions" description="Copies delivered to each regional office."
    categoryLabel="Office" valueLabel="Copies" data={[
      { label: 'Basel', value: 360 }, { label: 'Bern', value: 240 }, { label: 'Lugano', value: 120 },
    ]} />
}
