import {
  AspectRatio,
  Grid,
  GridItem,
  NavigationMenu,
  Separator,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextLink,
  Typography,
} from 'alpina-ui'
import { TypeSpecimen } from './type-specimen.js'
import { initialContacts } from '../recipes/rubrica/src/data.js'

const repository = 'https://github.com/stedbrown/alpina-ui'
const pageWidth = '100rem'
const outerMargin = 'max(0px, calc((100% - ' + pageWidth + ') / 2))'
type Section = 'home' | 'docs' | 'examples' | 'agents'

export function Masthead({ current }: { current: Section }) {
  const links = [
    { href: '/docs/', label: 'Docs', current: current === 'docs' },
    { href: '/examples/', label: 'Examples', current: current === 'examples' },
    { href: '/agents/', label: 'Agent tools', current: current === 'agents' },
    { href: repository, label: 'GitHub ↗' },
  ]

  return (
    <Grid as="header" space="compact" style={{ paddingInline: outerMargin, borderBlockEnd: '1px solid var(--al-line)' }}>
      <GridItem>
        <TextLink variant="skip" href="#content">Skip to content</TextLink>
        <Stack direction="row" justify="space-between" gap={1} columnGap={6}>
          <TextLink variant="quiet" href="/" aria-current={current === 'home' ? 'page' : undefined}>
            <Stack direction="row" gap={2} wrap={false}>
              <img src="/assets/alpina-mark.png" width="26" height="26" alt="" />
              <Typography as="span" variant="heading">Alpina UI</Typography>
            </Stack>
          </TextLink>
          <NavigationMenu label="Main navigation" orientation="horizontal" sections={[{ links }]} />
        </Stack>
      </GridItem>
    </Grid>
  )
}

export function Footer({ version }: { version?: string } = {}) {
  return (
    <Grid as="footer" surface="ink" space="compact" style={{ paddingInline: outerMargin }}>
      <GridItem>
        <Stack direction="row" justify="space-between" align="baseline" gap={2} columnGap={6}>
          {version
            ? <Typography variant="label">Alpina UI · v{version}</Typography>
            : <TextLink href="/" variant="quiet"><Typography as="span" variant="heading">Alpina UI</Typography></TextLink>}
          <Stack direction="row" gap={4}>
            <TextLink href={repository + '/blob/main/LICENSE'}>MIT license</TextLink>
            <TextLink href={repository}>GitHub ↗</TextLink>
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  )
}

