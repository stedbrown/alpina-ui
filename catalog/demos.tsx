import { useEffect, useState } from 'react'
import {
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
    <section className="apx apx-currency" aria-label="Production estimate">
      <div className="apx-money">
        <div className="apx-money-head">
          <span>Production estimate</span>
          <span>{locale}</span>
        </div>
        <div className="specimen-value" aria-live="polite">
          {valid ? <CurrencyCHF amount={Number(amount)} locale={locale} /> : '—'}
        </div>
        <div className="apx-money-foot">
          <span>Estimated total</span>
          <span>CHF</span>
        </div>
      </div>
      <div className="apx-controls apx-pair">
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
      </div>
    </section>
  )
}

export function SwissDateExample() {
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [date, setDate] = useState('2026-11-24')
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= '0001-01-01'
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Production schedule</p>
          <h3>Studio delivery</h3>
        </div>
      </header>
      <div className="apx-datecard">
        <div className="apx-day" aria-hidden="true">
          {valid ? date.slice(8) : '—'}
        </div>
        <output>
          {valid ? <SwissDate value={date} locale={locale} dateStyle="full" /> : 'Choose a date'}
        </output>
      </div>
      <div className="apx-pair">
        <div className="al-field">
          <span className="al-field-label">Calendar date</span>
          <DatePicker locale={locale} label="Calendar date" value={date} onValueChange={setDate} clearable />
        </div>
        <Field label="Formatting language">
          {(props) => <LocaleSelect {...props} value={locale} onLocaleChange={setLocale} />}
        </Field>
      </div>
    </section>
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
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Neighbourhood office</p>
          <h3>Correspondence</h3>
        </div>
      </header>
      <Field label="Correspondence language">
        {(props) => <LocaleSelect {...props} value={value} onLocaleChange={setValue} />}
      </Field>
      <div className="apx-tear">
        <small>Salutation</small>
        <output className="apx-greeting" lang={value}>
          {greetings[value]}
        </output>
        <span className="apx-code">{value}</span>
      </div>
    </section>
  )
}

export function CantonSelectExample() {
  const [locale, setLocale] = useState<SwissLocale>('it-CH')
  const [canton, setCanton] = useState<CantonCode>('TI')
  const name = cantons.find((entry) => entry.code === canton)?.names[locale]
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Regional distribution</p>
          <h3>Delivery area</h3>
        </div>
      </header>
      <div className="apx-record">
        <span className="apx-canton">{canton}</span>
        <div>
          <small className="apx-meta">Selected canton</small>
          <output className="apx-large" lang={locale}>
            {name}
          </output>
        </div>
      </div>
      <div className="apx-pair">
        <Field label="Canton name language">
          {(props) => <LocaleSelect {...props} value={locale} onLocaleChange={setLocale} />}
        </Field>
        <Field label="Canton">
          {(props) => (
            <CantonSelect {...props} value={canton} locale={locale} onCantonChange={setCanton} />
          )}
        </Field>
      </div>
    </section>
  )
}

export function SwissPostalCodeInputExample() {
  const [value, setValue] = useState('6900')
  const valid = isSwissPostalCode(value)
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Shipping</p>
          <h3>Parcel label</h3>
        </div>
      </header>
      <div className="apx-record">
        <span className="apx-stamp">CH</span>
        <div>
          <small className="apx-meta">Destination postcode</small>
          <output className="apx-large">{valid ? value : '—'}</output>
        </div>
      </div>
      <Field
        label="Postal code"
        description="Enter four digits."
        error={value && !valid ? 'Check the postal code format.' : undefined}
      >
        {(props) => (
          <SwissPostalCodeInput {...props} value={value} onChange={(e) => setValue(e.target.value)} />
        )}
      </Field>
    </section>
  )
}

