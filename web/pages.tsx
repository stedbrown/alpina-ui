import {
  Avatar, DescriptionList, Figure, Grid, GridItem, NavigationMenu, Separator,
  Stack, TextLink, Typography,
} from 'alpina-ui'
import { TypeSpecimen } from './type-specimen.js'
import { projects } from './projects.js'

const repository = 'https://github.com/stedbrown/alpina-ui'
type Section = 'home' | 'docs' | 'examples' | 'agents'

export function Masthead({ current }: { current: Section }) {
  const links = [
    { href: '/docs/', label: 'Docs', current: current === 'docs' },
    { href: '/examples/', label: 'Examples', current: current === 'examples' },
    { href: '/agents/', label: 'Agent tools', current: current === 'agents' },
    { href: repository, label: 'GitHub ↗' },
  ]
  return (
    <Grid as="header" width="site" space="compact">
      <GridItem>
        <TextLink variant="skip" href="#content">Skip to content</TextLink>
        <Stack direction="row" justify="space-between" gap={1} columnGap={6}>
          <TextLink variant="quiet" href="/" aria-current={current === 'home' ? 'page' : undefined}>
            <Stack direction="row" gap={2} wrap={false}>
              <Avatar decorative size="sm" name="Alpina" src="/assets/alpina-mark.png" />
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
    <Grid as="footer" width="site" surface="ink" space="compact">
      <GridItem>
        <Stack direction="row" justify="space-between" align="baseline" gap={2} columnGap={6}>
          <TextLink href="/" variant="quiet"><Typography as="span" variant="label">Alpina UI{version && ' · v' + version}</Typography></TextLink>
          <Stack direction="row" gap={4}>
            <TextLink href={repository + '/blob/main/LICENSE'}>MIT license</TextLink>
            <TextLink href={repository}>GitHub ↗</TextLink>
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  )
}

const startingPoints = [
  { term: 'Collect an address', detail: <Stack gap={1}>
    <Typography>Translated field names and validation for all four Swiss national languages.</Typography>
    <TextLink href="/docs/components/swiss-address-form/">Swiss address form →</TextLink>
  </Stack> },
  { term: 'Review records', detail: <Stack gap={1}>
    <Typography>Sort rows by their underlying values while displaying formatted dates and francs.</Typography>
    <TextLink href="/docs/components/data-table/">Data table →</TextLink>
  </Stack> },
  { term: 'Guide a decision', detail: <Stack gap={1}>
    <Typography>Offer contextual actions and ask for confirmation before deleting a record.</Typography>
    <Stack direction="row" gap={3}><TextLink href="/docs/components/dropdown-menu/">Dropdown menu</TextLink><TextLink href="/docs/components/alert-dialog/">Alert dialog</TextLink></Stack>
  </Stack> },
]

