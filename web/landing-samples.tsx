import { CodeBlock, DataTable, DescriptionList, Dialog, Stack, type DataTableColumn } from 'alpina-ui'

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

export function PressQueue() {
  return <Stack gap={4}>
    <DataTable caption="Print queue" rows={jobs} rowKey={row => row.title} columns={columns} empty="No jobs in the queue." />
    <Stack align="start"><Dialog title="Studio programme" trigger="View job sheet" closeLabel="Close job sheet"
      description="Production notes for the next job on press.">
      <DescriptionList items={[{term:'Format', detail:'A2 portrait'}, {term:'Stock', detail:'Uncoated, 140 g/m²'}, {term:'Edition', detail:'150 copies'}]} />
    </Dialog></Stack>
  </Stack>
}

export function InstallCommand({ command }: { command: string }) {
  return <CodeBlock label="Terminal" code={command} />
}
