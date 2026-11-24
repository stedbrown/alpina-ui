import { useState } from 'react'
import { CantonCombobox, type CantonCode, CurrencyCHF, DataTable } from 'alpina-ui'

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
          cell: (r) => r.ref,
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
