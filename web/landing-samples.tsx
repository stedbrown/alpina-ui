import { CodeBlock, Collapsible, DataTable, DescriptionList, Dialog, Stack, type DataTableColumn } from 'alpina-ui'

const jobs = [
  { title: 'Studio programme', stock: 'Uncoated', copies: 150 },
  { title: 'Exhibition label', stock: 'Card', copies: 60 },
  { title: 'Gallery map', stock: 'Recycled', copies: 240 },
]
const columns: DataTableColumn<typeof jobs[number]>[] = [
  { id: 'title', header: 'Job', cell: row => row.title, compare: (a, b) => a.title.localeCompare(b.title) },
  { id: 'stock', header: 'Paper', cell: row => row.stock },
  { id: 'copies', header: 'Copies', format: 'decimal', fractionDigits: 0, value: row => row.copies },
]

export function PressQueue({ interactive = true }: { interactive?: boolean } = {}) {
  const notes = <DescriptionList items={[{term:'Format', detail:'A2 portrait'}, {term:'Stock', detail:'Uncoated, 140 g/m²'}, {term:'Edition', detail:'150 copies'}]} />
  const displayed = interactive ? columns : columns.map(col => 'format' in col ? { ...col, sortable: false } : { ...col, compare: undefined })
  return <Stack gap={4}>
    <DataTable caption="Print queue" rows={jobs} rowKey={row => row.title} columns={displayed} empty="No jobs in the queue." />
    <Stack align="start">{interactive ? <Dialog title="Studio programme" trigger="View job sheet" closeLabel="Close job sheet"
      description="Production notes for the next job on press.">
      {notes}
    </Dialog> : <Collapsible summary="View job sheet">{notes}</Collapsible>}</Stack>
  </Stack>
}

export function InstallCommand({ command }: { command: string }) {
  return <CodeBlock label="Terminal" code={command} />
}
