import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertDialog } from '../src/interactive/alert-dialog.js'
import { Carousel } from '../src/interactive/carousel.js'
import { Combobox } from '../src/interactive/combobox.js'
import { Command } from '../src/interactive/command.js'
import { ContextMenu } from '../src/interactive/context-menu.js'
import { Drawer } from '../src/interactive/drawer.js'
import { HoverCard } from '../src/interactive/hover-card.js'
import { Menubar } from '../src/interactive/menubar.js'
import { Popover } from '../src/interactive/popover.js'
import { Resizable } from '../src/interactive/resizable.js'
import { Tabs } from '../src/interactive/tabs.js'
import '../src/theme.css'
function Fixture() {
  const [choice, select] = useState('')
  const items = [
    { value: 'c', label: 'Copertina' },
    { value: 'p', label: 'Prova', disabled: true },
    { value: 's', label: 'Stampa', keywords: ['tiratura'] },
  ]
  return (
    <main>
      <form>
        <Combobox
          label="Formato"
          options={[
            { value: 'a2', label: 'A2', disabled: true },
            { value: 'a3', label: 'A3' },
            { value: 'a4', label: 'A4' },
          ]}
          empty="Nessuna misura"
          defaultValue="a4"
          name="format"
          required
        />
        <button type="reset">Ripristina</button>
      </form>
      <Command
        title="Comandi"
        trigger="Cerca"
        closeLabel="Chiudi ricerca"
        searchLabel="Trova azione"
        empty="Nessun comando"
        items={items}
        onValueSelect={select}
      />
      <AlertDialog
        trigger="Rimuovi"
        title="Rimuovere?"
        description="La prova sarà rimossa."
        cancelLabel="Annulla"
        confirmLabel="Conferma"
        onConfirm={() => select('confermato')}
      />
      <Carousel
        label="Prove"
        items={[
          { value: 'one', label: 'Prima', content: 'Pagina I' },
          { value: 'two', label: 'Seconda', content: 'Pagina II' },
        ]}
        previousLabel="Precedente"
        nextLabel="Successiva"
      />
      <ContextMenu label="Area azioni" items={items} onValueSelect={select}>
        Cartella A
      </ContextMenu>
      <Menubar
        label="Modifica documento"
        menus={[
          { value: 'file', label: 'File', items },
          { value: 'view', label: 'Visualizza', items: [{ value: 'zoom', label: 'Ingrandisci' }] },
        ]}
        onValueSelect={select}
      />
      <Drawer title="Parametri" trigger="Mostra pannello" closeLabel="Chiudi pannello">
        Misure
      </Drawer>
      <HoverCard trigger="Interlinea" title="Definizione" delay={10}>
        <a href="#target">Glossario</a>
      </HoverCard>
      <Popover title="Azioni rapide" trigger="Mostra opzioni" closeLabel="Chiudi opzioni">
        <button>Vai</button>
      </Popover>
      <button id="target">Seguito</button>
      <Resizable label="Indice" first="Indice" second="Testo" defaultValue={40} min={10} max={80} />
      <Tabs
        label="Sezioni"
        activation="manual"
        items={[
          { value: 'a', label: 'Disegno', content: '01' },
          { value: 'b', label: 'Produzione', content: '02' },
        ]}
      />
      <output aria-label="Scelta">{choice}</output>
    </main>
  )
}
createRoot(document.getElementById('app')!).render(<Fixture />)
