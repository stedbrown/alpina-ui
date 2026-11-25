import { PageRegion, Prose } from 'alpina-ui'
import { AppearanceButton } from './appearance-button.js'
import type { ReactNode } from 'react'
import {
  Avatar, Grid, GridItem, Icon, Label, NavigationMenu, Separator, Switch,
  Stack, TextLink, Typography,
} from 'alpina-ui'
import { AccessStudy, AppearanceStudy, GridStudy, Installation, MigrationStudy, SwissStudy, TypeStudy } from './landing-sections.js'
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
    <Grid as="footer" width="site" surface="ink" space={version ? "chapter" : "compact"}>
      {version && <GridItem><Typography variant="folio" numeric aria-hidden="true">10</Typography></GridItem>}
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


export function PageHeading({ title, summary, children }: { title: string; summary: ReactNode; children?: ReactNode }) {
  return <Grid as="section" width="site" space="section" align="start" aria-labelledby="page-title">
    <GridItem medium={4} large={7}><Typography as="h1" variant="title" id="page-title">{title}</Typography></GridItem>
    <GridItem medium={4} large={5}><Stack gap={5}>
      <Typography variant="lead" measure="narrow">{summary}</Typography>
      {children}
    </Stack></GridItem>
  </Grid>
}

export function Landing({ version, count, queue, command, installation, access, typeProof }: { version: string; count: number; queue: string; command: string; installation: string; access: string; typeProof: string }) {
  return <>
    <Masthead current="home" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <Grid as="section" id="cover" width="site" space="viewport" align="end" surface="accent" data-al-theme="light" guides entrance="sequence" aria-labelledby="home-title">
        <GridItem entranceStep={2}><Stack direction="row" justify="space-between" gap={2}>
          <Stack direction="row" align="baseline" gap={3} wrap={false}>
            <Typography variant="folio" numeric aria-hidden="true">01</Typography>
            <Typography variant="label">Open-source React library</Typography>
          </Stack>
          <Stack direction="row" gap={3}>
            <TextLink variant="action" href="/start-here/">Start here</TextLink>
            <Stack direction="row" gap={2} inset={1} surface="paper" scripting="enabled">
              <Switch id="cover-guides-toggle" aria-controls="cover-guides" defaultChecked />
              <Label htmlFor="cover-guides-toggle">Column guides</Label>
            </Stack>
          </Stack>
        </Stack></GridItem>
        <GridItem entranceStep={1}><Typography as="h1" variant="masthead" responsive id="home-title">Swiss design<br /> for React.</Typography></GridItem>
        {[
          [count, 'Components'], [12, 'Grid columns'], [4, 'National languages'], ['2.2', 'WCAG AA target'],
        ].map(([value, label]) => <GridItem key={label} entranceStep={3} small={2} medium={2} large={3}>
          <Stack gap={1}><Separator weight="section" />
            <Typography variant="title" numeric tone="ink">{value}</Typography>
            <Typography variant="label">{label}</Typography>
          </Stack>
        </GridItem>)}
        <GridItem medium={4} large={5} entranceStep={3}><Typography variant="lead" id="cover-intro">A precise grid, expressive type and accessible controls for the web.</Typography></GridItem>
        <GridItem medium={4} large={5} entranceStep={3} start={{ large: 8 }}><Stack direction="row" gap={4} columnGap={6}>
          <TextLink href="/docs/components/">Browse components ({count})</TextLink>
        </Stack></GridItem>
      </Grid>
      <GridStudy />
      <TypeStudy html={typeProof} />
      <HomeShowcase queue={queue} />
      <AppearanceStudy />
      <AccessStudy html={access} />
      <SwissStudy />
      <MigrationStudy />
      <Installation html={installation} command={command} />
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
