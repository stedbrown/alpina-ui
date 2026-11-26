import { useEffect, useState } from 'react'
import {
  Stack,
  ScrollArea,
  Typography,
  DescriptionList,
  FieldSet,
  Label,
  TextLink,
  cantons,
  CurrencyCHF,
  SwissDate,
  DatePicker,
  LocaleSelect,
  CantonSelect,
  SwissPostalCodeInput,
  Field,
  Input,
  Select,
  Textarea,
  RadioGroup,
  Checkbox,
  Switch,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Separator,
  Spinner,
  Skeleton,
  Progress,
  Alert,
  Dialog,
  Sheet,
  Tabs,
  Accordion,
  DropdownMenu,
  AlertDialog,
  Item,
  Tooltip,
  Toast,
  Table,
  TableCaption,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Breadcrumb,
  Pagination,
  isSwissPostalCode,
  type SwissLocale,
  type CantonCode,
} from 'alpina-ui'

export function CurrencyCHFExample() {
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [amount, setAmount] = useState('1280.50')
  const valid = amount.trim() !== '' && Number.isFinite(Number(amount))
  return (
    <Stack role="region" aria-label="Production estimate">
      <Stack surface="ink" inset={5}>
        <Stack direction="row" justify="space-between">
          <Typography as="span">Production estimate</Typography>
          <Typography as="span">{locale}</Typography>
        </Stack>
        <Typography as="div" variant="display" numeric aria-live="polite">
          {valid ? <CurrencyCHF amount={Number(amount)} locale={locale} /> : '—'}
        </Typography>
        <Stack direction="row" justify="space-between">
          <Typography as="span">Estimated total</Typography>
          <Typography as="span">CHF</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" align="end">
        <Field label="Amount">
          {(props) => (
            <Input
              {...props}
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
        </Field>
        <Field label="Formatting language">
          {(props) => <LocaleSelect {...props} value={locale} onLocaleChange={setLocale} />}
        </Field>
      </Stack>
    </Stack>
  )
}

export function SwissDateExample() {
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [date, setDate] = useState('2026-11-24')
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= '0001-01-01'
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Production schedule</Typography>
        <Typography as="h3" variant="heading">
          Studio delivery
        </Typography>
      </Stack>
      <Stack direction="row" surface="soft" inset={4}>
        <Typography as="div" variant="display" numeric aria-hidden="true">
          {valid ? date.slice(8) : '—'}
        </Typography>
        <Typography as="output">
          {valid ? <SwissDate value={date} locale={locale} dateStyle="full" /> : 'Choose a date'}
        </Typography>
      </Stack>
      <Stack direction="row" align="end">
        <Stack gap={1}>
          <Typography as="span" variant="label">
            Calendar date
          </Typography>
          <DatePicker
            locale={locale}
            label="Calendar date"
            value={date}
            onValueChange={setDate}
            clearable
          />
        </Stack>
        <Field label="Formatting language">
          {(props) => <LocaleSelect {...props} value={locale} onLocaleChange={setLocale} />}
        </Field>
      </Stack>
    </Stack>
  )
}

export function LocaleSelectExample() {
  const [value, setValue] = useState<SwissLocale>('it-CH')
  const greetings = {
    'it-CH': 'Buongiorno',
    'de-CH': 'Guten Tag',
    'fr-CH': 'Bonjour',
    'rm-CH': 'Bun di',
  }
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Neighbourhood office</Typography>
        <Typography as="h3" variant="heading">
          Correspondence
        </Typography>
      </Stack>
      <Field label="Correspondence language">
        {(props) => <LocaleSelect {...props} value={value} onLocaleChange={setValue} />}
      </Field>
      <Stack surface="soft" inset={4} gap={2}>
        <Typography as="span" variant="caption">
          Salutation
        </Typography>
        <Typography as="output" variant="heading" lang={value}>
          {greetings[value]}
        </Typography>
        <Typography as="span" variant="caption">
          {value}
        </Typography>
      </Stack>
    </Stack>
  )
}

