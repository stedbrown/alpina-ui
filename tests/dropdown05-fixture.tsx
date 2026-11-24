import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DropdownMenu, type DropdownMenuItem } from '../src/interactive/dropdown-menu.js'
import { AlertDialog } from '../src/interactive/alert-dialog.js'
import '../src/theme.css'

function Fixture() {
  const rowAction = useRef<HTMLButtonElement>(null)
  const [confirm, setConfirm] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [de, setDe] = useState(true)
  const longName = de
    ? 'Gemeindeverwaltungsangaben des Ansprechpartners exportieren'
    : 'Esporta i dati del referente comunale'
  const destructive = de ? 'Kontakt löschen…' : 'Elimina contatto…'
  const items: DropdownMenuItem[] = [
    { value: 'edit', label: de ? 'Bearbeiten' : 'Modifica', separatorBefore: true },
    { value: 'export', label: longName, disabled: true },
    ...Array.from({ length: 26 }, (_, i) => ({ value: 'contact-' + i, label: 'Kontakt ' + i })),
    {
      value: 'remove',
      label: destructive,
      tone: 'danger',
      separatorBefore: true,
      onSelect: () => {
        setLog((previous) => [...previous, 'item'])
        setConfirm(true)
      },
    },
  ]
  return (
    <>
      <button onClick={() => setDe(!de)}>IT / DE</button>
      <div
        id="clip"
        style={{
          margin: '3rem auto 0',
          width: '90%',
          height: 100,
          overflow: 'auto',
          transform: 'translateZ(0)',
        }}
      >
        <div style={{ height: 520, textAlign: 'center' }}>
          <DropdownMenu
            triggerRef={rowAction}
            align="end"
            size="compact"
            label={de ? 'Aktionen' : 'Azioni'}
            triggerLabel={de ? 'Aktionen für Atelier' : 'Azioni per Atelier'}
            items={items}
            onValueSelect={(value) => setLog((previous) => [...previous, value])}
          />
          <button id="after">Weiter</button>
        </div>
      </div>
      <DropdownMenu label="⋮" triggerLabel="Weitere Aktionen" size="compact" items={items} />
      <button onClick={() => rowAction.current?.focus()}>Torna al contatto</button>
      <output>{log.join('/')}</output>
      <AlertDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={destructive}
        description="Atelier"
        cancelLabel={de ? 'Abbrechen' : 'Annulla'}
        confirmLabel={de ? 'Löschen' : 'Elimina'}
        onConfirm={() => setLog((previous) => [...previous, 'confirmed'])}
      />
    </>
  )
}
createRoot(document.getElementById('app')!).render(<Fixture />)
