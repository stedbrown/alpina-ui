import { PageRegion, Prose } from 'alpina-ui'
import { AppearanceButton } from './appearance-button.js'
import type { ReactNode } from 'react'
import {
  Avatar, Figure, Grid, GridItem, Icon, iconNames, NavigationMenu, Separator,
  Stack, TextLink, Typography, type IconName,
} from 'alpina-ui'
import { HomeShowcase } from './home-showcase.js'
import { projects } from './projects.js'

const repository = 'https://github.com/stedbrown/alpina-ui'
type Section = 'home' | 'kit' | 'docs' | 'components' | 'icons' | 'themes' | 'blocks' | 'examples' | 'agents' | 'principles'

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
    { href: '/principles/', label: 'Principles', current: current === 'principles' },
    { href: '/examples/', label: 'Examples', current: current === 'examples' },
    { href: '/agents/', label: 'Agents', current: current === 'agents' },
  ]
  return (
    <Grid as="header" width="site" space="compact">
      <GridItem>
        <TextLink variant="skip" href="#content">Skip to content</TextLink>
        <Stack direction="row" justify="space-between" align="start" gap={1} wrap={false}>
          <Stack direction="row" gap={1} wrap={false}>
            <TextLink variant="quiet" href="/" aria-label="Alpina UI" aria-current={current === 'home' ? 'page' : undefined}>
              <Stack direction="row" gap={1} wrap={false}>
                <Avatar decorative size="sm" name="Alpina" src="/assets/logo.svg" />
                <Typography as="span" variant="label">Alpina</Typography>
              </Stack>
            </TextLink>
            <TextLink href={repository} variant="quiet" aria-label="GitHub" title="GitHub repository"><Typography as="span" variant="label"><GitHubLabel /></Typography></TextLink>
          </Stack>
          <NavigationMenu label="Main navigation" orientation="horizontal" align="end" collapseLabel="Menu" sections={[{ links }]} />
          <AppearanceButton />
        </Stack>
      </GridItem>
      <GridItem><Separator /></GridItem>
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
            <TextLink href="/kit/">Designer kit</TextLink>
            <TextLink href="/status/">Component status</TextLink>
            <TextLink href={repository}><GitHubLabel /></TextLink>
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  )
}

const iconSamples: IconName[] = ['git-branch', 'grid', 'calendar', 'map-pin', 'sliders', 'book']

export function PageHeading({ title, summary, children }: { title: string; summary: ReactNode; children?: ReactNode }) {
  return <Grid as="section" width="site" space="section" align="start" aria-labelledby="page-title">
    <GridItem medium={4} large={7}><Typography as="h1" variant="title" id="page-title">{title}</Typography></GridItem>
    <GridItem medium={4} large={5}><Stack gap={5}>
      <Typography variant="lead" measure="narrow">{summary}</Typography>
      {children}
    </Stack></GridItem>
  </Grid>
}

export function Landing({ version, count }: { version: string; count: number }) {
  return <>
    <Masthead current="home" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <Grid as="section" width="site" space="cover" align="end" aria-labelledby="home-title">
        <GridItem medium={4} large={7}>
          <Typography as="h1" variant="title" id="home-title"><Typography as="span" variant="inherit" tone="accent">Swiss UI</Typography><br /> for React.</Typography>
        </GridItem>
        <GridItem medium={4} large={4} start={{ large: 9 }}>
          <Stack gap={5}>
            <Typography variant="lead" measure="narrow">React components for Swiss addresses, payments and multilingual forms.</Typography>
            <Stack direction="row" gap={4}>
              <TextLink variant="action" href="/docs/components/">Browse components ({count})  <Icon name="arrow-right" size={18}/></TextLink>
              <TextLink href="/start-here/">Start here</TextLink>
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
            <Typography as="h2" variant="display" id="projects-title">Examples</Typography>
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
          <Stack gap={4} align="start">
            <Typography as="h2" variant="display" id="design-title">The Swiss grid</Typography>
            <Typography measure="narrow">Four, eight or twelve columns align labels, actions and figures as the space changes. A four-pixel spacing unit gives forms and editorial pages the same rhythm.</Typography>
            <TextLink href="/principles/">Explore the design principles →</TextLink>
            <TextLink href="/kit/">Download the designer kit →</TextLink>
            <TextLink href="/docs/guides/design/">Read the design notes →</TextLink>
          </Stack>
        </GridItem>
        <GridItem medium={4} large={5} start={{ large: 7 }}>
          <Figure image={{ src: '/assets/alpina-type-specimen.webp', alt: 'A red Alpina booklet over a sheet of printed letterforms.', width: 1280, height: 880, loading: 'lazy' }}
            caption="Alpina letterform study" />
        </GridItem>
      </Grid>
    </PageRegion>
    <Footer version={version} />
  </>
}

export function Examples({ directoryStory }: { directoryStory: string }) {
  return <>
    <Masthead current="examples" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <PageHeading title="Example projects" summary="Try the complete workflows, then open the React source that runs each one." />
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
      <Grid as="section" width="site" space="section" aria-label="Address book case study">
        <GridItem medium={7} large={8}>
          <Stack gap={3} align="start">
            <Prose dangerouslySetInnerHTML={{ __html: directoryStory }} />
            <TextLink href="/examples/bilingual-address-book/">Open the IT / DE address book</TextLink>
            <TextLink href="/catalog.html#project/bilingual-address-book">Inspect the project files offline</TextLink>
          </Stack>
        </GridItem>
      </Grid>
      <Grid as="section" width="site" space="section" aria-labelledby="integrations-title">
        <GridItem medium={4} large={5}>
          <Typography as="h2" variant="display" id="integrations-title">Framework integrations</Typography>
        </GridItem>
        <GridItem medium={4} large={6} start={{ large: 7 }}>
          <Stack align="start">
            <Typography measure="narrow">Build and run these projects locally. Each includes a browser test against its production build.</Typography>
            <TextLink href={repository + '/tree/main/integrations/next-app-router'}>Next.js · Billing preferences</TextLink>
            <TextLink href={repository + '/tree/main/integrations/vite-react-router'}>React Router · Invoice register</TextLink>
            <TextLink href={repository + '/tree/main/integrations/swiss-form'}>React Hook Form and Zod · Supplier details</TextLink>
          </Stack>
        </GridItem>
      </Grid>
    </PageRegion>
    <Footer />
  </>
}
