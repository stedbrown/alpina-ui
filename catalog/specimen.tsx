import { useEffect, useId, useRef, useState } from 'react'
import {
  Button, DescriptionList, Field, Grid, GridItem, GridSpecimen, Icon, NavigationMenu, Select,
  Separator, Stack, SwissDate, Typography, observeGridSpecimen, type GridMeasurements,
} from 'alpina-ui'
import { clientProject, componentHref, guideHref } from './paths.js'

const programme = [
  { time: '09:30', title: 'Measuring the page', format: 'Lecture' },
  { time: '11:00', title: 'Designing with a grid', format: 'Workshop' },
  { time: '14:15', title: 'Reading the city', format: 'Discussion' },
] as const

export function Specimen({ hosted }: { hosted: boolean }) {
  const [width, setWidth] = useState<number | 'auto'>('auto')
  const [guides, setGuides] = useState(false)
  const [measures, setMeasures] = useState<GridMeasurements>()
  const viewport = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLElement>(null)
  const id = useId()

  useEffect(() => {
    if (viewport.current && title.current) return observeGridSpecimen(viewport.current, title.current, setMeasures)
  }, [])

  return <Stack gap={6}>
    <Grid as="header" align="end" space="section">
      <GridItem medium={4} large={7}><Typography variant="title" as="h1">Alpina UI</Typography></GridItem>
      <GridItem medium={4} large={5}>
        <Typography measure="narrow">React components for working with Swiss typography. Resize the program below,
          measure its columns, and explore the code.</Typography>
      </GridItem>
    </Grid>
    <Grid as="section" aria-label="Typographic specimen"><GridItem><Stack gap={4}>
      <Separator />
      <Stack direction="row" justify="space-between" align="end">
        <Typography variant="label">Type specimen</Typography>
        <Stack direction="row" align="end" gap={2}>
          <Field label="Width">{control => <Select {...control} value={width} onChange={event => {
            setWidth(event.target.value === 'auto' ? 'auto' : Number(event.target.value))
            viewport.current?.scrollTo({ left: 0 })
          }}>
            <option value="auto">Automatic</option>
            {[320, 640, 960].map(size => <option key={size} value={size}>{size} px</option>)}
          </Select>}</Field>
          <Button variant="outline" aria-pressed={guides} aria-controls={id} onClick={() => setGuides(!guides)}>
            <Icon name="grid" /> Show grid
          </Button>
        </Stack>
      </Stack>
      <GridSpecimen label="Sample program for the design talks" id={id} width={width} ref={viewport}
        tabIndex={measures?.scrollable ? 0 : -1}>
        <Grid guides={guides} space="compact" align="baseline">
          <GridItem>
            <Stack direction="row" align="baseline" justify="space-between">
              <Typography variant="label">Lugano</Typography>
              <Typography variant="caption">Sample program</Typography>
            </Stack>
            <Separator />
          </GridItem>
          <GridItem medium={2} large={3}>
            <Typography variant="label" numeric>
              <SwissDate value="2026-11-24" locale="de-CH" aria-label="24 November 2026" />
            </Typography>
          </GridItem>
          <GridItem medium={6} large={9}>
            <Typography variant="display" responsive tone="accent" as="h2" ref={title}>Design talks</Typography>
          </GridItem>
          {programme.map(session => <GridItem key={session.time} subgrid="columns">
            <GridItem small={1} medium={2} large={3}><Typography variant="label" numeric>{session.time}</Typography></GridItem>
            <GridItem small={3} medium={4} large={6}><Typography variant="label" as="h3">{session.title}</Typography></GridItem>
            <GridItem small={3} start={{ small: 2 }} medium={2} large={3}><Typography variant="caption">{session.format}</Typography></GridItem>
          </GridItem>)}
        </Grid>
      </GridSpecimen>
      {measures?.scrollable && <Typography variant="caption">Scroll horizontally to see the full specimen.</Typography>}
      <DescriptionList aria-label="Measured specimen dimensions" layout="columns" items={[
        { term: 'Width', detail: measures ? measures.width + ' px' : '—' },
        { term: 'Columns', detail: measures?.columns ?? '—' },
        { term: 'Margin', detail: measures ? measures.margin + ' px' : '—' },
        { term: 'Gutter', detail: measures ? measures.gutter + ' px' : '—' },
        { term: 'Unit', detail: measures ? measures.unit + ' px' : '—' },
        { term: 'Title size / line height', detail: measures ? measures.typeSize + ' / ' + measures.lineHeight + ' px' : '—' },
      ]} />
    </Stack></GridItem></Grid>
    <Grid><GridItem><NavigationMenu label="Explore the system" orientation="horizontal" sections={[{ links: [
      { href: guideHref('design', hosted), label: 'Design guide' },
      { href: guideHref('research', hosted), label: 'Research and sources' },
      { href: componentHref('grid', hosted), label: 'Grid' },
      { href: componentHref('typography', hosted), label: 'Typography' },
      { href: hosted ? clientProject : '#address-book', label: 'Sample address book' },
    ] }]} /></GridItem></Grid>
  </Stack>
}
