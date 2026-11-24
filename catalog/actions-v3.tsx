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
          Ripristina la bozza
        </Button>
      ) : (
        <AlertDialog
          title="Archiviare la bozza?"
          description="Il manifesto resta nell’archivio e viene rimosso dalla coda di stampa."
          trigger="Archivia bozza"
          cancelLabel="Mantieni in coda"
          confirmLabel="Archivia"
          onConfirm={() => setArchived(true)}
        />
      )}
      <p role="status">{archived ? 'Bozza archiviata.' : 'Bozza in coda di stampa.'}</p>
    </div>
  )
}
export function CarouselExample() {
  const studies = [
    { value: 'carta', label: 'Carta', word: 'Materia', detail: 'Carta naturale · 120 g/m²' },
    {
      value: 'inchiostro',
      label: 'Inchiostro',
      word: 'Segno',
      detail: 'Nero pieno · un passaggio',
    },
    { value: 'forma', label: 'Formato', word: 'Misura', detail: 'Foglio A3 · 297 × 420 mm' },
  ]
  return (
    <Carousel
      label="Campionario di stampa"
      previousLabel="Campione precedente"
      nextLabel="Campione successivo"
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
      label="Formato di stampa"
      empty="Nessun formato trovato"
      placeholder="Cerca per nome o dimensione"
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
  const [view, setView] = useState('Tutte le bozze')
  return (
    <div>
      <Command
        title="Vai alla raccolta"
        trigger="Cerca una raccolta"
        searchLabel="Cerca raccolta"
        closeLabel="Chiudi ricerca"
        empty="Nessuna raccolta trovata"
        items={[
          {
            value: 'queue',
            label: 'In lavorazione',
            keywords: ['coda'],
            onSelect: () => setView('In lavorazione'),
          },
          {
            value: 'proofs',
            label: 'Da approvare',
            keywords: ['prove'],
            onSelect: () => setView('Da approvare'),
          },
          {
            value: 'printed',
            label: 'Stampate',
            keywords: ['archivio'],
            onSelect: () => setView('Stampate'),
          },
        ]}
      />
      <p role="status">Raccolta aperta · {view}</p>
    </div>
  )
}
export function ContextMenuExample() {
  const [copies, setCopies] = useState(1)
  return (
    <ContextMenu
      label="Azioni sulla prova"
      items={[
        { value: 'duplicate', label: 'Duplica', onSelect: () => setCopies((n) => n + 1) },
        {
          value: 'reset',
          label: 'Ripristina una copia',
          disabled: copies === 1,
          onSelect: () => setCopies(1),
        },
      ]}
    >
      <div style={{ padding: '1rem', border: '1px solid currentColor' }}>
        <Typography as="p" variant="heading">
          Prova di copertina
        </Typography>
        <p>Clic destro o Maiusc + F10 per le azioni.</p>
        <output aria-live="polite">Copie · {copies}</output>
      </div>
    </ContextMenu>
  )
}
export function DrawerExample() {
  const [open, setOpen] = useState(false),
    [saved, setSaved] = useState('Bozza 01'),
    [draft, setDraft] = useState(saved)
  return (
    <div>
      <Drawer
        title="Nome della bozza"
        description="Il nome compare nella coda di revisione."
        trigger="Rinomina bozza"
        closeLabel="Chiudi pannello"
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
            Salva nome
          </Button>
        }
      >
        <Field label="Nome">
          {(props) => <Input {...props} value={draft} onChange={(e) => setDraft(e.target.value)} />}
        </Field>
      </Drawer>
      <p role="status">{saved}</p>
    </div>
  )
}
export function HoverCardExample() {
  return (
    <HoverCard trigger="Corpo tipografico" title="Corpo tipografico">
      <p>
        Misura del carattere espressa in punti. L’interlinea indica la distanza fra due linee di
        base successive.
      </p>
      <p>Composizione d’esempio · 10/14 pt</p>
    </HoverCard>
  )
}
export function MenubarExample() {
  const [scale, setScale] = useState(100)
  return (
    <div>
      <Menubar
        label="Comandi della prova"
        menus={[
          {
            value: 'view',
            label: 'Visualizza',
            items: [
              {
                value: 'larger',
                label: 'Ingrandisci',
                disabled: scale >= 150,
                onSelect: () => setScale((n) => n + 25),
              },
              {
                value: 'smaller',
                label: 'Riduci',
                disabled: scale <= 50,
                onSelect: () => setScale((n) => n - 25),
              },
            ],
          },
          {
            value: 'page',
            label: 'Pagina',
            items: [
              { value: 'actual', label: 'Dimensione originale', onSelect: () => setScale(100) },
              { value: 'detail', label: 'Dettaglio', onSelect: () => setScale(150) },
            ],
          },
        ]}
      />
      <p role="status">Scala di anteprima · {scale}%</p>
    </div>
  )
}
export function PopoverExample() {
  const [copies, setCopies] = useState(1)
  return (
    <Popover
      title="Impostazioni di tiratura"
      trigger={'Tiratura · ' + copies}
      closeLabel="Chiudi impostazioni"
    >
      <Field label="Numero di copie">
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
      label="Larghezza dell’indice"
      defaultValue={35}
      min={20}
      max={75}
      first={
        <>
          <Typography as="h3" variant="label">
            Indice
          </Typography>
          <p>
            01　Formato
            <br />
            02　Griglia
            <br />
            03　Colore
          </p>
        </>
      }
      second={
        <>
          <Typography as="h3" variant="heading">
            Formato
          </Typography>
          <p>
            Un foglio A3 misura 297 × 420 mm. Le due colonne condividono la stessa linea di base.
          </p>
        </>
      }
    />
  )
}
