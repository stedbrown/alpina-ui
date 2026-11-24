import { useState } from 'react'
import {
  AlertDialog,
  Button,
  Carousel,
  Combobox,
  Command,
  ContextMenu,
  Drawer,
  Field,
  HoverCard,
  Input,
  Menubar,
  Popover,
  Resizable,
  Typography,
} from 'alpina-ui'

export function AlertDialogExample() {
  const [archived, setArchived] = useState(false)
  return (
    <div>
      {archived ? (
        <Button variant="outline" onClick={() => setArchived(false)}>
          Restore draft
        </Button>
      ) : (
        <AlertDialog
          title="Archive this draft?"
          description="The poster will move from the print queue to the archive."
          trigger="Archive draft"
          cancelLabel="Keep in queue"
          confirmLabel="Archive"
          onConfirm={() => setArchived(true)}
        />
      )}
      <p role="status">{archived ? 'Draft archived.' : 'Draft in print queue.'}</p>
    </div>
  )
}
export function CarouselExample() {
  const studies = [
    { value: 'paper', label: 'Paper', word: 'Stock', detail: 'Uncoated paper · 120 g/m²' },
    {
      value: 'ink',
      label: 'Ink',
      word: 'Mark',
      detail: 'Solid black · single pass',
    },
    { value: 'sheet', label: 'Format', word: 'Size', detail: 'A3 sheet · 297 × 420 mm' },
  ]
  return (
    <Carousel
      label="Print samples"
      previousLabel="Previous sample"
      nextLabel="Next sample"
      items={studies.map((study) => ({
        ...study,
        content: (
          <div style={{ paddingBlock: '1.5rem' }}>
            <Typography as="p" variant="display">
              {study.word}
            </Typography>
            <Typography variant="label">{study.detail}</Typography>
          </div>
        ),
      }))}
    />
  )
}
export function ComboboxExample() {
  const [paper, setPaper] = useState('a3')
  return (
    <Combobox
      label="Print format"
      empty="No matching formats"
      placeholder="Search by name or dimensions"
      value={paper}
      onValueChange={setPaper}
      options={[
        { value: 'a5', label: 'A5', detail: '148 × 210 mm', keywords: ['148', '210'] },
        { value: 'a4', label: 'A4', detail: '210 × 297 mm', keywords: ['210', '297'] },
        { value: 'a3', label: 'A3', detail: '297 × 420 mm', keywords: ['297', '420'] },
        { value: 'a2', label: 'A2', detail: '420 × 594 mm', keywords: ['420', '594'] },
      ]}
    />
  )
}
export function CommandExample() {
  const [view, setView] = useState('All drafts')
  return (
    <div>
      <Command
        title="Go to collection"
        trigger="Find a collection"
        searchLabel="Search collections"
        closeLabel="Close search"
        empty="No matching collections"
        items={[
          {
            value: 'queue',
            label: 'In progress',
            keywords: ['queue'],
            onSelect: () => setView('In progress'),
          },
          {
            value: 'proofs',
            label: 'Awaiting approval',
            keywords: ['proofs'],
            onSelect: () => setView('Awaiting approval'),
          },
          {
            value: 'printed',
            label: 'Printed',
            keywords: ['archive'],
            onSelect: () => setView('Printed'),
          },
        ]}
      />
      <p role="status">Open collection · {view}</p>
    </div>
  )
}
export function ContextMenuExample() {
  const [copies, setCopies] = useState(1)
  return (
    <ContextMenu
      label="Proof actions"
      items={[
        { value: 'duplicate', label: 'Duplicate', onSelect: () => setCopies((n) => n + 1) },
        {
          value: 'reset',
          label: 'Reset to one copy',
          disabled: copies === 1,
          onSelect: () => setCopies(1),
        },
      ]}
    >
      <div style={{ padding: '1rem', border: '1px solid currentColor' }}>
        <Typography as="p" variant="heading">
          Cover proof
        </Typography>
        <p>Right-click or press Shift + F10 to open the menu.</p>
        <output aria-live="polite">Copies · {copies}</output>
      </div>
    </ContextMenu>
  )
}
export function DrawerExample() {
  const [open, setOpen] = useState(false),
    [saved, setSaved] = useState('Draft 01'),
    [draft, setDraft] = useState(saved)
  return (
    <div>
      <Drawer
        title="Draft name"
        description="This name appears in the review queue."
        trigger="Rename draft"
        closeLabel="Close panel"
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(saved)
          setOpen(next)
        }}
        footer={
          <Button
            disabled={!draft.trim()}
            onClick={() => {
              setSaved(draft.trim())
              setOpen(false)
            }}
          >
            Save name
          </Button>
        }
      >
        <Field label="Name">
          {(props) => <Input {...props} value={draft} onChange={(e) => setDraft(e.target.value)} />}
        </Field>
      </Drawer>
      <p role="status">{saved}</p>
    </div>
  )
}
export function HoverCardExample() {
  return (
    <HoverCard trigger="Type size" title="Type size">
      <p>
        Type size is measured in points. Leading is the distance between two consecutive baselines.
      </p>
      <p>Sample setting · 10/14 pt</p>
    </HoverCard>
  )
}
export function MenubarExample() {
  const [scale, setScale] = useState(100)
  return (
    <div>
      <Menubar
        label="Proof controls"
        menus={[
          {
            value: 'view',
            label: 'View',
            items: [
              {
                value: 'larger',
                label: 'Zoom in',
                disabled: scale >= 150,
                onSelect: () => setScale((n) => n + 25),
              },
              {
                value: 'smaller',
                label: 'Zoom out',
                disabled: scale <= 50,
                onSelect: () => setScale((n) => n - 25),
              },
            ],
          },
          {
            value: 'page',
            label: 'Page',
            items: [
              { value: 'actual', label: 'Actual size', onSelect: () => setScale(100) },
              { value: 'detail', label: 'Detail', onSelect: () => setScale(150) },
            ],
          },
        ]}
      />
      <p role="status">Preview scale · {scale}%</p>
    </div>
  )
}
export function PopoverExample() {
  const [copies, setCopies] = useState(1)
  return (
    <Popover
      title="Print run settings"
      trigger={'Print run · ' + copies}
      closeLabel="Close settings"
    >
      <Field label="Number of copies">
        {(props) => (
          <Input
            {...props}
            type="number"
            min={1}
            max={999}
            value={copies}
            onChange={(e) => {
              const n = e.target.valueAsNumber
              if (Number.isInteger(n) && n >= 1 && n <= 999) setCopies(n)
            }}
          />
        )}
      </Field>
    </Popover>
  )
}
export function ResizableExample() {
  return (
    <Resizable
      label="Index width"
      defaultValue={35}
      min={20}
      max={75}
      first={
        <>
          <Typography as="h3" variant="label">
            Index
          </Typography>
          <p>
            01　Format
            <br />
            02　Grid
            <br />
            03　Colour
          </p>
        </>
      }
      second={
        <>
          <Typography as="h3" variant="heading">
            Format
          </Typography>
          <p>
            An A3 sheet measures 297 × 420 mm. Both columns share a baseline.
          </p>
        </>
      }
    />
  )
}
