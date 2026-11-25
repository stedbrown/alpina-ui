import { useState } from 'react'
import { BarChart, ChartTable, LineChart, Sparkline, CantonCombobox, type CantonCode, CurrencyCHF, DataTable, Typography } from 'alpina-ui'

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
  const rows = [
    { ref: 'A-104', item: 'A5 covers', total: 420 },
    { ref: 'A-105', item: 'Letterheads', total: 1280.5 },
    { ref: 'A-106', item: 'B2 posters', total: 96 },
  ]
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.ref}
      caption="Print orders"
      empty="No orders"
      columns={[
        {
          id: 'ref',
          header: 'Order',
          cell: (r) => <Typography as="span" variant="inherit" numeric>{r.ref}</Typography>,
          compare: (a, b) => a.ref.localeCompare(b.ref),
        },
        { id: 'item', header: 'Print job', cell: (r) => r.item },
        {
          id: 'total',
          header: 'Amount',
          align: 'end',
          cell: (r) => <CurrencyCHF amount={r.total} />,
          compare: (a, b) => a.total - b.total,
        },
      ]}
    />
  )
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
