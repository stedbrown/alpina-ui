import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Alert, AppShell, AspectRatio, Attachment, Avatar, Badge, Breadcrumb, Button, ButtonGroup,
  Card, CardContent, CardFooter, CardTitle, Chart, Checkbox, CodeBlock, Collapsible, CurrencyCHF, DataTable,
  Direction, Empty, Field, Grid, GridItem, Input, InputGroup, Item, Kbd, Label, Marker,
  Message, SideNav, SideNavLink, Pagination, Progress, Prose, RadioGroup, ScrollArea, Select,
  Separator, Sidebar, Skeleton, Slider, Spinner, Stack, Switch, Table, TableBody, TableCell, TableRow,
  Textarea, TextLink, Toggle, Typography,
} from '../src/index.js'
import '../src/theme.css'

const token = 'Atelier'.repeat(12)
const columns = [{ id: 'amount', header: 'Amount due', compare: (a: number, b: number) => a - b, cell: String }]
const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<'a'> & { to: string }>(
  ({ to, ...props }, ref) => <a {...props} ref={ref} href={to} />,
)

function Fixture() {
  const [mixed, setMixed] = useState<boolean | undefined>(true)
  return <>
    <Grid width="site" align="center" aria-label="Specimen frame">
      <GridItem>
        <Typography as="h1" variant="title">{token}</Typography>
        <Stack inset={4} surface="ink"><Button variant="outline">Proof</Button></Stack>
        <Field id="reference" label="Reference" description="Use the printed number."
          error="Enter a reference." describedBy="terms reference-error">
          {(control) => <Input {...control} dir="rtl" />}
        </Field>
        <p id="terms">The number appears on the invoice.</p>
        <form id="reservation" />
        <RadioGroup form="reservation" name="language" label="Receipt language" defaultValue="de"
          options={[{ label: 'German', value: 'de' }, { label: 'French', value: 'fr' }]} />
        <Checkbox aria-label="Partial" indeterminate={mixed} onChange={() => setMixed(undefined)} />
        <Field label="Notes">{(props) => <Textarea {...props} rows={6} autoGrow />}</Field>
        <InputGroup trailing="CHF"><Input aria-label="Price" numeric /></InputGroup>
        <Label htmlFor="format">Format</Label>
        <Select id="format" defaultValue="A4"><option>A4</option><option>A5</option></Select>
        <Alert title="Revision" titleAs="h2">Correct the address below.</Alert>
        <Empty title="No results" titleAs="h3" action={<Button>Clear filters</Button>} />
        <AspectRatio fit="contain" ratio={2}><img alt="Proof" width="200" height="200"
          src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" /></AspectRatio>
        <Avatar name={'A\u0308nne Keller'} />
        <Badge tone="success">Approved</Badge>
        <ButtonGroup label="Actions"><Button busy>Saving</Button><Toggle>Pin</Toggle></ButtonGroup>
        <Card><CardTitle>Proof</CardTitle><CardContent>{token}</CardContent>
          <CardFooter><Attachment href="#proof" filename={token + '.pdf'} detail="PDF" /></CardFooter></Card>
        <Chart title="Balance" data={[{ label: 'Income', value: 12 }, { label: 'Returns', value: -1 }]} />
        <Collapsible summary="Terms">Payment within 30 days</Collapsible>
        <DataTable caption="Amounts" rows={[3, 1]} columns={columns} rowKey={String} empty="No records" />
        <Table aria-label="Line items"><TableBody>
          <TableRow><TableCell>{token}<Typography numeric variant="caption">3 × CHF 85</Typography></TableCell>
            <TableCell numeric><CurrencyCHF locale="de-CH" amount={255} /></TableCell></TableRow>
          <TableRow><TableCell>Large value</TableCell><TableCell numeric>{'9'.repeat(100)}</TableCell></TableRow>
        </TableBody></Table>
        <Direction dir="rtl">
          <p>Record <Direction as="span" dir="auto">שלום</Direction></p>
          <Breadcrumb label="Current location" items={[{ label: 'Index', href: '#index' }, { label: token }]} />
          <Message author={token} side="end" timestamp="Today" dateTime="2026-07-01">{token}</Message>
        </Direction>
        <Pagination currentPage={2} items={[1, 2, 3].map((page) => ({ page, href: '#p' + page }))}
          label="Results" pageLabel={(page) => 'Seite ' + page} />
        <Item leading={token} current title="Current proof" trailing="A4" />
        <Marker variant="attention">{token}</Marker><Kbd>{token}</Kbd>
        <Progress label="Printing" value={130} /><Progress label="Starting" />
        <Skeleton /><Spinner label="Loading a proof" showLabel />
        <Separator decorative={false} orientation="vertical" />
        <ScrollArea label="Activity" maxHeight={48}><p>Received</p><p>Printing</p><p>Ready</p></ScrollArea>
        <Slider aria-label="Scale" min={1} max={3} defaultValue={2} />
        <Switch aria-label="Notifications" stateLabels={{ on: 'On', off: 'Off' }} />
        <CodeBlock label="Install" code="npm install sample" />
      </GridItem>
    </Grid>
    <AppShell brand="Studio" sidebar={<Sidebar><SideNav label="Sections">
      <SideNavLink active asChild><RouterLink to="#directory">Directory</RouterLink></SideNavLink>
      <SideNavLink href="#archive" aria-current={false}>Archive</SideNavLink>
    </SideNav></Sidebar>}>
      <Prose><h2>Directory</h2><p><TextLink href="#index">Index</TextLink></p></Prose>
    </AppShell>
  </>
}

createRoot(document.getElementById('app')!).render(<Fixture />)
