import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Accordion } from '../src/interactive/accordion.js'
import { Dialog } from '../src/interactive/dialog.js'
import { DropdownMenu } from '../src/interactive/dropdown-menu.js'
import { Sheet } from '../src/interactive/sheet.js'
import { Tabs } from '../src/interactive/tabs.js'
import { Toast } from '../src/interactive/toast.js'
import { Tooltip } from '../src/interactive/tooltip.js'
import { DataTable, type DataColumn, type DataSort } from '../src/ui/data-table.js'
import { CurrencyCHF } from '../src/swiss/currency-chf.js'
import '../src/theme.css'

const invoices = Object.freeze([
  { id: 'B', cents: 12000 },
  { id: 'A', cents: 800 },
  { id: 'C', cents: 12000 },
])
const columns: DataColumn<(typeof invoices)[number]>[] = [
  {
    id: 'id',
    header: 'Riferimento',
    cell: (row) => row.id,
    compare: (a, b) => a.id.localeCompare(b.id),
  },
  {
    id: 'cents',
    header: 'Importo',
    align: 'end',
    cell: (row) => <CurrencyCHF amount={row.cents / 100} />,
    compare: (a, b) => a.cents - b.cents,
  },
  { id: 'note', header: 'Nota', cell: () => 'In registro' },
]

function Fixture() {
  const [notice, setNotice] = useState(false)
  const [choice, setChoice] = useState('')
  const [sheet, setSheet] = useState(false)
  const [requestedSort, setRequestedSort] = useState<DataSort | null>(null)
  const [appliedSort, setAppliedSort] = useState<DataSort | null>(null)
  const actions = [
    { value: 'view', label: 'Apri' },
    { value: 'edit', label: 'Modifica', disabled: true },
    { value: 'save', label: 'Salva' },
  ]
  return (
    <main>
      <Dialog
        title="Impostazioni locali"
        trigger="Apri finestra"
        description="Salva una preferenza."
        closeLabel="Chiudi finestra"
      >
        <DropdownMenu label="Azioni locali" items={actions} onValueSelect={setChoice} />
        <button type="button">Fine</button>
      </Dialog>
      <Sheet
        side="start"
        open={sheet}
        onOpenChange={setSheet}
        title="Pannello"
        trigger="Apri pannello"
        closeLabel="Chiudi pannello"
      >
        <button type="button" onClick={() => setSheet(false)}>
          Applica
        </button>
      </Sheet>
      <Tabs
        label="Lingue"
        defaultValue="it"
        items={[
          { value: 'it', label: 'Italiano', content: 'Contenuto italiano' },
          { value: 'fr', label: 'Francese', content: 'Contenu français', disabled: true },
          { value: 'de', label: 'Tedesco', content: 'Deutscher Inhalt' },
        ]}
      />
      <Accordion
        items={[
          { value: 'one', title: 'Prima sezione', content: 'Primo dettaglio' },
          { value: 'two', title: 'Seconda sezione', content: 'Secondo dettaglio' },
        ]}
      />
      <div style={{ textAlign: 'right' }}>
        <DropdownMenu label="Azioni" items={actions} onValueSelect={setChoice} />
      </div>
      <button type="button" id="after-menu">
        Seguito
      </button>
      <output data-choice="">{choice}</output>
      <Tooltip content="Apre la guida">
        <button type="button" aria-describedby="context">
          Aiuto
        </button>
      </Tooltip>
      <span id="context" hidden>
        Manuale Alpina.
      </span>
      <button type="button" onClick={() => setNotice(true)}>
        Salva preferenze
      </button>
      <Toast open={notice} onOpenChange={setNotice} closeLabel="Chiudi avviso">
        Preferenze salvate
      </Toast>
      <DataTable
        caption="Fatture"
        rows={invoices}
        columns={columns}
        rowKey={(row) => row.id}
        empty="Nessuna fattura"
      />
      <DataTable
        caption="Fatture controllate"
        rows={invoices}
        columns={columns}
        rowKey={(row) => row.id}
        sort={appliedSort}
        onSortChange={setRequestedSort}
        empty="Nessuna fattura"
      />
      <button type="button" onClick={() => setAppliedSort(requestedSort)}>
        Applica ordinamento
      </button>
      <DataTable
        caption="Archivio"
        rows={[]}
        columns={columns}
        rowKey={(row) => row.id}
        empty="L'archivio è vuoto"
      />
    </main>
  )
}

createRoot(document.querySelector('#app')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
)
