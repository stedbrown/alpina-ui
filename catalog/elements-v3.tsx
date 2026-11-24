'use client'
import { useId, useState } from 'react'
import {
  AspectRatio,
  Attachment,
  Avatar,
  Bubble,
  ButtonGroup,
  Chart,
  Collapsible,
  Direction,
  Empty,
  InputGroup,
  Item,
  Kbd,
  Label,
  Marker,
  Message,
  ScrollArea,
  Slider,
  Toggle,
  Button,
  Input,
  Typography,
} from 'alpina-ui'

export function AspectRatioExample() {
  return (
    <AspectRatio
      ratio={3 / 2}
      style={{
        maxWidth: '26rem',
        background: 'var(--al-soft)',
        display: 'grid',
        alignItems: 'end',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="display">3 ∶ 2</Typography>
    </AspectRatio>
  )
}

export function AttachmentExample() {
  const file =
    'data:text/plain;charset=utf-8,' + encodeURIComponent('Atelier\nVenerdì, ore 14.00\nSala 3\n')
  return (
    <Attachment filename="Programma.txt" href={file} download="Programma.txt" detail="Testo · UTF-8" />
  )
}

export function AvatarExample() {
  return (
    <Item
      title="Nora Keller"
      description="Responsabile archivio"
      leading={<Avatar name="Nora Keller" decorative />}
    />
  )
}

export function BubbleExample() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Bubble>La prova di stampa è pronta?</Bubble>
      <Bubble side="end">Sì, puoi ritirarla in atelier.</Bubble>
    </div>
  )
}

export function ButtonGroupExample() {
  const [view, setView] = useState('Elenco')
  return (
    <ButtonGroup label="Vista del catalogo">
      {['Elenco', 'Tavole'].map((option) => (
        <Toggle key={option} pressed={view === option} onPressedChange={() => setView(option)}>
          {option}
        </Toggle>
      ))}
    </ButtonGroup>
  )
}

export function ChartExample() {
  const data = [
    { label: 'Gennaio', value: 18 },
    { label: 'Febbraio', value: -7 },
    { label: 'Marzo', value: 12 },
    { label: 'Aprile', value: 24 },
  ]
  return (
    <Chart
      title="Variazione delle iscrizioni"
      data={data}
      valueLabel="Iscrizioni"
      formatValue={(value) =>
        new Intl.NumberFormat('it-CH', { signDisplay: 'exceptZero' }).format(value)
      }
    />
  )
}

export function CollapsibleExample() {
  return (
    <Collapsible summary="Condizioni di prestito">
      I periodici si consultano in sede. Le monografie si possono prendere in prestito per 30 giorni.
    </Collapsible>
  )
}

export function DirectionExample() {
  return (
    <div style={{ display: 'grid', gap: '.75rem' }}>
      <Direction dir="ltr" lang="it">
        Biblioteca di progetto
      </Direction>
      <Direction dir="rtl" lang="ar">
        مكتبة التصميم
      </Direction>
    </div>
  )
}

export function EmptyExample() {
  const [filtered, setFiltered] = useState(true)
  return filtered ? (
    <Empty
      title="Nessuna pubblicazione trovata"
      description="Il filtro selezionato cerca soltanto le monografie del 1960."
      action={<Button onClick={() => setFiltered(false)}>Rimuovi filtro</Button>}
    />
  ) : (
    <Item
      title="Typographie"
      description="Monografia · 1967"
      trailing={
        <Button variant="ghost" onClick={() => setFiltered(true)}>
          Riapplica filtro
        </Button>
      }
    />
  )
}

export function InputGroupExample() {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>Larghezza della colonna</Label>
      <InputGroup trailing={<span id={id + '-unit'}>mm</span>}>
        <Input id={id} type="number" min={1} defaultValue={56} aria-describedby={id + '-unit'} />
      </InputGroup>
    </div>
  )
}

export function ItemExample() {
  return (
    <Item
      title="Archivio dei manifesti"
      description="Inventario aggiornato a marzo"
      trailing={<span>124 opere</span>}
    />
  )
}

export function KbdExample() {
  return (
    <p>
      Per stampare su Windows premi <Kbd>Ctrl</Kbd> + <Kbd>P</Kbd>.
    </p>
  )
}

export function LabelExample() {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>Titolo della pubblicazione</Label>
      <Input id={id} defaultValue="Neue Grafik" />
    </div>
  )
}

export function MarkerExample() {
  return (
    <div style={{ display: 'grid', gap: '.5rem' }}>
      <Marker>In lavorazione</Marker>
      <Marker variant="closed">Archiviato</Marker>
      <Marker variant="attention">Da verificare</Marker>
    </div>
  )
}

export function MessageExample() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Message author="Marta" timestamp="09.12" dateTime="09:12">
        Ho aggiornato l’indice.
      </Message>
      <Message author="Nora" timestamp="09.24" dateTime="09:24" side="end">
        Ricevuto, preparo la nuova edizione.
      </Message>
    </div>
  )
}

export function ScrollAreaExample() {
  const subjects = [
    'Composizione',
    'Contrasto',
    'Fotografia',
    'Griglia',
    'Legatura',
    'Litografia',
    'Margini',
    'Registro',
    'Stampa',
    'Tipografia',
  ]
  return (
    <ScrollArea label="Indice delle materie" maxHeight="10rem">
      {subjects.map((subject) => (
        <Item title={subject} key={subject} />
      ))}
    </ScrollArea>
  )
}

export function SliderExample() {
  const id = useId()
  const [size, setSize] = useState(16)
  return (
    <div>
      <Label htmlFor={id}>Corpo del testo</Label>
      <Slider
        id={id}
        min={12}
        max={48}
        value={size}
        aria-valuetext={size + ' punti'}
        onChange={(event) => setSize(event.currentTarget.valueAsNumber)}
      />
      <output htmlFor={id}>{size} pt</output>
    </div>
  )
}

export function ToggleExample() {
  return <Toggle defaultPressed>Mostra le note</Toggle>
}
