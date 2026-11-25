import {
  Avatar, Figure, Grid, GridItem, Icon, iconNames, NavigationMenu, Separator,
  Stack, TextLink, Typography, type IconName,
} from 'alpina-ui'
import { HomeShowcase } from './home-showcase.js'
import { projects } from './projects.js'

const repository = 'https://github.com/stedbrown/alpina-ui'
type Section = 'home' | 'docs' | 'components' | 'icons' | 'themes' | 'blocks' | 'examples' | 'agents'

function GitHubLabel() {
  return <><Icon name="git-branch" size={18} />{' GitHub'}</>
}

export function Masthead({ current }: { current: Section }) {
  const links = [
    { href: '/docs/', label: 'Docs', current: current === 'docs' },
    { href: '/docs/components/', label: 'Components', current: current === 'components' },
    { href: '/blocks/', label: 'Blocks', current: current === 'blocks' },
    { href: '/icons/', label: 'Icons', current: current === 'icons' },
    { href: '/themes/', label: 'Themes', current: current === 'themes' },
    { href: '/examples/', label: 'Examples', current: current === 'examples' },
    { href: '/agents/', label: 'Agents', current: current === 'agents' },
  ]
  return (
    <Grid as="header" width="site" space="compact">
      <GridItem medium={3} large={3}>
        <TextLink variant="skip" href="#content">Skip to content</TextLink>
        <Stack direction="row" justify="space-between" gap={1} wrap={false}>
          <TextLink variant="quiet" href="/" aria-current={current === 'home' ? 'page' : undefined}>
            <Stack direction="row" gap={2} wrap={false}>
              <Avatar decorative size="sm" name="Alpina" src="/assets/alpina-mark.png" />
              <Typography as="span" variant="heading">Alpina UI</Typography>
            </Stack>
          </TextLink>
          <NavigationMenu label="Repository" orientation="horizontal" sections={[{ links: [{ href: repository, label: <GitHubLabel /> }] }]} />
        </Stack>
      </GridItem>
      <GridItem medium={5} large={5} start={{ large: 8 }}>
        <NavigationMenu label="Main navigation" orientation="horizontal" sections={[{ links }]} />
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
            <TextLink href={repository}><GitHubLabel /></TextLink>
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  )
}

const iconSamples: IconName[] = ['git-branch', 'grid', 'calendar', 'map-pin', 'sliders', 'book']

export function Landing({ version, count }: { version: string; count: number }) {
  return <>
    <Masthead current="home" />
    <main id="content" tabIndex={-1}>
      <Grid width="site"><GridItem><Separator /></GridItem></Grid>
      <Grid as="section" width="site" space="cover" align="end" aria-labelledby="home-title">
        <GridItem medium={4} large={7}>
          <Typography as="h1" variant="title" id="home-title"><Typography as="span" variant="inherit" tone="accent">Swiss</Typography> UI for React.</Typography>
        </GridItem>
        <GridItem medium={4} large={5}>
          <Stack gap={4} align="start">
            <Typography measure="narrow">{count} editable components and <TextLink href="/icons/">{iconNames.length} original icons</TextLink>. Build forms, data tables and multilingual interfaces on a Swiss typographic grid.</Typography>
            <Stack direction="row" gap={4}>
              <TextLink variant="action" href="/docs/components/">Browse components  <Icon name="arrow-right" size={18}/></TextLink>
              <TextLink href="/docs/">Installation</TextLink>
            </Stack>
          </Stack>
        </GridItem>
      </Grid>
      <HomeShowcase />
      <Grid width="site"><GridItem><Separator weight="section" /></GridItem></Grid>
      <Grid as="section" width="site" space="section" align="center" aria-labelledby="icons-title">
        <GridItem medium={4} large={5}>
          <Stack gap={3} align="start">
            <Typography as="h2" variant="display" id="icons-title">Alpina icons</Typography>
            <Typography measure="narrow">Pictograms for navigation, controls and Git workflows, drawn on a 24-unit grid. Use them at text size or scale them up.</Typography>
            <TextLink href="/icons/">Explore all {iconNames.length} icons <Icon name="arrow-right" size={16} /></TextLink>
          </Stack>
        </GridItem>
        <GridItem medium={4} large={6} start={{ large: 7 }}>
          <Stack direction="row" gap={5} justify="space-between" aria-hidden="true">
            {iconSamples.map(name => <Icon key={name} name={name} size={40} />)}
          </Stack>
        </GridItem>
      </Grid>
      <Grid width="site"><GridItem><Separator /></GridItem></Grid>
      <Grid as="section" width="site" space="section" aria-labelledby="projects-title">
        <GridItem medium={3} large={4}>
          <Stack gap={3} align="start">
            <Typography as="h2" variant="display" id="projects-title">Examples.</Typography>
            <Typography measure="narrow">Try a complete interaction, then open the project's React source.</Typography>
            <TextLink href="/examples/">All {projects.length} projects <Icon name="arrow-right" size={16} /></TextLink>
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
