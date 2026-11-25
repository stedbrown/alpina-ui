'use client'
import { useId, useState } from 'react'
import {
  AspectRatio,
  Attachment,
  Field,
  FileInput,
  Stack,
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
    'data:text/plain;charset=utf-8,' + encodeURIComponent('Atelier\nFriday, 14:00\nRoom 3\n')
  return (
    <Stack gap={3}>
      <Attachment filename="Programme.txt" href={file} download="Programme.txt" detail="Text · UTF-8" />
      <Field label="Supplementary material">{control =>
        <Attachment mode="upload" {...control} name="supplements" multiple locale="en" />
      }</Field>
    </Stack>
  )
}

export function FileInputExample() {
  return <Field label="Proofs" description="Attach the PDF or image proofs for this edition.">{control =>
    <FileInput {...control} name="proofs" accept="application/pdf,image/*,.pdf" locale="en" multiple />
  }</Field>
}

export function AvatarExample() {
  return (
    <Item
      title="Nora Keller"
      description="Archivist"
      leading={<Avatar name="Nora Keller" decorative />}
    />
  )
}

export function BubbleExample() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Bubble>Is the print proof ready?</Bubble>
      <Bubble side="end">Yes, you can pick it up at the studio.</Bubble>
    </div>
  )
}

export function ButtonGroupExample() {
  const [view, setView] = useState('List')
  return (
    <ButtonGroup label="Catalog view">
      {['List', 'Plates'].map((option) => (
        <Toggle key={option} pressed={view === option} onPressedChange={() => setView(option)}>
          {option}
        </Toggle>
      ))}
    </ButtonGroup>
  )
}

export function ChartExample() {
  const data = [
    { label: 'January', value: 18 },
    { label: 'February', value: -7 },
    { label: 'March', value: 12 },
    { label: 'April', value: 24 },
  ]
  return (
    <Chart
      title="Change in registrations"
      data={data}
      valueLabel="Registrations"
      formatValue={(value) =>
        new Intl.NumberFormat('it-CH', { signDisplay: 'exceptZero' }).format(value)
      }
    />
  )
}

export function CollapsibleExample() {
  return (
    <Collapsible summary="Borrowing policy">
      Read periodicals on site. You can borrow monographs for 30 days.
    </Collapsible>
  )
}

export function DirectionExample() {
  return (
    <div style={{ display: 'grid', gap: '.75rem' }}>
      <Direction dir="ltr" lang="en">
        Design library
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
      title="No matching publications"
      description="This filter shows only monographs from 1960."
      action={<Button onClick={() => setFiltered(false)}>Clear filter</Button>}
    />
  ) : (
    <Item
      title="Typographie"
      description="Monograph · 1967"
      trailing={
        <Button variant="ghost" onClick={() => setFiltered(true)}>
          Reapply filter
        </Button>
      }
    />
  )
}

export function InputGroupExample() {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>Column width</Label>
      <InputGroup trailing={<span id={id + '-unit'}>mm</span>}>
        <Input id={id} type="number" min={1} defaultValue={56} aria-describedby={id + '-unit'} />
      </InputGroup>
    </div>
  )
}

export function ItemExample() {
  return (
    <Item
      title="Poster archive"
      description="Inventory updated in March"
      trailing={<span>124 works</span>}
    />
  )
}

export function KbdExample() {
  return (
    <p>
      To print on Windows, press <Kbd>Ctrl</Kbd> + <Kbd>P</Kbd>.
    </p>
  )
}

export function LabelExample() {
  const id = useId()
  return (
    <div>
      <Label htmlFor={id}>Publication title</Label>
      <Input id={id} defaultValue="Neue Grafik" />
    </div>
  )
}

export function MarkerExample() {
  return (
    <div style={{ display: 'grid', gap: '.5rem' }}>
      <Marker>In progress</Marker>
      <Marker variant="closed">Archived</Marker>
      <Marker variant="attention">Needs review</Marker>
    </div>
  )
}

export function MessageExample() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Message author="Marta" timestamp="09.12" dateTime="09:12">
        I’ve updated the index.
      </Message>
      <Message author="Nora" timestamp="09.24" dateTime="09:24" side="end">
        Thanks. I’ll prepare the new edition.
      </Message>
    </div>
  )
}

export function ScrollAreaExample() {
  const subjects = [
    'Composition',
    'Contrast',
    'Photography',
    'Grid',
    'Binding',
    'Lithography',
    'Margins',
    'Registration',
    'Printing',
    'Typography',
  ]
  return (
    <ScrollArea label="Subject index" maxHeight="10rem">
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
      <Label htmlFor={id}>Body type size</Label>
      <Slider
        id={id}
        min={12}
        max={48}
        value={size}
        aria-valuetext={size + ' points'}
        onChange={(event) => setSize(event.currentTarget.valueAsNumber)}
      />
      <output htmlFor={id}>{size} pt</output>
    </div>
  )
}

export function ToggleExample() {
  return <Toggle defaultPressed>Show notes</Toggle>
}
