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
    { value: 'c', label: 'Cover' },
    { value: 'p', label: 'Draft', disabled: true },
    { value: 's', label: 'Print', keywords: ['run'] },
  ]
  return (
    <main>
      <form>
        <Combobox
          label="Format"
          options={[
            { value: 'a2', label: 'A2', disabled: true },
            { value: 'a3', label: 'A3' },
            { value: 'a4', label: 'A4' },
          ]}
          empty="No matching sizes"
          defaultValue="a4"
          name="format"
          required
        />
        <button type="reset">Reset</button>
      </form>
      <Command
        title="Commands"
        trigger="Search"
        closeLabel="Close search"
        searchLabel="Find an action"
        empty="No matching commands"
        items={items}
        onValueSelect={select}
      />
      <AlertDialog
        trigger="Remove"
        title="Remove item?"
        description="This proof will be removed."
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        onConfirm={() => select('confirmed')}
      />
      <Carousel
        label="Proofs"
        items={[
          { value: 'one', label: 'First', content: 'Page I' },
          { value: 'two', label: 'Second', content: 'Page II' },
        ]}
        previousLabel="Previous"
        nextLabel="Next"
      />
      <ContextMenu label="Actions area" items={items} onValueSelect={select}>
        Folder A
      </ContextMenu>
      <Menubar
        label="Edit document"
        menus={[
          { value: 'file', label: 'File', items },
          { value: 'view', label: 'View', items: [{ value: 'zoom', label: 'Zoom in' }] },
        ]}
        onValueSelect={select}
      />
      <Drawer title="Settings" trigger="Show panel" closeLabel="Close panel">
        Measurements
      </Drawer>
      <HoverCard trigger="Leading" title="Definition" delay={10}>
        <a href="#target">Glossary</a>
      </HoverCard>
      <Popover title="Quick actions" trigger="Show options" closeLabel="Close options">
        <button>Go</button>
      </Popover>
      <button id="target">Next control</button>
      <Resizable label="Index" first="Index" second="Text" defaultValue={40} min={10} max={80} />
      <Tabs
        label="Sections"
        activation="manual"
        items={[
          { value: 'a', label: 'Design', content: '01' },
          { value: 'b', label: 'Production', content: '02' },
        ]}
      />
      <output aria-label="Selection">{choice}</output>
    </main>
  )
}
createRoot(document.getElementById('app')!).render(<Fixture />)
