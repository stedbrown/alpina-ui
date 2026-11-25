import { createRef } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Card, CardHeader, CardTitle, CurrencyCHF, DataTable, Field, Grid, GridItem,
  Input, Kbd, Label, Prose, SwissDate, Table, TableBody, TableCell, TableRow, Typography,
} from 'alpina-ui'

const references = {
  grid: createRef<HTMLElement>(), column: createRef<HTMLDivElement>(),
  card: createRef<HTMLElement>(), header: createRef<HTMLDivElement>(), title: createRef<HTMLHeadingElement>(),
  field: createRef<HTMLDivElement>(), input: createRef<HTMLInputElement>(), label: createRef<HTMLLabelElement>(),
  prose: createRef<HTMLElement>(), keyboard: createRef<HTMLElement>(), type: createRef<HTMLElement>(),
  table: createRef<HTMLTableElement>(), body: createRef<HTMLTableSectionElement>(),
  row: createRef<HTMLTableRowElement>(), cell: createRef<HTMLTableCellElement>(),
  amount: createRef<HTMLDataElement>(), date: createRef<HTMLTimeElement>(), records: createRef<HTMLDivElement>(),
}
const root = createRoot(document.getElementById('app')!)
root.render(
  <Grid as="main" ref={references.grid} className="consumer">
    <GridItem ref={references.column} className="consumer">
      <Card as="article" ref={references.card} className="consumer">
        <CardHeader ref={references.header} className="consumer">
          <CardTitle as="h3" ref={references.title} className="consumer">Invoice</CardTitle>
        </CardHeader>
        <Field ref={references.field} label="Reference" className="consumer">
          {props => <Input {...props} ref={references.input} className="consumer" />}
        </Field>
        <Label ref={references.label} className="consumer">Payment</Label>
        <Prose ref={references.prose} className="consumer">
          <Typography as="span" ref={references.type} className="consumer">Press </Typography>
          <Kbd ref={references.keyboard} className="consumer">Enter</Kbd>
        </Prose>
        <Table ref={references.table} className="consumer">
          <TableBody ref={references.body} className="consumer">
            <TableRow ref={references.row} className="consumer">
              <TableCell ref={references.cell} className="consumer">
                <CurrencyCHF ref={references.amount} className="consumer" amount={20} />
                <SwissDate ref={references.date} className="consumer" value="2026-01-12" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DataTable ref={references.records} className="consumer" caption="Payments" empty="No payments"
          rows={[{ id: 'invoice-1', amount: 20 }]} rowKey={row => row.id}
          columns={[{ id: 'amount', header: 'Amount', cell: row => row.amount }]} />
      </Card>
    </GridItem>
  </Grid>,
)
Object.assign(window, { leafReferences: references, unmountLeaves: () => root.unmount() })