export function CantonSelectExample() {
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [canton, setCanton] = useState<CantonCode>('TI')
  const name = cantons.find((entry) => entry.code === canton)?.names[locale]
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Regional distribution</Typography>
        <Typography as="h3" variant="heading">
          Delivery area
        </Typography>
      </Stack>
      <Stack direction="row" surface="soft" inset={4}>
        <Typography as="span" variant="label">
          {canton}
        </Typography>
        <Stack gap={1}>
          <Typography as="span" variant="caption">
            Selected canton
          </Typography>
          <Typography as="output" variant="heading" lang={locale}>
            {name}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" align="end">
        <Field label="Canton name language">
          {(props) => <LocaleSelect {...props} value={locale} onLocaleChange={setLocale} />}
        </Field>
        <Field label="Canton">
          {(props) => (
            <CantonSelect {...props} value={canton} locale={locale} onCantonChange={setCanton} />
          )}
        </Field>
      </Stack>
    </Stack>
  )
}

export function SwissPostalCodeInputExample() {
  const [value, setValue] = useState('6900')
  const valid = isSwissPostalCode(value)
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Shipping</Typography>
        <Typography as="h3" variant="heading">
          Parcel label
        </Typography>
      </Stack>
      <Stack direction="row" surface="soft" inset={4}>
        <Typography as="span" variant="label">
          CH
        </Typography>
        <Stack gap={1}>
          <Typography as="span" variant="caption">
            Destination postcode
          </Typography>
          <Typography as="output" variant="heading">
            {valid ? value : '—'}
          </Typography>
        </Stack>
      </Stack>
      <Field
        label="Postal code"
        description="Enter four digits."
        error={value && !valid ? 'Check the postal code format.' : undefined}
      >
        {(props) => (
          <SwissPostalCodeInput {...props} value={value} onChange={(e) => setValue(e.target.value)} />
        )}
      </Field>
    </Stack>
  )
}

export function ButtonExample() {
  const [copies, setCopies] = useState(1)
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Publications desk</Typography>
        <Typography as="h3" variant="heading">
          Notebook copies
        </Typography>
      </Stack>
      <Stack direction="row" surface="soft" inset={4}>
        <Stack gap={1}>
          <Typography as="span" variant="caption">
            Requested quantity
          </Typography>
          <Typography as="output">{copies}</Typography>
        </Stack>
        <Stack direction="row" gap={2}>
          <Button onClick={() => setCopies((n) => n + 1)}>Add a copy</Button>
          <Button variant="outline" disabled={copies < 2} onClick={() => setCopies(1)}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}

export function BadgeExample() {
  const projects = [
    { name: 'Trail map', city: 'Chur', state: 'Draft', tone: 'neutral' },
    { name: 'Neighbourhood wayfinding', city: 'Bellinzona', state: 'In review', tone: 'accent' },
    { name: 'Civic notebook', city: 'Lausanne', state: 'Approved', tone: 'success' },
  ] as const
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Regional studio</Typography>
        <Typography as="h3" variant="heading">
          Job status
        </Typography>
      </Stack>
      <Stack asChild gap={2}>
        <ul>
          {projects.map((project) => (
            <Stack asChild direction="row" justify="space-between" gap={2} key={project.name}>
              <li>
                <Stack gap={1}>
                  <strong>{project.name}</strong>
                  <Typography as="span" variant="caption">
                    {project.city}
                  </Typography>
                </Stack>
                <Badge tone={project.tone}>{project.state}</Badge>
              </li>
            </Stack>
          ))}
        </ul>
      </Stack>
    </Stack>
  )
}