export function Landing({ version, count }: { version: string; count: number }) {
  return (
    <>
      <Masthead current="home" />
      <main id="content" tabIndex={-1} style={{ width: '100%', maxWidth: pageWidth, marginInline: 'auto' }}>
        <Grid as="section" aria-labelledby="introduction" space="cover">
          <GridItem medium={4} large={5} style={{ alignSelf: 'center', paddingBlock: 'var(--al-space-4)' }}>
            <Stack gap={6} align="start">
              <Typography variant="label">Open-source component library</Typography>
              <Typography as="h1" variant="display" id="introduction" style={{
                fontSize: 'clamp(3.5rem, 6.8cqi, 6.75rem)', lineHeight: 0.94, letterSpacing: '-0.065em', hyphens: 'none',
              }}>Swiss type<br />for React.</Typography>
              <Typography style={{ maxWidth: '35ch', fontSize: 'clamp(1.0625rem, 1.5cqi, 1.35rem)', lineHeight: 1.4 }}>
                Build forms, tables and multilingual interfaces with {count} components on a shared typographic grid.
              </Typography>
              <Stack direction="row" gap={3} columnGap={5}>
                <TextLink variant="action" href="/docs/">Get started&nbsp; →</TextLink>
                <TextLink href="/examples/">Explore examples</TextLink>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem medium={4} large={7} style={{ alignSelf: 'center' }}>
            <figure style={{ margin: 0 }}>
              <AspectRatio ratio={16 / 11}>
                <img src="/assets/alpina-type-specimen.webp" width="1280" height="880" fetchPriority="high"
                  alt="A red Alpina booklet with a cropped lowercase a, laid over a sheet of letterforms." />
              </AspectRatio>
              <figcaption>
                <Stack direction="row" justify="space-between" gap={2} style={{ paddingBlockStart: 'var(--al-space-2)' }}>
                  <Typography variant="caption">Alpina letterform study</Typography>
                  <Typography variant="caption"><TextLink href="/docs/guides/design/">Design notes →</TextLink></Typography>
                </Stack>
              </figcaption>
            </figure>
          </GridItem>
        </Grid>
        <Grid><GridItem><Separator weight="section" /></GridItem></Grid>
        <Grid as="section" aria-labelledby="inside" space="section">
          <GridItem medium={3} large={4}>
            <Stack gap={3} align="start" style={{ paddingBlockEnd: 'var(--al-space-5)' }}>
              <Typography as="h2" variant="display" id="inside">Type in use</Typography>
              <Typography style={{ maxWidth: '32ch' }}>One workshop notice in German, French and Italian. Choose a language to compare the lettering and the date.</Typography>
              <Stack direction="row" gap={2} columnGap={4}>
                <TextLink href="/docs/components/typography/">Typography</TextLink>
                <TextLink href="/docs/components/swiss-date/">SwissDate</TextLink>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem medium={5} large={7} start={{ large: 6 }}>
            <TypeSpecimen />
          </GridItem>
        </Grid>
        <Grid><GridItem><Separator /></GridItem></Grid>
        <Grid as="section" aria-labelledby="directory-preview" space="section">
          <GridItem medium={3} large={4}>
            <Stack gap={3} align="start" style={{ paddingBlockEnd: 'var(--al-space-5)' }}>
              <Typography as="h2" variant="display" id="directory-preview">Studio address book</Typography>
              <Typography style={{ maxWidth: '32ch' }}>A working example built with Alpina. Filter studios by canton and edit a postal address in Italian or German.</Typography>
              <Stack direction="row" gap={2} columnGap={4}>
                <TextLink href="/examples/bilingual-address-book/">Open the project →</TextLink>
                <TextLink href={repository + '/tree/main/recipes/rubrica'}>React source ↗</TextLink>
              </Stack>
            </Stack>
          </GridItem>
          <GridItem medium={5} large={7} start={{ large: 6 }}>
            <Table aria-label="Studios from the bilingual address book">
              <TableHeader><TableRow>
                <TableHead>Studio</TableHead><TableHead>City</TableHead><TableHead>Canton</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {initialContacts.slice(0, 4).map((studio) => (
                  <TableRow key={studio.id}>
                    <TableHead scope="row">{studio.recipient}</TableHead>
                    <TableCell>{studio.locality}</TableCell>
                    <TableCell>{studio.canton}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </GridItem>
        </Grid>
      </main>
      <Footer version={version} />
    </>
  )
}

const projects = [
  {
    name: 'Studio address book',
    description: 'Find a studio by canton, switch between Italian and German, and edit its postal address. Changes last until you reload the page.',
    href: '/examples/bilingual-address-book/',
    source: '/tree/main/recipes/rubrica',
    report: '/blob/main/recipes/rubrica/PROVA.md',
  },
  {
    name: 'Client directory',
    description: 'Filter client records by canton, edit a postal address in any of the four national languages, and sort orders by their total in Swiss francs.',
    href: '/examples/client-directory/',
    source: '/blob/main/catalog/overview.tsx',
  },
]

export function Examples() {
  return (
    <>
      <Masthead current="examples" />
      <main id="content" tabIndex={-1}>
        <Grid as="section" aria-labelledby="examples-title" space="cover">
          <GridItem>
            <Typography as="h1" variant="poster" id="examples-title">Examples</Typography>
          </GridItem>
          <GridItem medium={6} large={6}>
            <Typography variant="lead">Explore complete applications built with Alpina. Open a project to try it, or read the React source.</Typography>
          </GridItem>
        </Grid>
        {projects.map((project) => (
          <Grid as="article" key={project.href} space="compact">
            <GridItem><Separator weight="section" /></GridItem>
            <GridItem medium={4} large={6}>
              <Typography as="h2" variant="display"><TextLink variant="quiet" href={project.href}>{project.name}</TextLink></Typography>
            </GridItem>
            <GridItem medium={4} large={5} start={{ large: 8 }}>
              <Stack gap={4} align="start">
                <Typography measure="narrow">{project.description}</Typography>
                <Stack direction="row" gap={3} columnGap={5}>
                  <TextLink variant="action" href={project.href}>Open project →</TextLink>
                  <TextLink href={repository + project.source}>Source</TextLink>
                  {project.report && <TextLink href={repository + project.report}>Build report</TextLink>}
                </Stack>
              </Stack>
            </GridItem>
          </Grid>
        ))}
      </main>
      <Footer />
    </>
  )
}
