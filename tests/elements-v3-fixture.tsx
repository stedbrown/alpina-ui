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
          Message
        </Alert>
      ))}
      {(['primary', 'secondary', 'ghost', 'outline', 'danger'] as const).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
      <Marker variant="attention">Needs review</Marker>
      <Chart
        title="Inventory"
        data={[
          { label: 'North', value: -10 },
          { label: 'South', value: 20 },
          { label: 'Zero', value: 0 },
          { label: 'Missing', value: NaN },
        ]}
      />
      <Chart title="Empty series" data={[]} />
      <Field id="cost" label="Cost" error="Enter the cost" describedBy="cost-error cost-error">
        {(props) => <Input {...props} numeric />}
      </Field>
      <Checkbox ref={ref} aria-label="All" indeterminate={mixed} onChange={() => setMixed(false)} />
      <Checkbox aria-label="Partial selection" indeterminate />
      <Switch aria-label="Loan" stateLabels={{ on: 'Active', off: 'Suspended' }} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead numeric>Total</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <Toggle onPressedChange={() => setCount((x) => x + 1)}>Guide</Toggle>
      <output id="events">{count}</output>
      <Toggle pressed={false}>Controlled</Toggle>
      <Collapsible summary="Terms">Return on site</Collapsible>
      <Slider aria-label="Type size" min={12} max={24} step={2} defaultValue={16} />
      <Avatar name="Ada Keller" src="data:image/png;base64,AAAA" />
      <ScrollArea label="Index" maxHeight={64}>
        <div style={{ height: 320 }}>Index of names</div>
      </ScrollArea>
      <div style={{ width: '70rem', maxWidth: '100%' }}>
        <Grid>
          <GridItem large={4} start={{ large: 12 }}>
            Column
          </GridItem>
        </Grid>
      </div>
    </main>
  )
}
createRoot(document.getElementById('app')!).render(<Fixture />)
