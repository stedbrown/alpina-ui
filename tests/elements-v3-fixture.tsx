import { createRoot } from 'react-dom/client'
import { useState, useRef, useEffect } from 'react'
import { Alert } from '../src/ui/alert.js'
import { Badge } from '../src/ui/badge.js'
import { Button } from '../src/ui/button.js'
import { Marker } from '../src/ui/marker.js'
import { Avatar } from '../src/ui/avatar.js'
import { Chart } from '../src/ui/chart.js'
import { Checkbox } from '../src/ui/checkbox.js'
import { Collapsible } from '../src/ui/collapsible.js'
import { Field } from '../src/ui/field.js'
import { Grid, GridItem } from '../src/ui/grid.js'
import { Input } from '../src/ui/input.js'
import { ScrollArea } from '../src/ui/scroll-area.js'
import { Slider } from '../src/ui/slider.js'
import { Switch } from '../src/ui/switch.js'
import { Table, TableHead, TableHeader, TableRow } from '../src/ui/table.js'
import { Toggle } from '../src/ui/toggle.js'
import '../src/theme.css'
function Fixture() {
  const ref = useRef<HTMLInputElement>(null)
  const [mixed, setMixed] = useState(true)
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!ref.current?.indeterminate) throw Error('checkbox ref must resolve to native mixed control')
  }, [])
  return (
    <main style={{ background: 'var(--al-bg)', color: 'var(--al-ink)' }}>
      {(['neutral', 'accent', 'success', 'danger'] as const).map((tone) => (
        <Badge key={tone} tone={tone}>
          {tone}
        </Badge>
      ))}
      {(['info', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Alert key={tone} title={tone} tone={tone}>
          Messaggio
        </Alert>
      ))}
      {(['primary', 'secondary', 'ghost', 'outline', 'danger'] as const).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
      <Marker variant="attention">Da verificare</Marker>
      <Chart
        title="Inventario"
        data={[
          { label: 'Nord', value: -10 },
          { label: 'Sud', value: 20 },
          { label: 'Zero', value: 0 },
          { label: 'Assente', value: NaN },
        ]}
      />
      <Chart title="Serie vuota" data={[]} />
      <Field id="costo" label="Costo" error="Inserisci il costo" describedBy="costo-error costo-error">
        {(props) => <Input {...props} numeric />}
      </Field>
      <Checkbox ref={ref} aria-label="Tutti" indeterminate={mixed} onChange={() => setMixed(false)} />
      <Checkbox aria-label="Selezione parziale" indeterminate />
      <Switch aria-label="Prestito" stateLabels={{ on: 'Attivo', off: 'Sospeso' }} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead numeric>Totale</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <Toggle onPressedChange={() => setCount((x) => x + 1)}>Guida</Toggle>
      <output id="events">{count}</output>
      <Toggle pressed={false}>Controllato</Toggle>
      <Collapsible summary="Condizioni">Restituzione in sede</Collapsible>
      <Slider aria-label="Corpo" min={12} max={24} step={2} defaultValue={16} />
      <Avatar name="Ada Keller" src="data:image/png;base64,AAAA" />
      <ScrollArea label="Indice" maxHeight={64}>
        <div style={{ height: 320 }}>Indice dei nomi</div>
      </ScrollArea>
      <div style={{ width: '70rem', maxWidth: '100%' }}>
        <Grid>
          <GridItem large={4} start={{ large: 12 }}>
            Colonna
          </GridItem>
        </Grid>
      </div>
    </main>
  )
}
createRoot(document.getElementById('app')!).render(<Fixture />)
