import { useEffect, useState } from 'react'
import {
  cantons,
  CurrencyCHF,
  SwissDate,
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
    <section className="apx apx-currency" aria-label="Preventivo di produzione">
      <div className="apx-money">
        <div className="apx-money-head">
          <span>Preventivo di produzione</span>
          <span>{locale}</span>
        </div>
        <div className="specimen-value" aria-live="polite">
          {valid ? <CurrencyCHF amount={Number(amount)} locale={locale} /> : '—'}
        </div>
        <div className="apx-money-foot">
          <span>Totale preventivo</span>
          <span>CHF</span>
        </div>
      </div>
      <div className="apx-controls apx-pair">
        <Field label="Importo">
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
        <Field label="Lingua del formato">
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
          <p className="apx-kicker">Agenda di produzione</p>
          <h3>Consegna in atelier</h3>
        </div>
      </header>
      <div className="apx-datecard">
        <div className="apx-day" aria-hidden="true">
          {valid ? date.slice(8) : '—'}
        </div>
        <output>
          {valid ? <SwissDate value={date} locale={locale} dateStyle="full" /> : 'Scegli una data'}
        </output>
      </div>
      <div className="apx-pair">
        <Field label="Data civile">
          {(props) => (
            <Input
              {...props}
              type="date"
              min="0001-01-01"
              max="9999-12-31"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </Field>
        <Field label="Lingua del formato">
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
          <p className="apx-kicker">Sportello di quartiere</p>
          <h3>Corrispondenza</h3>
        </div>
      </header>
      <Field label="Lingua di corrispondenza">
        {(props) => <LocaleSelect {...props} value={value} onLocaleChange={setValue} />}
      </Field>
      <div className="apx-tear">
        <small>Saluto di apertura</small>
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
          <p className="apx-kicker">Distribuzione regionale</p>
          <h3>Territorio di consegna</h3>
        </div>
      </header>
      <div className="apx-record">
        <span className="apx-canton">{canton}</span>
        <div>
          <small className="apx-meta">Cantone selezionato</small>
          <output className="apx-large" lang={locale}>
            {name}
          </output>
        </div>
      </div>
      <div className="apx-pair">
        <Field label="Lingua dei nomi">
          {(props) => <LocaleSelect {...props} value={locale} onLocaleChange={setLocale} />}
        </Field>
        <Field label="Cantone">
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
          <p className="apx-kicker">Spedizioni</p>
          <h3>Etichetta del collo</h3>
        </div>
      </header>
      <div className="apx-record">
        <span className="apx-stamp">CH</span>
        <div>
          <small className="apx-meta">Numero postale di destinazione</small>
          <output className="apx-large">{valid ? value : '—'}</output>
        </div>
      </div>
      <Field
        label="Numero postale di avviamento"
        description="Inserisci quattro cifre."
        error={value && !valid ? 'Controlla il formato del numero postale.' : undefined}
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
          <p className="apx-kicker">Banco edizioni</p>
          <h3>Copie del quaderno</h3>
        </div>
      </header>
      <div className="apx-quantity">
        <div>
          <small className="apx-meta">Quantità richiesta</small>
          <output>{copies}</output>
        </div>
        <div className="apx-actions">
          <Button onClick={() => setCopies((n) => n + 1)}>Aggiungi copia</Button>
          <Button variant="outline" disabled={copies < 2} onClick={() => setCopies(1)}>
            Ripristina
          </Button>
        </div>
      </div>
    </section>
  )
}

export function BadgeExample() {
  const projects = [
    { name: 'Carta dei sentieri', city: 'Coira', state: 'Bozza', tone: 'neutral' },
    { name: 'Segnaletica di quartiere', city: 'Bellinzona', state: 'In revisione', tone: 'accent' },
    { name: 'Quaderno civico', city: 'Losanna', state: 'Approvato', tone: 'success' },
  ] as const
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Atelier territoriale</p>
          <h3>Stato delle commesse</h3>
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
        <p className="apx-kicker">Edizioni d’atelier · N. 03</p>
        <CardTitle as="h3">Quaderno civico</CardTitle>
        <CardDescription>Bellinzona · Rilievi e segnaletica urbana</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="apx-readout">
          <div>
            <dt>Formato</dt>
            <dd>A5, 32 pagine</dd>
          </div>
          <div>
            <dt>Tiratura</dt>
            <dd>80 copie numerate</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <span role="status">{reserved ? 'Una copia in lista' : 'Lista di ritiro'}</span>
        <Button
          size="sm"
          variant={reserved ? 'outline' : 'primary'}
          onClick={() => setReserved(!reserved)}
        >
          {reserved ? 'Rimuovi copia' : 'Aggiungi copia'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function InputExample() {
  const [query, setQuery] = useState('')
  const places = ['Bellinzona', 'Coira', 'Losanna', 'Locarno']
  const matches = places.filter((name) =>
    name.toLocaleLowerCase('it').includes(query.trim().toLocaleLowerCase('it')),
  )
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Distribuzione</p>
          <h3>Punti di ritiro</h3>
        </div>
      </header>
      <Field label="Cerca una località">
        {(props) => (
          <Input
            {...props}
            type="search"
            placeholder="Località"
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
          ? matches.length + (matches.length === 1 ? ' sede disponibile' : ' sedi disponibili')
          : 'Nessuna sede corrispondente.'}
      </p>
    </section>
  )
}
export function TextareaExample() {
  const [text, setText] = useState('Consegna al banco ritiro, ingresso nord.')
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Distinta di trasporto</p>
          <h3>Istruzioni al corriere</h3>
        </div>
      </header>
      <div className="apx-track">
        <Field label="Note di consegna" description="Massimo 180 caratteri.">
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
          <p className="apx-kicker">Banco carta</p>
          <h3>Formato finito</h3>
        </div>
      </header>
      <Field label="Formato carta">
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
          <small className="apx-meta">Dimensioni del foglio</small>
          <output className="apx-large">{formats[format]}</output>
        </div>
      </div>
    </section>
  )
}
export function CheckboxExample() {
  const items = ['Bozza stampata', 'Campione di carta', 'Distinta colori']
  const [selected, setSelected] = useState<string[]>(['Bozza stampata'])
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Spedizione campioni</p>
          <h3>Contenuto del plico</h3>
        </div>
      </header>
      <fieldset className="apx-checklist">
        <legend>Allegati da includere</legend>
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
          {selected.length} di {items.length} allegati inclusi
        </output>
      </footer>
    </section>
  )
}
export function RadioGroupExample() {
  const [method, setMethod] = useState('atelier')
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Ordine di stampa</p>
          <h3>Consegna delle copie</h3>
        </div>
      </header>
      <RadioGroup
        label="Modalità di consegna"
        value={method}
        onValueChange={setMethod}
        options={[
          { value: 'atelier', label: 'Ritiro in atelier' },
          { value: 'posta', label: 'Invio per posta' },
        ]}
      />
      <div className="apx-tear">
        <small>{method === 'atelier' ? 'Punto di ritiro' : 'Destinazione'}</small>
        <output>
          {method === 'atelier' ? 'Banco edizioni · Bellinzona' : 'Indirizzo del destinatario'}
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
          <p className="apx-kicker">Archivio progetti</p>
          <h3>Visibilità delle commesse</h3>
        </div>
      </header>
      <label className="apx-toggle-row">
        <span>Includi progetti archiviati</span>
        <Switch checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
      </label>
      <ul className="apx-list">
        <li>
          <strong>Carta dei sentieri</strong>
          <Badge tone="success">In corso</Badge>
        </li>
        {showArchived && (
          <li>
            <strong>Quaderno civico</strong>
            <Badge>Archiviato</Badge>
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
    <form
      className="apx"
      onSubmit={(event) => {
        event.preventDefault()
        setTouched(true)
        if (valid) setSaved(name.trim())
      }}
    >
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Atelier territoriale</p>
          <h3>Nuova commessa</h3>
        </div>
      </header>
      <Field
        label="Nome del progetto"
        description="Almeno tre caratteri."
        error={touched && !valid ? 'Inserisci un nome di almeno tre caratteri.' : undefined}
      >
        {(props) => (
          <Input
            {...props}
            value={name}
            onBlur={() => setTouched(true)}
            placeholder="Es. Segnaletica di quartiere"
            onChange={(e) => {
              setName(e.target.value)
              setSaved('')
            }}
          />
        )}
      </Field>
      <div className="apx-actions">
        <Button type="submit">Crea bozza</Button>
        <output>{saved && 'Bozza creata · ' + saved}</output>
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
          <p className="apx-kicker">Verifica di produzione</p>
          <h3>Controllo della prova</h3>
        </div>
      </header>
      <Alert
        title={checked ? 'Prova verificata' : 'Controllo richiesto'}
        tone={checked ? 'success' : 'warning'}
      >
        {checked
          ? 'Il formato finito è stato confermato.'
          : 'Conferma il formato finito prima della tiratura.'}
      </Alert>
      <label className="apx-inline">
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        Ho verificato il formato A3
      </label>
    </section>
  )
}
export function SeparatorExample() {
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Scheda di lavorazione</p>
          <h3>Quaderno civico</h3>
        </div>
      </header>
      <div>
        <strong>Legatoria</strong>
        <p className="apx-meta">32 pagine · Punto metallico</p>
      </div>
      <Separator />
      <div>
        <strong>Consegna</strong>
        <p className="apx-meta">Banco edizioni · 6500 Bellinzona</p>
      </div>
    </section>
  )
}
export function ProgressExample() {
  const tasks = ['Formato verificato', 'Colori approvati', 'Tiratura confermata']
  const [done, setDone] = useState<string[]>(['Formato verificato'])
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Controllo qualità</p>
          <h3>Preparazione della tiratura</h3>
        </div>
      </header>
      <div className="apx-track">
        <div className="apx-fileline">
          <strong>Verifiche completate</strong>
          <output>
            {done.length} / {tasks.length}
          </output>
        </div>
        <Progress value={done.length} max={tasks.length} label="Verifiche di stampa completate" />
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
    // La durata minima rende osservabile l'attesa anche per questo piccolo esempio locale.
    const timer = window.setTimeout(async () => {
      const rows = [
        ['Progetto', 'Cantone', 'Stato'],
        ['Segnaletica di quartiere', 'TI', 'In corso'],
        ['Carta dei sentieri', 'GR', 'In corso'],
        ['Quaderno civico', 'VD', 'Archiviato'],
        ['Affissioni di piazza', 'TI', 'Archiviato'],
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
    <section className="apx" aria-label="Esportazione del registro">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Archivio progetti</p>
          <h3>Distinta di esportazione</h3>
        </div>
        <span className="apx-filetype">CSV</span>
      </header>
      <div className="apx-transfer">
        <div className="apx-transfer-mark" aria-hidden="true">
          {file ? '↓' : failed ? '!' : <Spinner />}
        </div>
        <div>
          <strong>registro-progetti.csv</strong>
          <p className="apx-meta" role="status">
            {file
              ? 'File pronto · ' + file.bytes + ' byte'
              : failed
                ? 'Creazione del file non riuscita.'
                : 'Preparazione del file…'}
          </p>
        </div>
      </div>
      <footer className="apx-foot">
        <span className="apx-meta">4 progetti · UTF-8</span>
        <div className="apx-actions">
          {file && (
            <a className="apx-download" href={file.url} download="registro-progetti.csv">
              Scarica CSV <span aria-hidden="true">↓</span>
            </a>
          )}
          <Button variant="outline" size="sm" disabled={!file && !failed} onClick={regenerate}>
            {failed ? 'Riprova' : 'Rigenera'}
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
          <p className="apx-kicker">Archivio progetti</p>
          <h3>Ultime schede</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => setReady(false)} disabled={!ready}>
          Ricarica
        </Button>
      </header>
      <ul className="apx-list" aria-busy={!ready}>
        {['Carta dei sentieri', 'Quaderno civico', 'Affissioni di piazza'].map((name, index) => (
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
        {ready ? '3 schede disponibili' : 'Caricamento delle schede…'}
      </p>
    </section>
  )
}
export function TableExample() {
  const entries = [
    { name: 'Quaderno civico', format: 'A5', copies: 80 },
    { name: 'Manifesto di quartiere', format: 'A3', copies: 40 },
    { name: 'Carta dei sentieri', format: 'A4', copies: 120 },
  ]
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Piano di produzione</p>
          <h3>Tirature in atelier</h3>
        </div>
      </header>
      <Table className="apx-table">
        <TableCaption>Quantità per pubblicazione</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Pubblicazione</TableHead>
            <TableHead scope="col">Formato</TableHead>
            <TableHead scope="col">Copie</TableHead>
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
        <span className="apx-meta">Totale in produzione</span>
        <strong>{entries.reduce((sum, entry) => sum + entry.copies, 0)} copie</strong>
      </footer>
    </section>
  )
}
export function BreadcrumbExample() {
  const names = ['Atelier', 'Edizioni', 'Quaderno civico']
  const [level, setLevel] = useState(() => {
    if (typeof window === 'undefined') return 2
    const param = new URLSearchParams(window.location.search).get('sezione')
    return param === '0' || param === '1' ? Number(param) : 2
  })
  return (
    <section className="apx">
      <Breadcrumb
        label="Percorso dell’archivio"
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
        <small>{level === 2 ? 'Pubblicazione' : 'Archivio'}</small>
        <h3 className="apx-large">{names[level]}</h3>
        <p className="apx-meta">
          {
            [
              'Laboratorio di stampa e legatoria.',
              'Pubblicazioni dell’atelier.',
              'A5 · 32 pagine · Bellinzona',
            ][level]
          }
        </p>
      </div>
      {level < 2 && (
        <div className="apx-actions">
          <Button variant="outline" onClick={() => setLevel(level + 1)}>
            Apri {names[level + 1]}
          </Button>
        </div>
      )}
    </section>
  )
}
export function PaginationExample() {
  const entries = [
    ['Carta dei sentieri', 'Coira'],
    ['Quaderno civico', 'Losanna'],
    ['Segnaletica di quartiere', 'Bellinzona'],
    ['Affissioni di piazza', 'Locarno'],
    ['Indice degli atelier', 'Berna'],
    ['Taccuino di riva', 'Lugano'],
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
          <p className="apx-kicker">Edizioni</p>
          <h3>Indice dei progetti</h3>
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
        <output className="apx-meta">Pagina {page} di 3</output>
        <Pagination
          label="Pagine dei progetti"
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
            accessibleLabel: 'Pagina ' + n,
          }))}
        />
      </footer>
    </section>
  )
}
export function TabsExample() {
  const sections = [
    {
      value: 'supporto',
      label: 'Supporto',
      rows: [
        ['Carta', 'Naturale avorio'],
        ['Grammatura', '140 g/m²'],
      ],
    },
    {
      value: 'stampa',
      label: 'Stampa',
      rows: [
        ['Tecnica', 'Offset'],
        ['Passaggi', 'Due colori'],
      ],
    },
    {
      value: 'confezione',
      label: 'Confezione',
      rows: [
        ['Legatura', 'Punto metallico'],
        ['Foliazione', '32 pagine'],
      ],
    },
  ]
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Quaderno civico</p>
          <h3>Specifiche di produzione</h3>
        </div>
      </header>
      <Tabs
        label="Specifiche di produzione"
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
          <p className="apx-kicker">Banco edizioni · Bellinzona</p>
          <h3>Ritiro in atelier</h3>
        </div>
      </header>
      <Accordion
        headingLevel={4}
        defaultValue="dove"
        items={[
          {
            value: 'dove',
            title: 'Dove ritiro le copie?',
            content: 'Al banco edizioni, dall’ingresso del cortile.',
          },
          {
            value: 'cosa',
            title: 'Cosa devo portare?',
            content: 'La conferma di ritiro con il nome della commessa e il numero di copie.',
          },
          {
            value: 'delega',
            title: 'Posso delegare il ritiro?',
            content: 'Sì. Indica alla persona incaricata il nome della commessa.',
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
          <p className="apx-kicker">Bellinzona · Serie A3</p>
          <h3>Prova di stampa</h3>
        </div>
        <Badge tone={approved ? 'success' : 'accent'}>{approved ? 'Approvata' : 'Da approvare'}</Badge>
      </header>
      <div className="apx-record">
        <span className="apx-format" aria-hidden="true">
          A3
        </span>
        <div>
          <strong>Manifesto di quartiere</strong>
          <p className="apx-meta">Revisione 03 · 80 copie · 2 colori</p>
        </div>
      </div>
      <footer className="apx-foot">
        <span className="apx-meta" role="status">
          {approved ? 'Pronta per la produzione' : 'In attesa di verifica'}
        </span>
        <Dialog
          trigger={approved ? 'Riapri revisione' : 'Verifica prova'}
          title={approved ? 'Riapri la revisione' : 'Approva la prova'}
          closeLabel="Chiudi"
          open={open}
          onOpenChange={setOpen}
        >
          <div className="apx">
            <p className="apx-body">
              {approved
                ? 'La prova tornerà tra quelle da verificare.'
                : 'Conferma la revisione 03 del manifesto prima di avviare la tiratura.'}
            </p>
            <dl className="apx-readout">
              <div>
                <dt>Formato</dt>
                <dd>A3 · 297 × 420 mm</dd>
              </div>
              <div>
                <dt>Tiratura</dt>
                <dd>80 copie</dd>
              </div>
            </dl>
            <div className="apx-actions">
              <Button
                onClick={() => {
                  setApproved(!approved)
                  setOpen(false)
                }}
              >
                {approved ? 'Riapri prova' : 'Approva prova'}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Annulla
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
    { title: 'Segnaletica di quartiere', city: 'Bellinzona', canton: 'TI', status: 'In corso' },
    { title: 'Carta dei sentieri', city: 'Coira', canton: 'GR', status: 'In corso' },
    { title: 'Quaderno civico', city: 'Losanna', canton: 'VD', status: 'Archiviato' },
    { title: 'Affissioni di piazza', city: 'Locarno', canton: 'TI', status: 'Archiviato' },
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
    <section className="apx" aria-label="Registro dei progetti">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Atelier territoriale</p>
          <h3>Registro dei progetti</h3>
        </div>
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (next) setDraft(filters)
            setOpen(next)
          }}
          trigger={active.length ? 'Filtri (' + active.length + ')' : 'Filtra'}
          title="Filtra progetti"
          closeLabel="Chiudi filtri"
        >
          <form
            className="apx apx-filter"
            onSubmit={(event) => {
              event.preventDefault()
              setFilters(draft)
              setOpen(false)
            }}
          >
            <Field label="Cantone">
              {(props) => (
                <Select
                  {...props}
                  value={draft.canton}
                  onChange={(e) => setDraft({ ...draft, canton: e.target.value })}
                >
                  <option value="">Tutti i cantoni</option>
                  <option value="TI">Ticino</option>
                  <option value="GR">Grigioni</option>
                  <option value="VD">Vaud</option>
                </Select>
              )}
            </Field>
            <RadioGroup
              label="Stato del progetto"
              options={[
                { value: '', label: 'Tutti gli stati' },
                { value: 'In corso', label: 'In corso' },
                { value: 'Archiviato', label: 'Archiviato' },
              ]}
              value={draft.status}
              onValueChange={(status) => setDraft({ ...draft, status })}
            />
            <p className="apx-meta" role="status">
              {count} {count === 1 ? 'progetto corrispondente' : 'progetti corrispondenti'}
            </p>
            <div className="apx-actions">
              <Button type="submit">Applica filtri</Button>
              <Button type="button" variant="ghost" onClick={() => setDraft(all)}>
                Azzera
              </Button>
            </div>
          </form>
        </Sheet>
      </header>
      <div className="apx-filterbar">
        <span role="status">
          {visible.length} {visible.length === 1 ? 'progetto' : 'progetti'}
          {active.length > 0 && ' · ' + active.join(' · ')}
        </span>
        {active.length > 0 && (
          <button className="apx-link" onClick={() => setFilters(all)}>
            Rimuovi filtri
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
            <Badge tone={project.status === 'In corso' ? 'success' : 'neutral'}>{project.status}</Badge>
          </li>
        ))}
      </ul>
      {!visible.length && <p className="apx-empty">Nessun progetto corrisponde ai filtri scelti.</p>}
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
        description={deleted ? 'Contatto eliminato' : 'Bellinzona · TI'}
        trailing={
          <DropdownMenu
            label="Azioni"
            triggerLabel={'Azioni per ' + name}
            align="end"
            size="compact"
            items={
              deleted
                ? [{ value: 'restore', label: 'Ripristina contatto', onSelect: () => setDeleted(false) }]
                : [
                    {
                      value: 'edit',
                      label: 'Modifica nome',
                      onSelect: () => {
                        setDraft(name)
                        setEditor(true)
                      },
                    },
                    {
                      value: 'delete',
                      label: 'Elimina contatto…',
                      separatorBefore: true,
                      tone: 'danger',
                      onSelect: () => setConfirm(true),
                    },
                  ]
            }
          />
        }
      />
      <Dialog title="Modifica contatto" closeLabel="Chiudi" open={editor} onOpenChange={setEditor}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (draft.trim()) {
              setName(draft.trim())
              setEditor(false)
            }
          }}
        >
          <Field label="Nome del contatto">
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
            Salva nome
          </Button>
        </form>
      </Dialog>
      <AlertDialog
        title="Eliminare il contatto?"
        description={name}
        open={confirm}
        onOpenChange={setConfirm}
        cancelLabel="Annulla"
        confirmLabel="Elimina"
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
          <p className="apx-kicker">Preferenze di progetto</p>
          <h3>Lingua delle schede</h3>
        </div>
      </header>
      <Field label="Lingua dei documenti">
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
        <span className="apx-meta">Impostazione attiva · {saved}</span>
        <Button
          size="sm"
          onClick={() => {
            setSaved(locale)
            setOpen(true)
          }}
        >
          Salva preferenze
        </Button>
      </footer>
      <Toast open={open} onOpenChange={setOpen} tone="success" closeLabel="Chiudi notifica">
        Preferenza salvata · {saved}
      </Toast>
    </section>
  )
}
export function TooltipExample() {
  return (
    <section className="apx">
      <header className="apx-head">
        <div>
          <p className="apx-kicker">Manifesto di quartiere</p>
          <h3>Specifiche del foglio</h3>
        </div>
      </header>
      <dl className="apx-readout">
        <div>
          <dt>Formato finito</dt>
          <dd>A3 · 297 × 420 mm</dd>
        </div>
        <div>
          <dt className="apx-inline">
            Abbondanza{' '}
            <Tooltip content="Margine stampato oltre il bordo di taglio, su ciascun lato.">
              <button className="apx-info" type="button" aria-label="Definizione di abbondanza">
                ?
              </button>
            </Tooltip>
          </dt>
          <dd>3 mm</dd>
        </div>
        <div>
          <dt>Formato con abbondanza</dt>
          <dd>303 × 426 mm</dd>
        </div>
      </dl>
    </section>
  )
}