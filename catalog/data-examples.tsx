import { useState } from 'react'
import { CantonCombobox, type CantonCode, CurrencyCHF, DataTable } from 'alpina-ui'

export function CantonComboboxExample() {
  const [code, setCode] = useState<CantonCode | ''>('')
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <CantonCombobox
        label="Cantone di riferimento"
        locale="it-CH"
        value={code}
        onCantonChange={setCode}
        description="Prova Genève, Genf o Ginevra."
      />
      <output aria-live="polite">
        {code ? 'Sigla selezionata · ' + code : 'Nessun cantone selezionato'}
      </output>
    </div>
  )
}

export function DataTableExample() {
  const rows = [
    { ref: 'A-104', item: 'Copertine A5', total: 420 },
    { ref: 'A-105', item: 'Carte intestate', total: 1280.5 },
    { ref: 'A-106', item: 'Manifesti B2', total: 96 },
  ]
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.ref}
      caption="Ordini di stampa"
      empty="Nessun ordine"
      columns={[
        {
          id: 'ref',
          header: 'Ordine',
          cell: (r) => r.ref,
          compare: (a, b) => a.ref.localeCompare(b.ref),
        },
        { id: 'item', header: 'Lavorazione', cell: (r) => r.item },
        {
          id: 'total',
          header: 'Importo',
          align: 'end',
          cell: (r) => <CurrencyCHF amount={r.total} />,
          compare: (a, b) => a.total - b.total,
        },
      ]}
    />
  )
}