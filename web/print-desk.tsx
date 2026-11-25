import { useState } from 'react'
import {
  Badge, Button, Card, CardDescription, CardFooter, CardHeader, CardTitle, Chart, Collapsible, DataTable,
  DescriptionList, Dialog, Grid, GridItem, Label, Select, Separator, Slider, Stack, Switch, Toaster, Typography,
  formatCHF, toast, type DataTableColumn,
} from 'alpina-ui'
import { useNumericSetting, useSwitchSetting } from './proof-setting.js'
import { initialCopies, posterEstimate, pressSetup, unitPrice } from './poster-estimate.js'

interface PrintJob { title: string; stock: string; copies: number; secondInk: boolean }
const initialJobs: PrintJob[] = [
  { title: 'Studio programme', stock: 'Uncoated', copies: 150, secondInk: false },
  { title: 'Exhibition label', stock: 'Card', copies: 60, secondInk: true },
  { title: 'Gallery map', stock: 'Recycled', copies: 240, secondInk: false },
]
const printWeeks = [
  { week: '15–19 March 2027', hours: [4, 7, 5, 8, 6] },
  { week: '22–26 March 2027', hours: [6, 5, 8, 7, 4] },
]
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const price = (copies: number, secondInk: boolean) => formatCHF(posterEstimate(copies, secondInk), 'de-CH')

function PrintEstimate({ interactive, enqueue }: { interactive: boolean; enqueue: (copies: number, secondInk: boolean) => void }) {
  const [copies, setCopies] = useNumericSetting('poster-copies', initialCopies)
  const [secondInk, setSecondInk] = useSwitchSetting('poster-second-ink', false)
  return <Card as="section" id={interactive ? 'poster-estimate' : undefined} aria-label="Poster estimate">
    <CardHeader><CardTitle as="h4">Poster estimate</CardTitle><CardDescription>A2 on uncoated stock, 140 g/m²</CardDescription></CardHeader>
    <Separator />
    {interactive ? <Stack gap={3}>
      <Stack gap={0}>
        <Stack direction="row" justify="space-between">
          <Label htmlFor="poster-copies">Edition size</Label>
          <Typography as="output" htmlFor="poster-copies" variant="label" numeric>{copies + ' copies'}</Typography>
        </Stack>
        <Slider id="poster-copies" min={25} max={250} step={25} value={copies}
          aria-valuetext={copies + ' copies'} onChange={event => setCopies(event.currentTarget.valueAsNumber)} />
      </Stack>
      <Stack direction="row" justify="space-between" gap={2}>
        <Label htmlFor="poster-second-ink">Add a second ink</Label>
        <Switch id="poster-second-ink" checked={secondInk} onChange={event => setSecondInk(event.currentTarget.checked)} />
      </Stack>
    </Stack> : <Typography variant="label">{initialCopies} copies · Black ink</Typography>}
    <DescriptionList items={[
      { term: 'Press setup', detail: formatCHF(pressSetup, 'de-CH') },
      { term: 'Per copy', detail: formatCHF(unitPrice(secondInk), 'de-CH') },
    ]} />
    <CardFooter>
      <Stack gap={1}>
        <Typography variant="caption">Estimated total</Typography>
        <Typography variant="heading" numeric lang="de-CH" data-estimate-total="" role="status">{price(copies, secondInk)}</Typography>
      </Stack>
      {interactive && <Button onClick={() => enqueue(copies, secondInk)}>Add to queue</Button>}
    </CardFooter>
  </Card>
}

function PressChart({ hours }: { hours: number[] }) {
  return <Chart title="Hours on press" data={hours.map((value, day) => ({ label: weekdays[day], value }))}
    categoryLabel="Weekday" valueLabel="Hours" tableLabel="View hours as a table" />
}

function PressLog({ interactive }: { interactive: boolean }) {
  const [week, setWeek] = useNumericSetting('press-week', 0)
  return <Card as="section" id={interactive ? 'press-log' : undefined} aria-label="Press log">
    <CardHeader><CardTitle as="h4">Press log</CardTitle></CardHeader>
    {interactive ? <>
      <Stack gap={1}><Label htmlFor="press-week">Reporting week</Label>
        <Select id="press-week" value={week} onChange={event => setWeek(Number(event.currentTarget.value))}>
          {printWeeks.map((period, i) => <option key={period.week} value={i}>{period.week}</option>)}
        </Select>
      </Stack>
      <Stack gap={0} data-print-weeks=""><PressChart hours={printWeeks[week].hours} /></Stack>
    </> : <Stack gap={0} data-showcase-fallback="">{printWeeks.map((period, i) => <Collapsible key={period.week} summary={period.week} name="press-week" open={i === 0}>
      <PressChart hours={period.hours} />
    </Collapsible>)}</Stack>}
    <CardFooter><Typography variant="label">Weekly total</Typography>
      <Typography variant="label" numeric>{printWeeks[week].hours.reduce((sum, hours) => sum + hours, 0) + ' h'}</Typography>
    </CardFooter>
  </Card>
}

function JobSheet({ job, interactive }: { job: PrintJob; interactive: boolean }) {
  const details = <DescriptionList items={[
    { term: 'Paper', detail: job.stock }, { term: 'Inks', detail: job.secondInk ? 'Black and red' : 'Black' },
    { term: 'Edition', detail: job.copies + ' copies' }, { term: 'Quote', detail: price(job.copies, job.secondInk) },
  ]} />
  return interactive
    ? <Dialog title={job.title} trigger={job.title} closeLabel="Close job sheet" description="Production specifications">{details}</Dialog>
    : <Collapsible summary={job.title}>{details}</Collapsible>
}

export function PrintDesk({ interactive = true }: { interactive?: boolean }) {
  const [jobs, setJobs] = useState(initialJobs)
  function enqueue(copies: number, secondInk: boolean) {
    const title = 'Poster edition ' + String(jobs.length + 1).padStart(2, '0')
    setJobs([...jobs, { title, copies, secondInk, stock: 'Uncoated' }])
    toast(title + ' added to the queue.', { tone: 'success' })
  }
  const columns: DataTableColumn<PrintJob>[] = [
    { id: 'title', header: 'Job sheet', cell: row => <JobSheet job={row} interactive={interactive} />,
      compare: interactive ? (a, b) => a.title.localeCompare(b.title) : undefined },
    { id: 'stock', header: 'Paper', cell: row => row.stock },
    { id: 'copies', header: 'Copies', format: 'decimal', fractionDigits: 0, value: row => row.copies, sortable: interactive },
  ]
  return <Stack surface="paper" gap={0} aria-label="Print desk workspace" role="region">
    <Stack surface="ink" direction="row" justify="space-between" align="baseline" inset={4}>
      <Typography as="h3" variant="heading">Basel Print Room</Typography><Badge>{jobs.length + ' jobs on file'}</Badge>
    </Stack>
    <Grid space="compact">
      <GridItem medium={4} large={5}><PrintEstimate interactive={interactive} enqueue={enqueue} /></GridItem>
      <GridItem medium={4} large={7}><PressLog interactive={interactive} /></GridItem>
      <GridItem><DataTable caption="Print queue" rows={jobs} rowKey={row => row.title} columns={columns} empty="No jobs in the queue." /></GridItem>
    </Grid>
    {interactive && <Toaster closeLabel="Dismiss print notification" />}
  </Stack>
}
