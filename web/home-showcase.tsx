import {
  Card, CardDescription, CardFooter, CardHeader, CardTitle, Chart, Collapsible,
  Grid, GridItem, Icon, Label, Select, Separator, Slider, Stack, Switch, TextLink,
  Typography, formatCHF,
} from 'alpina-ui'
import { initialCopies, posterEstimate } from './poster-estimate.js'
import { TypeSpecimen } from './type-specimen.js'

const printWeeks = [
  { week: '15–19 March 2027', hours: [4, 7, 5, 8, 6] },
  { week: '22–26 March 2027', hours: [6, 5, 8, 7, 4] },
]
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

function PrintEstimate() {
  return (
    <Card as="section" id="poster-estimate" aria-labelledby="poster-title">
      <CardHeader>
        <Stack direction="row" justify="space-between" wrap={false}>
          <CardTitle id="poster-title">Poster estimate</CardTitle>
          <Icon name="sliders" size={20} />
        </Stack>
        <CardDescription>A2 on uncoated stock, 140 g/m²</CardDescription>
      </CardHeader>
      <Separator />
      <Stack scripting="none" data-showcase-fallback="" gap={1}>
        <Typography variant="label">{initialCopies} copies · Black ink</Typography>
        <Typography variant="caption">CHF 24 setup + CHF 1.20 per copy</Typography>
      </Stack>
      <Stack gap={3} scripting="enabled" data-showcase-live="">
        <Stack gap={0}>
          <Stack direction="row" justify="space-between">
            <Label htmlFor="poster-copies">Edition size</Label>
            <Typography as="span" variant="label" numeric data-copy-count="">{initialCopies} copies</Typography>
          </Stack>
          <Slider id="poster-copies" min={25} max={250} step={25} defaultValue={initialCopies}
            aria-valuetext={initialCopies + ' copies'} />
        </Stack>
        <Stack direction="row" justify="space-between" wrap={false}>
          <Label htmlFor="poster-second-ink">Add a second ink</Label>
          <Switch id="poster-second-ink" />
        </Stack>
      </Stack>
      <Stack gap={1} role="status" aria-atomic="true">
        <Typography variant="caption">Estimated total</Typography>
        <Typography variant="heading" numeric lang="de-CH" data-estimate-total="">
          {formatCHF(posterEstimate(initialCopies, false), 'de-CH')}
        </Typography>
      </Stack>
      <CardFooter>
        <TextLink href="/docs/components/slider/">Slider</TextLink>
        <TextLink href="/docs/components/switch/">Switch</TextLink>
      </CardFooter>
    </Card>
  )
}

function PressChart({ hours, hidden }: { hours: number[]; hidden?: boolean }) {
  return <Chart title="Hours on press" hidden={hidden}
    data={hours.map((value, day) => ({ label: weekdays[day], value }))}
    categoryLabel="Weekday" valueLabel="Hours" tableLabel="View hours as a table" />
}

function PressLog() {
  return (
    <Card as="section" id="press-log" aria-label="Press log">
      <Stack direction="row" justify="space-between" wrap={false}>
        <Typography variant="label">Basel Print Room</Typography>
        <Icon name="clock" size={20} />
      </Stack>
      <Stack gap={1} scripting="enabled" data-showcase-live="">
        <Label htmlFor="press-week">Reporting week</Label>
        <Select id="press-week" defaultValue={printWeeks[0].week}>
          {printWeeks.map(({ week }) => <option key={week}>{week}</option>)}
        </Select>
      </Stack>
      <Stack gap={0} data-print-weeks="" scripting="enabled" data-showcase-live="">
        {printWeeks.map(({ week, hours }, index) => <PressChart key={week} hours={hours} hidden={index !== 0} />)}
      </Stack>
      <Stack scripting="none" data-showcase-fallback="" gap={0}>
        {printWeeks.map(({ week, hours }, index) => (
          <Collapsible key={week} summary={week} name="press-week" open={index === 0}>
            <PressChart hours={hours} />
          </Collapsible>
        ))}
      </Stack>
      <CardFooter><TextLink href="/docs/components/chart/">Chart component</TextLink></CardFooter>
    </Card>
  )
}

export function HomeShowcase() {
  return (
    <Grid as="section" id="component-showcase" aria-label="Interactive component examples" width="site" space="compact">
      <GridItem medium={4} large={4} subgrid="rows"><TypeSpecimen /></GridItem>
      <GridItem medium={4} large={4} subgrid="rows"><PrintEstimate /></GridItem>
      <GridItem medium={8} large={4} subgrid="rows"><PressLog /></GridItem>
    </Grid>
  )
}
