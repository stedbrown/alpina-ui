import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Accordion } from '../src/interactive/accordion.js'
import { Dialog } from '../src/interactive/dialog.js'
import { DropdownMenu } from '../src/interactive/dropdown-menu.js'
import { Sheet } from '../src/interactive/sheet.js'
import { Tabs } from '../src/interactive/tabs.js'
import { Toast, Toaster, toast } from '../src/interactive/toast.js'
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
    header: 'Reference',
    cell: (row) => row.id,
    compare: (a, b) => a.id.localeCompare(b.id),
  },
  {
    id: 'cents',
    header: 'Amount',
    align: 'end',
    cell: (row) => <CurrencyCHF amount={row.cents / 100} />,
    compare: (a, b) => a.cents - b.cents,
  },
  { id: 'note', header: 'Note', cell: () => 'Registered' },
]

function Fixture() {
  const [notice, setNotice] = useState(false)
  const [choice, setChoice] = useState('')
  const [sheet, setSheet] = useState(false)
  const [requestedSort, setRequestedSort] = useState<DataSort | null>(null)
  const [appliedSort, setAppliedSort] = useState<DataSort | null>(null)
  const actions = [
    { value: 'view', label: 'Open' },
    { value: 'edit', label: 'Edit', disabled: true },
    { value: 'save', label: 'Save' },
  ]
  return (
    <main>
      <Dialog
        title="Local settings"
        trigger="Open window"
        description="Save a preference."
        closeLabel="Close window"
      >
        <DropdownMenu label="Local actions" items={actions} onValueSelect={setChoice} />
        <button type="button">Done</button>
      </Dialog>
      <Sheet
        side="start"
        open={sheet}
        onOpenChange={setSheet}
        title="Panel"
        trigger="Open panel"
        closeLabel="Close panel"
      >
        <button type="button" onClick={() => setSheet(false)}>
          Apply
        </button>
      </Sheet>
      <Tabs
        label="Languages"
        defaultValue="it"
        items={[
          { value: 'it', label: 'Italian', content: 'Contenuto italiano' },
          { value: 'fr', label: 'French', content: 'Contenu français', disabled: true },
          { value: 'de', label: 'German', content: 'Deutscher Inhalt' },
        ]}
      />
      <Accordion
        items={[
          { value: 'one', title: 'First section', content: 'First detail' },
          { value: 'two', title: 'Second section', content: 'Second detail' },
        ]}
      />
      <div style={{ textAlign: 'right' }}>
        <DropdownMenu label="Actions" items={actions} onValueSelect={setChoice} />
      </div>
      <button type="button" id="after-menu">
        Next control
      </button>
      <output data-choice="">{choice}</output>
      <Tooltip content="Opens the guide">
        <button type="button" aria-describedby="context">
          Help
        </button>
      </Tooltip>
      <span id="context" hidden>
        Alpina manual.
      </span>
      <button type="button" onClick={() => setNotice(true)}>
        Save preferences
      </button>
      <Toast open={notice} onOpenChange={setNotice} closeLabel="Dismiss notification">
        Preferences saved
      </Toast>
      <DataTable
        caption="Invoices"
        rows={invoices}
        columns={columns}
        rowKey={(row) => row.id}
        empty="No invoices"
      />
      <DataTable
        caption="Controlled invoices"
        rows={invoices}
        columns={columns}
        rowKey={(row) => row.id}
        sort={appliedSort}
        onSortChange={setRequestedSort}
        empty="No invoices"
      />
      <button type="button" onClick={() => setAppliedSort(requestedSort)}>
        Apply sort
      </button>
      <DataTable
        caption="Archive"
        rows={[]}
        columns={columns}
        rowKey={(row) => row.id}
        empty="The archive is empty"
      />
      <button onClick={() => { toast('Request saved'); toast('Receipt ready') }}>Queue confirmations</button>
      <Toaster closeLabel="Dismiss confirmation" />
    </main>
  )
}

createRoot(document.querySelector('#app')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
)
