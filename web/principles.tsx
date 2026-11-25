import { PageRegion } from 'alpina-ui'
import type { ReactNode } from 'react'
import {
  Avatar, Badge, CurrencyCHF, Grid, GridItem, Separator, Stack, Table,
  TableBody, TableCell, TableHead, TableHeader, TableRow, TextLink, Typography,
} from 'alpina-ui'
import { Footer, Masthead, PageHeading } from './pages.js'

const sources = {
  grid: ['Josef Müller-Brockmann, Grid Systems', 'https://niggli.ch/en/products/rastersysteme-fur-die-visuelle-gestaltung'],
  type: ['Emil Ruder, Typographie', 'https://niggli.ch/en/products/typographie'],
  form: ['Armin Hofmann, Graphic Design Manual', 'https://niggli.ch/en/products/methodik-der-form-und-bildgestaltung'],
  programme: ['Karl Gerstner, Designing Programmes', 'https://www.lars-mueller-publishers.com/designing-programmes-0'],
  federal: ['Federal Chancellery, WGL Bund V04.00, chapter 12', 'https://www.bk.admin.ch/dam/de/sd-web/eKVJwRo-kF-Q/CD-Bund-Manual_DE_2026.pdf#page=199'],
  links: ['W3C, Understanding Link Purpose', 'https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html'],
}

type Rule = {
  id: string
  title: string
  note: string
  source: keyof typeof sources
  sample: (recommended: boolean) => ReactNode
}

const departures = [['08:04', 'Basel SBB'], ['08:12', 'Biel/Bienne'], ['08:28', 'Chur']]
const editions = [['Proof', 19.5], ['Edition', 109.5], ['Set', 1090.5]] as const

const rules: Rule[] = [
  {
    id: 'axis', title: 'Give departures a common edge.',
    note: 'Read the three destinations vertically. A stable time column lets the eye return to the same position after each station name.',
    source: 'grid',
    sample: good => good
      ? <Table aria-label="Departures"><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Destination</TableHead></TableRow></TableHeader>
          <TableBody>{departures.map(([time, station]) =>
            <TableRow key={time}><TableCell>{time}</TableCell><TableCell>{station}</TableCell></TableRow>)}</TableBody></Table>
      : <Stack gap={2}>{departures.map(([time, station], i) =>
          <Stack key={time} align={i === 1 ? 'end' : i === 2 ? 'center' : 'start'}><Typography>{time}　{station}</Typography></Stack>)}</Stack>,
  },
  {
    id: 'hierarchy', title: 'Let the subject lead.',
    note: 'A visitor scanning a programme needs the exhibition title first. The room number can stay small and still be easy to find.',
    source: 'form',
    sample: good => <Stack gap={1}>
      <Typography variant={good ? 'heading' : 'caption'}>Type in Basel</Typography>
      <Typography variant={good ? 'caption' : 'heading'}>Gallery 04</Typography>
    </Stack>,
  },
  {
    id: 'group', title: 'Keep a place with its time.',
    note: 'A larger space between events and a smaller space inside each event let visitors see which room belongs to which talk.',
    source: 'type',
    sample: good => <Stack gap={good ? 5 : 1}>{[['09:00', 'Lecture hall'], ['10:30', 'Print workshop']].map(([time, room]) =>
      <Stack key={time} gap={good ? 0 : 5}><Typography variant="label" numeric>{time}</Typography><Typography>{room}</Typography></Stack>)}</Stack>,
  },
  {
    id: 'precision', title: 'Give prices equal precision.',
    note: 'The decimal and units columns carry information. Right alignment and two decimal places let the buyer compare editions without rereading each amount.',
    source: 'type',
    sample: good => <Table aria-label={good ? 'Aligned edition prices' : 'Uneven edition prices'}>
      <TableHeader><TableRow><TableHead>Edition</TableHead><TableHead numeric={good}>Price</TableHead></TableRow></TableHeader>
      <TableBody>{editions.map(([name, price]) => <TableRow key={name}><TableCell>{name}</TableCell>
        <TableCell numeric={good}>{good ? <CurrencyCHF amount={price} locale="de-CH" /> : 'CHF ' + price}</TableCell>
      </TableRow>)}</TableBody></Table>,
  },
  {
    id: 'roles', title: 'Keep a role in the same place.',
    note: 'Each workshop edition has a city and an issue number. Repeat their order and weight so the next edition remains familiar when the names change.',
    source: 'programme',
    sample: good => <Stack gap={3}>{['Lugano', 'Lausanne'].map((city, i) =>
      <Stack key={city} gap={0}>
        <Typography variant="caption">{good || i === 0 ? 'Edition 0' + (i + 1) : city}</Typography>
        <Typography variant="heading">{good || i === 0 ? city : 'Edition 02'}</Typography>
      </Stack>)}</Stack>,
  },
  {
    id: 'accent', title: 'Reserve red for the exception.',
    note: 'Only the delayed job needs attention. A written status and a single accent identify it even when the reader scans by colour or reads labels aloud.',
    source: 'federal',
    sample: good => <Stack gap={2} align="start">{['Proof approved', 'Paper received', 'Press delayed'].map((text, i) =>
      <Badge key={text} tone={i === 2 || !good ? 'accent' : 'neutral'}>{text}</Badge>)}</Stack>,
  },
  {
    id: 'translation', title: 'Allow a second language its own line.',
    note: 'On a bilingual ticket, each reader should be able to follow one instruction from beginning to end. Give the translated instruction the same position and weight.',
    source: 'grid',
    sample: good => good
      ? <Stack gap={2}><Typography lang="it-CH">Ingresso dal cortile</Typography><Typography lang="de-CH">Eingang über den Hof</Typography></Stack>
      : <Typography><span lang="it-CH">Ingresso</span> / <span lang="de-CH">Eingang</span> · <span lang="it-CH">dal cortile</span> / <span lang="de-CH">über den Hof</span></Typography>,
  },
  {
    id: 'destination', title: 'Name the destination.',
    note: 'In a list of resources, a link should tell readers what they will open. That name still works when a screen reader lists the links in isolation.',
    source: 'links',
    sample: good => <Stack align="start" gap={2}>
      <TextLink href="/docs/guides/design/" aria-label={good ? undefined : 'Read more about grid and type measurements'}>{good ? 'Grid and type measurements' : 'Read more'}</TextLink>
      <TextLink href="/docs/guides/qr-bill/" aria-label={good ? undefined : 'Read more about printing a Swiss QR-bill'}>{good ? 'Swiss QR-bill print guide' : 'Read more'}</TextLink>
    </Stack>,
  },
]