export function CardExample() {
  const [reserved, setReserved] = useState(false)
  return (
    <Card>
      <CardHeader>
        <Typography variant="label">Studio editions · No. 03</Typography>
        <CardTitle as="h3">Civic notebook</CardTitle>
        <CardDescription>Bellinzona · Surveys and urban signage</CardDescription>
      </CardHeader>
      <CardContent>
        <DescriptionList
          items={[
            { term: 'Format', detail: 'A5, 32 pages' },
            { term: 'Print run', detail: '80 numbered copies' },
          ]}
        />
      </CardContent>
      <CardFooter>
        <Typography as="span" role="status">
          {reserved ? 'One copy reserved' : 'Collection list'}
        </Typography>
        <Button
          size="sm"
          variant={reserved ? 'outline' : 'primary'}
          onClick={() => setReserved(!reserved)}
        >
          {reserved ? 'Remove copy' : 'Add a copy'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function InputExample() {
  const [query, setQuery] = useState('')
  const places = ['Bellinzona', 'Chur', 'Lausanne', 'Locarno']
  const matches = places.filter((name) =>
    name.toLocaleLowerCase('en').includes(query.trim().toLocaleLowerCase('en')),
  )
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Distribution</Typography>
        <Typography as="h3" variant="heading">
          Collection points
        </Typography>
      </Stack>
      <Field label="Search locations">
        {(props) => (
          <Input
            {...props}
            type="search"
            placeholder="Location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
      </Field>
      <Stack asChild gap={2}>
        <ul>
          {matches.map((name) => (
            <Stack asChild direction="row" justify="space-between" gap={2} key={name}>
              <li>{name}</li>
            </Stack>
          ))}
        </ul>
      </Stack>
      <Typography variant="caption" role="status">
        {matches.length
          ? matches.length + (matches.length === 1 ? ' location available' : ' locations available')
          : 'No matching locations.'}
      </Typography>
    </Stack>
  )
}
export function TextareaExample() {
  const [text, setText] = useState('Deliver to the collection desk at the north entrance.')
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Delivery note</Typography>
        <Typography as="h3" variant="heading">
          Courier instructions
        </Typography>
      </Stack>
      <Stack gap={2}>
        <Field label="Delivery instructions" description="Up to 180 characters.">
          {(props) => (
            <Textarea
              {...props}
              rows={3}
              maxLength={180}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
        </Field>
        <Typography as="span" variant="caption">
          {text.length} / 180
        </Typography>
      </Stack>
    </Stack>
  )
}
export function SelectExample() {
  const formats = { A5: '148 × 210 mm', A4: '210 × 297 mm', A3: '297 × 420 mm' }
  const [format, setFormat] = useState<keyof typeof formats>('A4')
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Paper desk</Typography>
        <Typography as="h3" variant="heading">
          Trim size
        </Typography>
      </Stack>
      <Field label="Paper size">
        {(props) => (
          <Select
            {...props}
            value={format}
            onChange={(e) => setFormat(e.target.value as keyof typeof formats)}
          >
            {Object.keys(formats).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </Select>
        )}
      </Field>
      <Stack direction="row" surface="soft" inset={4}>
        <Typography as="span" variant="label" aria-hidden="true">
          {format}
        </Typography>
        <Stack gap={1}>
          <Typography as="span" variant="caption">
            Sheet dimensions
          </Typography>
          <Typography as="output" variant="heading">
            {formats[format]}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
export function CheckboxExample() {
  const items = ['Printed draft', 'Paper sample', 'Colour specification']
  const [selected, setSelected] = useState<string[]>(['Printed draft'])
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Sample shipment</Typography>
        <Typography as="h3" variant="heading">
          Package contents
        </Typography>
      </Stack>
      <FieldSet legend="Enclosures">
        <Stack gap={2}>
          {items.map((item) => (
            <Stack asChild direction="row" gap={2} key={item}>
              <Label>
                <Checkbox
                  checked={selected.includes(item)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, item]
                        : selected.filter((value) => value !== item),
                    )
                  }
                />
                {item}
              </Label>
            </Stack>
          ))}
        </Stack>
      </FieldSet>
      <Stack direction="row" justify="space-between">
        <Typography as="output">
          {selected.length} of {items.length} enclosures included
        </Typography>
      </Stack>
    </Stack>
  )
}
export function RadioGroupExample() {
  const [method, setMethod] = useState('studio')
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Print order</Typography>
        <Typography as="h3" variant="heading">
          Delivery of copies
        </Typography>
      </Stack>
      <RadioGroup
        label="Delivery method"
        value={method}
        onValueChange={setMethod}
        options={[
          { value: 'studio', label: 'Studio collection' },
          { value: 'post', label: 'Send by post' },
        ]}
      />
      <Stack surface="soft" inset={4} gap={2}>
        <Typography as="span" variant="caption">
          {method === 'studio' ? 'Collection point' : 'Destination'}
        </Typography>
        <Typography as="output">
          {method === 'studio' ? 'Publications desk · Bellinzona' : 'Recipient’s address'}
        </Typography>
      </Stack>
    </Stack>
  )
}
export function SwitchExample() {
  const [showArchived, setShowArchived] = useState(false)
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Project archive</Typography>
        <Typography as="h3" variant="heading">
          Job visibility
        </Typography>
      </Stack>
      <Stack asChild direction="row" gap={2}>
        <Label>
          <Typography as="span">Include archived projects</Typography>
          <Switch checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
        </Label>
      </Stack>
      <Stack asChild gap={2}>
        <ul>
          <Stack asChild direction="row" justify="space-between" gap={2}>
            <li>
              <strong>Trail map</strong>
              <Badge tone="success">In progress</Badge>
            </li>
          </Stack>
          {showArchived && (
            <Stack asChild direction="row" justify="space-between" gap={2}>
              <li>
                <strong>Civic notebook</strong>
                <Badge>Archived</Badge>
              </li>
            </Stack>
          )}
        </ul>
      </Stack>
    </Stack>
  )
}
export function FieldExample() {
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const [saved, setSaved] = useState('')
  const valid = name.trim().length >= 3
  return (
    <Stack asChild>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setTouched(true)
          if (valid) setSaved(name.trim())
        }}
      >
        <Stack gap={1}>
          <Typography variant="label">Regional studio</Typography>
          <Typography as="h3" variant="heading">
            New print job
          </Typography>
        </Stack>
        <Field
          label="Project name"
          description="At least three characters."
          error={touched && !valid ? 'Enter a name with at least three characters.' : undefined}
        >
          {(props) => (
            <Input
              {...props}
              value={name}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Station signs"
              onChange={(e) => {
                setName(e.target.value)
                setSaved('')
              }}
            />
          )}
        </Field>
        <Stack direction="row" gap={2}>
          <Button type="submit">Create draft</Button>
          <Typography as="output">{saved && 'Draft created · ' + saved}</Typography>
        </Stack>
      </form>
    </Stack>
  )
}
export function AlertExample() {
  const [checked, setChecked] = useState(false)
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Production check</Typography>
        <Typography as="h3" variant="heading">
          Proof review
        </Typography>
      </Stack>
      <Alert
        title={checked ? 'Proof checked' : 'Review required'}
        tone={checked ? 'success' : 'warning'}
      >
        {checked ? 'The trim size has been confirmed.' : 'Confirm the trim size before printing.'}
      </Alert>
      <Stack asChild direction="row" gap={2}>
        <Label>
          <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />I checked the A3
          format
        </Label>
      </Stack>
    </Stack>
  )
}
export function SeparatorExample() {
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Job sheet</Typography>
        <Typography as="h3" variant="heading">
          Civic notebook
        </Typography>
      </Stack>
      <Stack gap={1}>
        <strong>Bookbinding</strong>
        <Typography variant="caption">32 pages · Saddle stitch</Typography>
      </Stack>
      <Separator />
      <Stack gap={1}>
        <strong>Delivery</strong>
        <Typography variant="caption">Publications desk · 6500 Bellinzona</Typography>
      </Stack>
    </Stack>
  )
}
export function ProgressExample() {
  const tasks = ['Trim size checked', 'Colours approved', 'Print run confirmed']
  const [done, setDone] = useState<string[]>(['Trim size checked'])
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Quality control</Typography>
        <Typography as="h3" variant="heading">
          Print run setup
        </Typography>
      </Stack>
      <Progress
        value={done.length}
        max={tasks.length}
        label="Print checks complete"
        formatValue={(value, max) => `${value} of ${max}`}
        showLabel
      />
      <Stack gap={2}>
        {tasks.map((task) => (
          <Stack asChild direction="row" gap={2} key={task}>
            <Label>
              <Checkbox
                checked={done.includes(task)}
                onChange={(e) =>
                  setDone(e.target.checked ? [...done, task] : done.filter((entry) => entry !== task))
                }
              />
              {task}
            </Label>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
export function SpinnerExample() {
  const [run, setRun] = useState(0)
  const [file, setFile] = useState<{ url: string; bytes: number } | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    let objectUrl = ''
    // Keep the loading indicator visible while this small local example prepares the file.
    const timer = window.setTimeout(async () => {
      const rows = [
        ['Project', 'Canton', 'Status'],
        ['Neighbourhood wayfinding', 'TI', 'In progress'],
        ['Trail map', 'GR', 'In progress'],
        ['Civic notebook', 'VD', 'Archived'],
        ['Posters for the square', 'TI', 'Archived'],
      ]
      try {
        const csv = '\uFEFF' + rows.map((row) => row.join(';')).join('\r\n')
        const buffer = await new Blob([csv]).arrayBuffer()
        if (!active) return
        const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' })
        objectUrl = URL.createObjectURL(blob)
        setFile({ url: objectUrl, bytes: blob.size })
      } catch {
        if (active) setFailed(true)
      }
    }, 850)
    return () => {
      active = false
      window.clearTimeout(timer)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [run])
  function regenerate() {
    setFile(null)
    setFailed(false)
    setRun((index) => index + 1)
  }
  return (
    <Stack role="region" aria-label="Register export">
      <Stack direction="row" justify="space-between">
        <Stack gap={1}>
          <Typography variant="label">Project archive</Typography>
          <Typography as="h3" variant="heading">
            Export file
          </Typography>
        </Stack>
        <Typography as="span">CSV</Typography>
      </Stack>
      <Stack direction="row" surface="soft" inset={4}>
        <Stack gap={1} aria-hidden="true">
          {file ? '↓' : failed ? '!' : <Spinner />}
        </Stack>
        <Stack gap={1}>
          <strong>project-register.csv</strong>
          <Typography variant="caption" role="status">
            {file
              ? 'File ready · ' + file.bytes + ' bytes'
              : failed
                ? 'Could not create the file.'
                : 'Preparing file…'}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justify="space-between">
        <Typography as="span" variant="caption">
          4 projects · UTF-8
        </Typography>
        <Stack direction="row" gap={2}>
          {file && (
            <TextLink href={file.url} download="project-register.csv">
              Download CSV{' '}
              <Typography as="span" aria-hidden="true">
                ↓
              </Typography>
            </TextLink>
          )}
          <Button variant="outline" size="sm" disabled={!file && !failed} onClick={regenerate}>
            {failed ? 'Retry' : 'Regenerate'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
export function SkeletonExample() {
  const [ready, setReady] = useState(true)
  useEffect(() => {
    if (ready) return
    const timer = window.setTimeout(() => setReady(true), 1300)
    return () => window.clearTimeout(timer)
  }, [ready])
  return (
    <Stack>
      <Stack direction="row" justify="space-between">
        <Stack gap={1}>
          <Typography variant="label">Project archive</Typography>
          <Typography as="h3" variant="heading">
            Latest records
          </Typography>
        </Stack>
        <Button size="sm" variant="outline" onClick={() => setReady(false)} disabled={!ready}>
          Reload
        </Button>
      </Stack>
      <Stack asChild gap={2}>
        <ul aria-busy={!ready}>
          {['Trail map', 'Civic notebook', 'Posters for the square'].map((name, index) => (
            <Stack asChild direction="row" justify="space-between" gap={2} key={name}>
              <li>
                {ready ? <strong>{name}</strong> : <Skeleton variant="text" />}
                {ready ? (
                  <Typography as="span" variant="caption">
                    {['GR', 'VD', 'TI'][index]}
                  </Typography>
                ) : (
                  <Skeleton variant="text" />
                )}
              </li>
            </Stack>
          ))}
        </ul>
      </Stack>
      <Typography variant="caption" role="status">
        {ready ? '3 records available' : 'Loading records…'}
      </Typography>
    </Stack>
  )
}
export function TableExample() {
  const entries = [
    { name: 'Civic notebook', format: 'A5', copies: 80 },
    { name: 'Neighbourhood poster', format: 'A3', copies: 40 },
    { name: 'Trail map', format: 'A4', copies: 120 },
  ]
  return (
    <Stack>
      <Stack direction="row" justify="space-between">
        <Stack gap={1}>
          <Typography variant="label">Production plan</Typography>
          <Typography as="h3" variant="heading">
            Studio print runs
          </Typography>
        </Stack>
      </Stack>
      <ScrollArea label="Studio print quantities">
        <Table>
          <TableCaption>Quantities by publication</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Publication</TableHead>
              <TableHead scope="col">Size</TableHead>
              <TableHead scope="col" numeric aria-label="Qty (number of copies)">Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.name}>
                <TableHead scope="row">{entry.name}</TableHead>
                <TableCell>{entry.format}</TableCell>
                <TableCell numeric>{entry.copies}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Stack direction="row" justify="space-between">
        <Typography as="span" variant="caption">
          Total in production
        </Typography>
        <strong>{entries.reduce((sum, entry) => sum + entry.copies, 0)} copies</strong>
      </Stack>
    </Stack>
  )
}
export function BreadcrumbExample() {
  const names = ['Atelier', 'Editions', 'Civic notebook']
  const [level, setLevel] = useState(() => {
    if (typeof window === 'undefined') return 2
    const param = new URLSearchParams(window.location.search).get('sezione')
    return param === '0' || param === '1' ? Number(param) : 2
  })
  return (
    <Stack>
      <Breadcrumb
        label="Archive breadcrumb"
        items={names
          .slice(0, level + 1)
          .map((label, index) =>
            index === level ? { label } : { label, href: '?sezione=' + index + '#breadcrumb' },
          )}
        onClick={(event) => {
          const link = (event.target as HTMLElement).closest('a')
          if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          setLevel(Number(new URL(link.href).searchParams.get('sezione')))
        }}
      />
      <Stack surface="soft" inset={4} gap={2}>
        <Typography as="span" variant="caption">
          {level === 2 ? 'Publication' : 'Archive'}
        </Typography>
        <Typography as="h3" variant="heading">
          {names[level]}
        </Typography>
        <Typography variant="caption">
          {
            ['Printing and bookbinding workshop.', 'Studio publications.', 'A5 · 32 pages · Bellinzona'][
              level
            ]
          }
        </Typography>
      </Stack>
      {level < 2 && (
        <Stack direction="row" gap={2}>
          <Button variant="outline" onClick={() => setLevel(level + 1)}>
            Open {names[level + 1]}
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
export function PaginationExample() {
  const entries = [
    ['Trail map', 'Chur'],
    ['Civic notebook', 'Lausanne'],
    ['Neighbourhood wayfinding', 'Bellinzona'],
    ['Posters for the square', 'Locarno'],
    ['Studio directory', 'Bern'],
    ['Lakeside notebook', 'Lugano'],
  ]
  const [page, setPage] = useState(() => {
    if (typeof window === 'undefined') return 1
    const number = Number(new URLSearchParams(window.location.search).get('pagina'))
    return [1, 2, 3].includes(number) ? number : 1
  })
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Editions</Typography>
        <Typography as="h3" variant="heading">
          Project index
        </Typography>
      </Stack>
      <Stack asChild gap={2}>
        <ul>
          {entries.slice((page - 1) * 2, page * 2).map(([name, city]) => (
            <Stack asChild direction="row" justify="space-between" gap={2} key={name}>
              <li>
                <strong>{name}</strong>
                <Typography as="span" variant="caption">
                  {city}
                </Typography>
              </li>
            </Stack>
          ))}
        </ul>
      </Stack>
      <Stack direction="row" justify="space-between">
        <Typography as="output" variant="caption">
          Page {page} of 3
        </Typography>
        <Pagination
          label="Project pages"
          currentPage={page}
          onClick={(event) => {
            const link = (event.target as Element).closest('a')
            if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
              event.preventDefault()
              setPage(Number(new URL(link.href).searchParams.get('pagina')))
            }
          }}
          items={[1, 2, 3].map((n) => ({
            page: n,
            href: '?pagina=' + n + '#pagination',
            accessibleLabel: 'Page ' + n,
          }))}
        />
      </Stack>
    </Stack>
  )
}
export function TabsExample() {
  const sections = [
    {
      value: 'stock',
      label: 'Stock',
      rows: [
        ['Paper', 'Natural ivory'],
        ['Paper weight', '140 g/m²'],
      ],
    },
    {
      value: 'print',
      label: 'Printing',
      rows: [
        ['Technique', 'Offset'],
        ['Passes', 'Two colours'],
      ],
    },
    {
      value: 'finishing',
      label: 'Finishing',
      rows: [
        ['Binding', 'Saddle stitch'],
        ['Pagination', '32 pages'],
      ],
    },
  ]
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Civic notebook</Typography>
        <Typography as="h3" variant="heading">
          Production specifications
        </Typography>
      </Stack>
      <Tabs
        label="Production specifications"
        items={sections.map((section) => ({
          value: section.value,
          label: section.label,
          content: <DescriptionList items={section.rows.map(([term, detail]) => ({ term, detail }))} />,
        }))}
      />
    </Stack>
  )
}
export function AccordionExample() {
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Publications desk · Bellinzona</Typography>
        <Typography as="h3" variant="heading">
          Studio collection
        </Typography>
      </Stack>
      <Accordion
        headingLevel={4}
        defaultValue="where"
        items={[
          {
            value: 'where',
            title: 'Where can I collect my copies?',
            content: 'At the publications desk. Use the courtyard entrance.',
          },
          {
            value: 'what',
            title: 'What should I bring?',
            content: 'Bring your collection confirmation with the job name and number of copies.',
          },
          {
            value: 'delegate',
            title: 'Can someone collect on my behalf?',
            content: 'Yes. Give them the job name before they arrive.',
          },
        ]}
      />
    </Stack>
  )
}
export function DialogExample() {
  const [open, setOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  return (
    <Stack>
      <Stack direction="row" justify="space-between">
        <Stack gap={1}>
          <Typography variant="label">Bellinzona · A3 series</Typography>
          <Typography as="h3" variant="heading">
            Print proof
          </Typography>
        </Stack>
        <Badge tone={approved ? 'success' : 'accent'}>
          {approved ? 'Approved' : 'Awaiting approval'}
        </Badge>
      </Stack>
      <Stack direction="row" surface="soft" inset={4}>
        <Typography as="span" variant="label" aria-hidden="true">
          A3
        </Typography>
        <Stack gap={1}>
          <Typography as="span"><strong>Neighbourhood poster</strong></Typography>
          <Typography variant="caption">Revision 03 · 80 copies · 2 colours</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justify="space-between">
        <Typography as="span" variant="caption" role="status">
          {approved ? 'Ready for production' : 'Awaiting review'}
        </Typography>
        <Dialog
          trigger={approved ? 'Reopen review' : 'Review proof'}
          title={approved ? 'Reopen the review' : 'Approve the proof'}
          closeLabel="Close"
          open={open}
          onOpenChange={setOpen}
        >
          <Stack>
            <Typography>
              {approved
                ? 'The proof will return to the review queue.'
                : 'Confirm revision 03 of the poster before starting the print run.'}
            </Typography>
            <DescriptionList
              items={[
                { term: 'Format', detail: 'A3 · 297 × 420 mm' },
                { term: 'Print run', detail: '80 copies' },
              ]}
            />
            <Stack direction="row" gap={2}>
              <Button
                onClick={() => {
                  setApproved(!approved)
                  setOpen(false)
                }}
              >
                {approved ? 'Reopen proof' : 'Approve proof'}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Dialog>
      </Stack>
    </Stack>
  )
}
export function SheetExample() {
  const projects = [
    { title: 'Neighbourhood wayfinding', city: 'Bellinzona', canton: 'TI', status: 'In progress' },
    { title: 'Trail map', city: 'Chur', canton: 'GR', status: 'In progress' },
    { title: 'Civic notebook', city: 'Lausanne', canton: 'VD', status: 'Archived' },
    { title: 'Posters for the square', city: 'Locarno', canton: 'TI', status: 'Archived' },
  ]
  const all = { canton: '', status: '' }
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState(all)
  const [draft, setDraft] = useState(filters)
  const filtered = (selection: typeof all) =>
    projects.filter(
      (project) =>
        (!selection.canton || project.canton === selection.canton) &&
        (!selection.status || project.status === selection.status),
    )
  const visible = filtered(filters)
  const count = filtered(draft).length
  const active = [filters.canton, filters.status].filter(Boolean)
  return (
    <Stack role="region" aria-label="Project register">
      <Stack direction="row" justify="space-between">
        <Stack gap={1}>
          <Typography variant="label">Regional studio</Typography>
          <Typography as="h3" variant="heading">
            Project register
          </Typography>
        </Stack>
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (next) setDraft(filters)
            setOpen(next)
          }}
          trigger={active.length ? 'Filters (' + active.length + ')' : 'Filter'}
          title="Filter projects"
          closeLabel="Close filters"
        >
          <Stack asChild>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                setFilters(draft)
                setOpen(false)
              }}
            >
              <Field label="Canton">
                {(props) => (
                  <Select
                    {...props}
                    value={draft.canton}
                    onChange={(e) => setDraft({ ...draft, canton: e.target.value })}
                  >
                    <option value="">All cantons</option>
                    <option value="TI">Ticino</option>
                    <option value="GR">Graubünden</option>
                    <option value="VD">Vaud</option>
                  </Select>
                )}
              </Field>
              <RadioGroup
                label="Project status"
                options={[
                  { value: '', label: 'All statuses' },
                  { value: 'In progress', label: 'In progress' },
                  { value: 'Archived', label: 'Archived' },
                ]}
                value={draft.status}
                onValueChange={(status) => setDraft({ ...draft, status })}
              />
              <Typography variant="caption" role="status">
                {count} {count === 1 ? 'matching project' : 'matching projects'}
              </Typography>
              <Stack direction="row" gap={2}>
                <Button type="submit">Apply filters</Button>
                <Button type="button" variant="ghost" onClick={() => setDraft(all)}>
                  Reset
                </Button>
              </Stack>
            </form>
          </Stack>
        </Sheet>
      </Stack>
      <Stack direction="row" justify="space-between">
        <Typography as="span" role="status">
          {visible.length} {visible.length === 1 ? 'project' : 'projects'}
          {active.length > 0 && ' · ' + active.join(' · ')}
        </Typography>
        {active.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(all)}>
            Clear filters
          </Button>
        )}
      </Stack>
      <Stack asChild gap={2}>
        <ul>
          {visible.map((project) => (
            <Stack asChild direction="row" justify="space-between" gap={2} key={project.title}>
              <li>
                <Typography as="span">{project.canton}</Typography>
                <Stack gap={1}>
                  <strong>{project.title}</strong>
                  <Typography as="span" variant="caption">
                    {project.city}
                  </Typography>
                </Stack>
                <Badge tone={project.status === 'In progress' ? 'success' : 'neutral'}>
                  {project.status}
                </Badge>
              </li>
            </Stack>
          ))}
        </ul>
      </Stack>
      {!visible.length && <Typography>No projects match the selected filters.</Typography>}
    </Stack>
  )
}
export function DropdownMenuExample() {
  const [name, setName] = useState('Atelier Selva')
  const [draft, setDraft] = useState(name)
  const [editor, setEditor] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [deleted, setDeleted] = useState(false)
  return (
    <>
      <Item
        title={name}
        description={deleted ? 'Contact deleted' : 'Bellinzona · TI'}
        trailing={
          <DropdownMenu
            label="Actions"
            triggerLabel={'Actions for ' + name}
            align="end"
            size="compact"
            items={
              deleted
                ? [{ value: 'restore', label: 'Restore contact', onSelect: () => setDeleted(false) }]
                : [
                    {
                      value: 'edit',
                      label: 'Edit name',
                      onSelect: () => {
                        setDraft(name)
                        setEditor(true)
                      },
                    },
                    {
                      value: 'delete',
                      label: 'Delete contact…',
                      separatorBefore: true,
                      tone: 'danger',
                      onSelect: () => setConfirm(true),
                    },
                  ]
            }
          />
        }
      />
      <Dialog title="Edit contact" closeLabel="Close" open={editor} onOpenChange={setEditor}>
        <Stack asChild>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              if (draft.trim()) {
                setName(draft.trim())
                setEditor(false)
              }
            }}
          >
            <Field label="Contact name">
              {(control) => (
                <Input
                  {...control}
                  required
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              )}
            </Field>
            <Button type="submit" disabled={!draft.trim()}>
              Save name
            </Button>
          </form>
        </Stack>
      </Dialog>
      <AlertDialog
        title="Delete this contact?"
        description={name}
        open={confirm}
        onOpenChange={setConfirm}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onConfirm={() => setDeleted(true)}
      />
    </>
  )
}
export function ToastExample() {
  const [saved, setSaved] = useState<SwissLocale>('it-CH')
  const [locale, setLocale] = useState<SwissLocale>(saved)
  const [open, setOpen] = useState(false)
  return (
    <Stack>
      <Stack direction="row" justify="space-between">
        <Stack gap={1}>
          <Typography variant="label">Project preferences</Typography>
          <Typography as="h3" variant="heading">
            Record language
          </Typography>
        </Stack>
      </Stack>
      <Field label="Document language">
        {(props) => (
          <LocaleSelect
            {...props}
            value={locale}
            onLocaleChange={(next) => {
              setLocale(next)
              setOpen(false)
            }}
          />
        )}
      </Field>
      <Stack direction="row" justify="space-between">
        <Typography as="span" variant="caption">
          Current setting · {saved}
        </Typography>
        <Button
          size="sm"
          onClick={() => {
            setSaved(locale)
            setOpen(true)
          }}
        >
          Save preferences
        </Button>
      </Stack>
      <Toast open={open} onOpenChange={setOpen} tone="success" closeLabel="Dismiss notification">
        Preference saved · {saved}
      </Toast>
    </Stack>
  )
}
export function TooltipExample() {
  return (
    <Stack>
      <Stack gap={1}>
        <Typography variant="label">Neighbourhood poster</Typography>
        <Typography as="h3" variant="heading">
          Sheet specifications
        </Typography>
      </Stack>
      <DescriptionList
        items={[
          { term: 'Trim size', detail: 'A3 · 297 × 420 mm' },
          {
            term: 'Bleed',
            detail: (
              <Stack direction="row" gap={2}>
                3 mm
                <Tooltip content="The printed area beyond the trim edge on each side of the sheet.">
                  <Button size="sm" variant="outline" aria-label="Definition of bleed">
                    ?
                  </Button>
                </Tooltip>
              </Stack>
            ),
          },
          { term: 'Size with bleed', detail: '303 × 426 mm' },
        ]}
      />
    </Stack>
  )
}