export function ButtonExample() {
  const [copies, setCopies] = useState(1)
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Publications desk</p>
          <h3>Notebook copies</h3>
        </div>
      </header>
      <div className="apx-quantity">
        <div>
          <small className="apx-meta">Requested quantity</small>
          <output>{copies}</output>
        </div>
        <div className="apx-actions">
          <Button onClick={() => setCopies((n) => n + 1)}>Add a copy</Button>
          <Button variant="outline" disabled={copies < 2} onClick={() => setCopies(1)}>
            Reset
          </Button>
        </div>
      </div>
    </section>
  )
}

export function BadgeExample() {
  const projects = [
    { name: 'Trail map', city: 'Chur', state: 'Draft', tone: 'neutral' },
    { name: 'Neighbourhood wayfinding', city: 'Bellinzona', state: 'In review', tone: 'accent' },
    { name: 'Civic notebook', city: 'Lausanne', state: 'Approved', tone: 'success' },
  ] as const
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Regional studio</p>
          <h3>Job status</h3>
        </div>
      </header>
      <ul className="apx-list">
        {projects.map((project) => (
          <li key={project.name}>
            <div>
              <strong>{project.name}</strong>
              <small>{project.city}</small>
            </div>
            <Badge tone={project.tone}>{project.state}</Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CardExample() {
  const [reserved, setReserved] = useState(false)
  return (
    <Card className="apx apx-edition">
      <CardHeader>
        <p className="apx-kicker">Studio editions · No. 03</p>
        <CardTitle as="h3">Civic notebook</CardTitle>
        <CardDescription>Bellinzona · Surveys and urban signage</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="apx-readout">
          <div>
            <dt>Format</dt>
            <dd>A5, 32 pages</dd>
          </div>
          <div>
            <dt>Print run</dt>
            <dd>80 numbered copies</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <span role="status">{reserved ? 'One copy reserved' : 'Collection list'}</span>
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
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Distribution</p>
          <h3>Collection points</h3>
        </div>
      </header>
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
      <ul className="apx-list">
        {matches.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p className="apx-meta" role="status">
        {matches.length
          ? matches.length + (matches.length === 1 ? ' location available' : ' locations available')
          : 'No matching locations.'}
      </p>
    </section>
  )
}
export function TextareaExample() {
  const [text, setText] = useState('Deliver to the collection desk at the north entrance.')
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Delivery note</p>
          <h3>Courier instructions</h3>
        </div>
      </header>
      <div className="apx-track">
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
        <span className="apx-counter">{text.length} / 180</span>
      </div>
    </section>
  )
}
export function SelectExample() {
  const formats = { A5: '148 × 210 mm', A4: '210 × 297 mm', A3: '297 × 420 mm' }
  const [format, setFormat] = useState<keyof typeof formats>('A4')
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Paper desk</p>
          <h3>Trim size</h3>
        </div>
      </header>
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
      <div className="apx-record">
        <span className="apx-format" aria-hidden="true">
          {format}
        </span>
        <div>
          <small className="apx-meta">Sheet dimensions</small>
          <output className="apx-large">{formats[format]}</output>
        </div>
      </div>
    </section>
  )
}
export function CheckboxExample() {
  const items = ['Printed draft', 'Paper sample', 'Colour specification']
  const [selected, setSelected] = useState<string[]>(['Printed draft'])
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Sample shipment</p>
          <h3>Package contents</h3>
        </div>
      </header>
      <fieldset className="apx-checklist">
        <legend>Enclosures</legend>
        {items.map((item) => (
          <label key={item} className="apx-inline">
            <Checkbox
              checked={selected.includes(item)}
              onChange={(e) =>
                setSelected(
                  e.target.checked ? [...selected, item] : selected.filter((value) => value !== item),
                )
              }
            />
            {item}
          </label>
        ))}
      </fieldset>
      <footer className="apx-foot">
        <output>
          {selected.length} of {items.length} enclosures included
        </output>
      </footer>
    </section>
  )
}
export function RadioGroupExample() {
  const [method, setMethod] = useState('studio')
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Print order</p>
          <h3>Delivery of copies</h3>
        </div>
      </header>
      <RadioGroup
        label="Delivery method"
        value={method}
        onValueChange={setMethod}
        options={[
          { value: 'studio', label: 'Studio collection' },
          { value: 'post', label: 'Send by post' },
        ]}
      />
      <div className="apx-tear">
        <small>{method === 'studio' ? 'Collection point' : 'Destination'}</small>
        <output>
          {method === 'studio' ? 'Publications desk · Bellinzona' : 'Recipient’s address'}
        </output>
      </div>
    </section>
  )
}
export function SwitchExample() {
  const [showArchived, setShowArchived] = useState(false)
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Project archive</p>
          <h3>Job visibility</h3>
        </div>
      </header>
      <label className="apx-toggle-row">
        <span>Include archived projects</span>
        <Switch checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
      </label>
      <ul className="apx-list">
        <li>
          <strong>Trail map</strong>
          <Badge tone="success">In progress</Badge>
        </li>
        {showArchived && (
          <li>
            <strong>Civic notebook</strong>
            <Badge>Archived</Badge>
          </li>
        )}
      </ul>
    </section>
  )
}
export function FieldExample() {
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const [saved, setSaved] = useState('')
  const valid = name.trim().length >= 3
  return (
    <form noValidate
      className="apx"
      onSubmit={(event) => {
        event.preventDefault()
        setTouched(true)
        if (valid) setSaved(name.trim())
      }}
    >
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Regional studio</p>
          <h3>New print job</h3>
        </div>
      </header>
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
      <div className="apx-actions">
        <Button type="submit">Create draft</Button>
        <output>{saved && 'Draft created · ' + saved}</output>
      </div>
    </form>
  )
}
export function AlertExample() {
  const [checked, setChecked] = useState(false)
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Production check</p>
          <h3>Proof review</h3>
        </div>
      </header>
      <Alert
        title={checked ? 'Proof checked' : 'Review required'}
        tone={checked ? 'success' : 'warning'}
      >
        {checked
          ? 'The trim size has been confirmed.'
          : 'Confirm the trim size before printing.'}
      </Alert>
      <label className="apx-inline">
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        I checked the A3 format
      </label>
    </section>
  )
}
export function SeparatorExample() {
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Job sheet</p>
          <h3>Civic notebook</h3>
        </div>
      </header>
      <div>
        <strong>Bookbinding</strong>
        <p className="apx-meta">32 pages · Saddle stitch</p>
      </div>
      <Separator />
      <div>
        <strong>Delivery</strong>
        <p className="apx-meta">Publications desk · 6500 Bellinzona</p>
      </div>
    </section>
  )
}
export function ProgressExample() {
  const tasks = ['Trim size checked', 'Colours approved', 'Print run confirmed']
  const [done, setDone] = useState<string[]>(['Trim size checked'])
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Quality control</p>
          <h3>Print run setup</h3>
        </div>
      </header>
      <div className="apx-track">
        <div className="apx-fileline">
          <strong>Checks complete</strong>
          <output>
            {done.length} / {tasks.length}
          </output>
        </div>
        <Progress value={done.length} max={tasks.length} label="Print checks complete" />
      </div>
      <div className="apx-checklist">
        {tasks.map((task) => (
          <label key={task} className="apx-inline">
            <Checkbox
              checked={done.includes(task)}
              onChange={(e) =>
                setDone(e.target.checked ? [...done, task] : done.filter((entry) => entry !== task))
              }
            />
            {task}
          </label>
        ))}
      </div>
    </section>
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
    <section className="apx" aria-label="Register export">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Project archive</p>
          <h3>Export file</h3>
        </div>
        <span className="apx-filetype">CSV</span>
      </header>
      <div className="apx-transfer">
        <div className="apx-transfer-mark" aria-hidden="true">
          {file ? '↓' : failed ? '!' : <Spinner />}
        </div>
        <div>
          <strong>project-register.csv</strong>
          <p className="apx-meta" role="status">
            {file
              ? 'File ready · ' + file.bytes + ' bytes'
              : failed
                ? 'Could not create the file.'
                : 'Preparing file…'}
          </p>
        </div>
      </div>
      <footer className="apx-foot">
        <span className="apx-meta">4 projects · UTF-8</span>
        <div className="apx-actions">
          {file && (
            <a className="apx-download" href={file.url} download="project-register.csv">
              Download CSV <span aria-hidden="true">↓</span>
            </a>
          )}
          <Button variant="outline" size="sm" disabled={!file && !failed} onClick={regenerate}>
            {failed ? 'Retry' : 'Regenerate'}
          </Button>
        </div>
      </footer>
    </section>
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
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Project archive</p>
          <h3>Latest records</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => setReady(false)} disabled={!ready}>
          Reload
        </Button>
      </header>
      <ul className="apx-list" aria-busy={!ready}>
        {['Trail map', 'Civic notebook', 'Posters for the square'].map((name, index) => (
          <li key={name}>
            {ready ? (
              <strong>{name}</strong>
            ) : (
              <Skeleton style={{ height: '1.25rem', width: 56 - index * 7 + '%' }} />
            )}
            {ready ? (
              <span className="apx-meta">{['GR', 'VD', 'TI'][index]}</span>
            ) : (
              <Skeleton style={{ height: '1rem', width: '2rem' }} />
            )}
          </li>
        ))}
      </ul>
      <p className="apx-meta" role="status">
        {ready ? '3 records available' : 'Loading records…'}
      </p>
    </section>
  )
}
export function TableExample() {
  const entries = [
    { name: 'Civic notebook', format: 'A5', copies: 80 },
    { name: 'Neighbourhood poster', format: 'A3', copies: 40 },
    { name: 'Trail map', format: 'A4', copies: 120 },
  ]
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Production plan</p>
          <h3>Studio print runs</h3>
        </div>
      </header>
      <Table className="apx-table">
        <TableCaption>Quantities by publication</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Publication</TableHead>
            <TableHead scope="col">Format</TableHead>
            <TableHead scope="col">Copies</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.name}>
              <TableHead scope="row">{entry.name}</TableHead>
              <TableCell>{entry.format}</TableCell>
              <TableCell>{entry.copies}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <footer className="apx-foot">
        <span className="apx-meta">Total in production</span>
        <strong>{entries.reduce((sum, entry) => sum + entry.copies, 0)} copies</strong>
      </footer>
    </section>
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
    <section className="apx">
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
      <div className="apx-tear">
        <small>{level === 2 ? 'Publication' : 'Archive'}</small>
        <h3 className="apx-large">{names[level]}</h3>
        <p className="apx-meta">
          {
            [
              'Printing and bookbinding workshop.',
              'Studio publications.',
              'A5 · 32 pages · Bellinzona',
            ][level]
          }
        </p>
      </div>
      {level < 2 && (
        <div className="apx-actions">
          <Button variant="outline" onClick={() => setLevel(level + 1)}>
            Open {names[level + 1]}
          </Button>
        </div>
      )}
    </section>
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
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Editions</p>
          <h3>Project index</h3>
        </div>
      </header>
      <ul className="apx-list">
        {entries.slice((page - 1) * 2, page * 2).map(([name, city]) => (
          <li key={name}>
            <strong>{name}</strong>
            <small>{city}</small>
          </li>
        ))}
      </ul>
      <footer className="apx-foot">
        <output className="apx-meta">Page {page} of 3</output>
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
      </footer>
    </section>
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
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Civic notebook</p>
          <h3>Production specifications</h3>
        </div>
      </header>
      <Tabs
        label="Production specifications"
        items={sections.map((section) => ({
          value: section.value,
          label: section.label,
          content: (
            <dl className="apx-readout">
              {section.rows.map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ),
        }))}
      />
    </section>
  )
}
export function AccordionExample() {
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Publications desk · Bellinzona</p>
          <h3>Studio collection</h3>
        </div>
      </header>
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
    </section>
  )
}
export function DialogExample() {
  const [open, setOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Bellinzona · A3 series</p>
          <h3>Print proof</h3>
        </div>
        <Badge tone={approved ? 'success' : 'accent'}>{approved ? 'Approved' : 'Awaiting approval'}</Badge>
      </header>
      <div className="apx-record">
        <span className="apx-format" aria-hidden="true">
          A3
        </span>
        <div>
          <strong>Neighbourhood poster</strong>
          <p className="apx-meta">Revision 03 · 80 copies · 2 colours</p>
        </div>
      </div>
      <footer className="apx-foot">
        <span className="apx-meta" role="status">
          {approved ? 'Ready for production' : 'Awaiting review'}
        </span>
        <Dialog
          trigger={approved ? 'Reopen review' : 'Review proof'}
          title={approved ? 'Reopen the review' : 'Approve the proof'}
          closeLabel="Close"
          open={open}
          onOpenChange={setOpen}
        >
          <div className="apx">
            <p className="apx-body">
              {approved
                ? 'The proof will return to the review queue.'
                : 'Confirm revision 03 of the poster before starting the print run.'}
            </p>
            <dl className="apx-readout">
              <div>
                <dt>Format</dt>
                <dd>A3 · 297 × 420 mm</dd>
              </div>
              <div>
                <dt>Print run</dt>
                <dd>80 copies</dd>
              </div>
            </dl>
            <div className="apx-actions">
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
            </div>
          </div>
        </Dialog>
      </footer>
    </section>
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
    <section className="apx" aria-label="Project register">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Regional studio</p>
          <h3>Project register</h3>
        </div>
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
          <form noValidate
            className="apx apx-filter"
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
            <p className="apx-meta" role="status">
              {count} {count === 1 ? 'matching project' : 'matching projects'}
            </p>
            <div className="apx-actions">
              <Button type="submit">Apply filters</Button>
              <Button type="button" variant="ghost" onClick={() => setDraft(all)}>
                Reset
              </Button>
            </div>
          </form>
        </Sheet>
      </header>
      <div className="apx-filterbar">
        <span role="status">
          {visible.length} {visible.length === 1 ? 'project' : 'projects'}
          {active.length > 0 && ' · ' + active.join(' · ')}
        </span>
        {active.length > 0 && (
          <button className="apx-link" onClick={() => setFilters(all)}>
            Clear filters
          </button>
        )}
      </div>
      <ul className="apx-register">
        {visible.map((project) => (
          <li key={project.title}>
            <span className="apx-region">{project.canton}</span>
            <div>
              <strong>{project.title}</strong>
              <small>{project.city}</small>
            </div>
            <Badge tone={project.status === 'In progress' ? 'success' : 'neutral'}>{project.status}</Badge>
          </li>
        ))}
      </ul>
      {!visible.length && <p className="apx-empty">No projects match the selected filters.</p>}
    </section>
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
        <form noValidate
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
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Project preferences</p>
          <h3>Record language</h3>
        </div>
      </header>
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
      <footer className="apx-foot">
        <span className="apx-meta">Current setting · {saved}</span>
        <Button
          size="sm"
          onClick={() => {
            setSaved(locale)
            setOpen(true)
          }}
        >
          Save preferences
        </Button>
      </footer>
      <Toast open={open} onOpenChange={setOpen} tone="success" closeLabel="Dismiss notification">
        Preference saved · {saved}
      </Toast>
    </section>
  )
}
export function TooltipExample() {
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Neighbourhood poster</p>
          <h3>Sheet specifications</h3>
        </div>
      </header>
      <dl className="apx-readout">
        <div>
          <dt>Trim size</dt>
          <dd>A3 · 297 × 420 mm</dd>
        </div>
        <div>
          <dt className="apx-inline">
            Bleed{' '}
            <Tooltip content="The printed area beyond the trim edge on each side of the sheet.">
              <button className="apx-info" type="button" aria-label="Definition of bleed">
                ?
              </button>
            </Tooltip>
          </dt>
          <dd>3 mm</dd>
        </div>
        <div>
          <dt>Size with bleed</dt>
          <dd>303 × 426 mm</dd>
        </div>
      </dl>
    </section>
  )
}