export function Principles() {
  return <>
    <Masthead current="principles" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <PageHeading title="Design principles" summary="Eight decisions from a working Swiss interface. Compare each pair using the same components and the same information." />
      <Grid as="section" width="site" space="compact" aria-labelledby="alpina-mark">
        <GridItem medium={4} large={4}><Typography id="alpina-mark" as="h2" variant="heading">The Alpina mark</Typography></GridItem>
        <GridItem medium={4} large={7}><Stack direction="row" align="center" wrap={false}><Avatar decorative name="Alpina" size="lg" src="/assets/logo.svg" /><Typography measure="narrow">A white A without a crossbar, shaped like a peak on a red square. Its flat apex and open centre keep the form legible at the size of a browser icon.</Typography></Stack></GridItem>
      </Grid>
      {rules.map(({ id, title, note, source, sample }) => <Grid as="section" width="site" space="compact" aria-labelledby={id} key={id}>
        <GridItem><Separator weight="section" /></GridItem>
        <GridItem medium={8} large={4}><Stack gap={3} align="start">
          <Typography as="h2" variant="heading" id={id}>{title}</Typography>
          <Typography measure="narrow">{note}</Typography>
          <TextLink href={sources[source][1]}>{sources[source][0]}</TextLink>
        </Stack></GridItem>
        {[true, false].map(good => <GridItem key={String(good)} medium={4} large={4}>
          <Stack gap={3}>
            <Typography as="h3" variant="label" tone={good ? 'accent' : undefined}>{good ? 'Use' : 'Avoid'}</Typography>
            <Stack inset={4} surface="soft">{sample(good)}</Stack>
          </Stack>
        </GridItem>)}
      </Grid>)}
    </PageRegion>
    <Footer />
  </>
}
