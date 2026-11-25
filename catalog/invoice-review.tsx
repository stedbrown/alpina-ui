import { useId, useRef, useState, type FormEvent } from 'react'
import {
  Alert, Badge, Button, Collapsible, CurrencyCHF, DescriptionList, Dialog, Empty, Field, Grid, GridItem,
  RadioGroup, Select, Separator, Stack, SwissDate, Table, TableBody, TableCell, TableFooter,
  TableHead, TableHeader, TableRow, Textarea, Trace, Typography,
} from 'alpina-ui'
import { initialInvoices, invoiceTotalCHF, type InvoiceStatus } from './invoice-data.js'

const labels: Record<InvoiceStatus, string> = { pending: 'Pending', approved: 'Approved', returned: 'Returned' }

export function InvoiceReview() {
  const [records, setRecords] = useState(initialInvoices)
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')
  const [selected, setSelected] = useState(records[0].id)
  const [requestOpen, setRequestOpen] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [noteError, setNoteError] = useState('')
  const [moved, setMoved] = useState<{ id: string; status: InvoiceStatus } | null>(null)
  const noteInput = useRef<HTMLTextAreaElement>(null)
  const documentHeading = useId()
  const visible = records.filter((invoice) => filter === 'all' || invoice.status === filter)
  const invoice = visible.find((entry) => entry.id === selected) ?? visible[0]

  function decide(status: InvoiceStatus, title: string, note?: string) {
    if (!invoice) return
    setRecords((entries) => entries.map((entry) => entry.id === invoice.id ? {
      ...entry, status, history: [...entry.history, { title, note }],
    } : entry))
    setSelected(invoice.id)
    setRequestOpen(false)
    if (filter !== 'all' && filter !== status) {
      setMoved({ id: invoice.id, status })
      requestAnimationFrame(() => document.getElementById(documentHeading + '-change')?.focus())
    } else {
      setMoved(null)
      requestAnimationFrame(() => document.getElementById(documentHeading)?.focus())
    }
  }

  function requestCorrection(event: FormEvent) {
    event.preventDefault()
    if (!invoice) return
    const note = (drafts[invoice.id] ?? '').trim()
    if (!note) {
      setNoteError('Describe what the supplier needs to correct.')
      requestAnimationFrame(() => noteInput.current?.focus())
      return
    }
    decide('returned', 'Returned for correction', note)
    setDrafts({ ...drafts, [invoice.id]: '' })
  }

  return (
    <Grid as="main" id="main-content" width="site" space="section" tabIndex={-1}>
      <GridItem>
        <Stack gap={3}>
          <Typography as="h1" variant="display">Invoice review</Typography>
          <Typography measure="reading">Check a supplier’s charges against the purchase order, then approve the invoice or request a correction. Decisions stay in this demo until you reload it.</Typography>
          <Separator weight="section" />
        </Stack>
      </GridItem>
      <GridItem medium={3} large={4}>
        <Stack gap={4}>
          <Typography as="h2" variant="heading">Review queue</Typography>
          <Field label="Filter by status">
            {(control) => <Select {...control} value={filter} onChange={({ currentTarget }) => {
              setFilter(currentTarget.value as typeof filter)
              setMoved(null)
            }}>
              <option value="all">All statuses</option>
              {Object.entries(labels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
            </Select>}
          </Field>
          {moved && <Alert tabIndex={-1} id={documentHeading + '-change'} title={moved.id + ' is now ' + labels[moved.status].toLowerCase()}>
            <Button variant="ghost" size="sm" onClick={() => {
              setFilter('all')
              setSelected(moved.id)
              setMoved(null)
              requestAnimationFrame(() => document.getElementById(documentHeading)?.focus())
            }}>View {moved.id}</Button>
          </Alert>}
          {invoice && <RadioGroup label="Select an invoice" value={invoice.id} onValueChange={(id) => {
            setSelected(id)
            setMoved(null)
          }}
            options={visible.map((entry) => ({
              value: entry.id,
              label: <>{entry.supplier}<br />{entry.id} · {labels[entry.status]}</>,
            }))} />}
        </Stack>
      </GridItem>
      <GridItem medium={5} large={7} start={{ large: 6 }}>
        {invoice ? (
          <Stack gap={5}>
            <Stack direction="row" align="baseline" justify="space-between">
              <Typography as="h2" variant="heading" tabIndex={-1} id={documentHeading} aria-describedby={documentHeading + '-status'}>{invoice.id} · {invoice.supplier}</Typography>
              <Badge id={documentHeading + '-status'} tone={invoice.status === 'returned' ? 'danger' : 'neutral'}>{labels[invoice.status]}</Badge>
            </Stack>
            <DescriptionList aria-label="Invoice details" items={[
              { term: 'Purchase order', detail: invoice.order },
              { term: 'Payment due', detail: <SwissDate value={invoice.due} locale="de-CH" dateStyle="medium" /> },
            ]} />
            <Collapsible key={invoice.id} summary={'Inspect order ' + invoice.order}>
              <DescriptionList aria-label="Ordered quantities" items={invoice.lines.map((line) => ({
                term: line.description, detail: <>{line.ordered} ordered at <CurrencyCHF locale="de-CH" amount={line.unitCents / 100} /> each</>,
              }))} />
            </Collapsible>
            <Table aria-label="Invoice charges">
              <TableHeader><TableRow>
                <TableHead>Item</TableHead><TableHead numeric>Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>{invoice.lines.map((line) => (
                <TableRow key={line.description}>
                  <TableCell>{line.description}<Typography variant="caption" numeric>{line.quantity} × <CurrencyCHF locale="de-CH" amount={line.unitCents / 100} /></Typography></TableCell>
                  <TableCell numeric><CurrencyCHF locale="de-CH" amount={line.quantity * line.unitCents / 100} /></TableCell>
                </TableRow>
              ))}</TableBody>
              <TableFooter><TableRow>
                <TableHead scope="row">Total</TableHead>
                <TableCell numeric><CurrencyCHF locale="de-CH" amount={invoiceTotalCHF(invoice)} /></TableCell>
              </TableRow></TableFooter>
            </Table>
            <Stack direction="row" gap={3}>
              {invoice.status === 'pending' ? <>
                <Button onClick={() => decide('approved', 'Approved')}>Approve invoice</Button>
                <Button variant="outline" aria-haspopup="dialog" onClick={() => {
                  setNoteError('')
                  setRequestOpen(true)
                }}>Request correction</Button>
              </> : <Button variant="outline" onClick={() => decide('pending', 'Reopened for review')}>Reopen for review</Button>}
            </Stack>
            <Trace label="Review history" events={invoice.history.map((entry, index) => ({
              id: String(index), title: entry.title, detail: entry.note,
            }))} />
            <Dialog title={'Request a correction to ' + invoice.id} open={requestOpen} onOpenChange={setRequestOpen}
              closeLabel="Close" initialFocusRef={noteInput}>
              <form onSubmit={requestCorrection} noValidate>
                <Stack gap={4}>
                  <Field label="Correction note" description="Identify the line item and the change needed." error={noteError}>
                    {(control) => <Textarea {...control} ref={noteInput} required value={drafts[invoice.id] ?? ''}
                      onChange={({ currentTarget }) => {
                        setDrafts({ ...drafts, [invoice.id]: currentTarget.value })
                        if (currentTarget.value.trim()) setNoteError('')
                      }} />}
                  </Field>
                  <Stack direction="row" gap={3}>
                    <Button type="submit">Return invoice</Button>
                    <Button variant="ghost" onClick={() => setRequestOpen(false)}>Cancel</Button>
                  </Stack>
                </Stack>
              </form>
            </Dialog>
          </Stack>
        ) : (
          <Empty role="status" title={filter === 'all' ? 'No invoices' : 'No ' + labels[filter].toLowerCase() + ' invoices'}
            action={<Button variant="outline" onClick={() => {
              setFilter('all')
              setMoved(null)
              requestAnimationFrame(() => document.getElementById(documentHeading)?.focus())
            }}>Show all invoices</Button>} />
        )}
      </GridItem>
    </Grid>
  )
}