export function Landing({ version, count }: { version: string; count: number }) {
  return <>
    <Masthead current="home" />
    <main id="content" tabIndex={-1}>
      <Grid width="site"><GridItem><Separator /></GridItem></Grid>
      <Grid as="section" width="site" space="cover" align="center" aria-labelledby="home-title">
        <GridItem medium={8} large={6}>
          <Stack gap={5} align="start">
            <Typography variant="label">Open source · TypeScript · MIT</Typography>
            <Typography as="h1" variant="title" id="home-title"><Typography as="span" variant="inherit" tone="accent">Swiss</Typography> UI components for React.</Typography>
            <Typography measure="narrow">Build forms, tables and multilingual workflows with {count} components. Install the package or copy individual components into your project and edit the source.</Typography>
            <Stack direction="row" gap={3} columnGap={5}>
              <TextLink variant="action" href="/docs/components/">Browse components →</TextLink>
              <TextLink href="/docs/">Installation</TextLink>
            </Stack>
          </Stack>
        </GridItem>
        <GridItem medium={8} large={5} start={{ large: 8 }}>
          <TypeSpecimen />
        </GridItem>
      </Grid>
      <Grid width="site"><GridItem><Separator weight="section" /></GridItem></Grid>
      <Grid as="section" width="site" space="section" aria-labelledby="tasks-title">
        <GridItem medium={3} large={4}>
          <Stack gap={3} align="start">
            <Typography as="h2" variant="display" id="tasks-title">Start with a task.</Typography>
            <Typography measure="narrow">Each component has a working preview, usage notes, a typed API and the source code.</Typography>
          </Stack>
        </GridItem>
        <GridItem medium={5} large={7} start={{ large: 6 }}>
          <DescriptionList aria-label="Components by task" items={startingPoints} />
        </GridItem>
      </Grid>
      <Grid width="site"><GridItem><Separator /></GridItem></Grid>
      <Grid as="section" width="site" space="section" aria-labelledby="projects-title">
        <GridItem medium={3} large={4}>
          <Stack gap={3} align="start">
            <Typography as="h2" variant="display" id="projects-title">Examples.</Typography>
            <Typography measure="narrow">Try a complete interaction, then open the project's React source.</Typography>
            <TextLink href="/examples/">All four projects →</TextLink>
          </Stack>
        </GridItem>
        <GridItem medium={5} large={7} start={{ large: 6 }}>
          <Stack gap={4}>{projects.slice(0, 2).map((project) =>
            <Stack key={project.slug} gap={1} align="start">
              <Typography as="h3" variant="heading"><TextLink href={'/examples/' + project.slug + '/'}>{project.title}</TextLink></Typography>
              <Typography measure="reading">{project.description}</Typography>
            </Stack>
          )}</Stack>
        </GridItem>
      </Grid>
      <Grid width="site"><GridItem><Separator /></GridItem></Grid>
      <Grid as="section" width="site" space="section" align="center" aria-labelledby="design-title">
        <GridItem medium={4} large={5}>
          <Figure image={{ src: '/assets/alpina-type-specimen.webp', alt: 'A red Alpina booklet over a sheet of printed letterforms.', width: 1280, height: 880, loading: 'lazy' }}
            caption="Alpina letterform study" />
        </GridItem>
        <GridItem medium={4} large={5} start={{ large: 7 }}>
          <Stack gap={4} align="start">
            <Typography as="h2" variant="display" id="design-title">The Swiss grid.</Typography>
            <Typography measure="narrow">Four, eight or twelve columns align labels, actions and figures as the space changes. A four-pixel spacing unit gives forms and editorial pages the same rhythm.</Typography>
            <TextLink href="/docs/guides/design/">Read the design notes →</TextLink>
          </Stack>
        </GridItem>
      </Grid>
    </main>
    <Footer version={version} />
  </>
}

export function Examples() {
  return <>
    <Masthead current="examples" />
    <main id="content" tabIndex={-1}>
      <Grid as="section" width="site" space="cover" aria-labelledby="examples-title">
        <GridItem><Typography as="h1" variant="title" id="examples-title">Example projects</Typography></GridItem>
        <GridItem large={7}><Typography measure="narrow">Four applications built with Alpina. Try a workflow, then read the same source that runs it here.</Typography></GridItem>
      </Grid>
      {projects.map((project) =>
        <Grid as="article" width="site" key={project.slug} space="compact">
          <GridItem><Separator /></GridItem>
          <GridItem medium={4} large={5}><Typography as="h2" variant="display"><TextLink variant="quiet" href={'/examples/' + project.slug + '/'}>{project.title}</TextLink></Typography></GridItem>
          <GridItem medium={4} large={6} start={{ large: 7 }}>
            <Stack gap={3} align="start">
              <Typography measure="narrow">{project.description}</Typography>
              <Stack direction="row" gap={3} columnGap={5}>
                <TextLink variant="action" href={'/examples/' + project.slug + '/'}>{project.action} →</TextLink>
                <TextLink href={repository + project.source}>React source ↗</TextLink>
                {project.report && <TextLink href={repository + project.report}>Build report</TextLink>}
              </Stack>
            </Stack>
          </GridItem>
        </Grid>
      )}
    </main>
    <Footer />
  </>
}
