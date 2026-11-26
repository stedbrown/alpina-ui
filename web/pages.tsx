import { PageRegion, Prose } from 'alpina-ui'
import { Masthead, repository } from './masthead.js'
export { Masthead } from './masthead.js'
import type { ReactNode } from 'react'
import {
  Avatar, Grid, GridItem, Icon, Separator,
  Stack, TextLink, Typography,
} from 'alpina-ui'
import { GridStudy, Installation, MigrationStudy } from './landing-sections.js'
import { AgentStudy, InterfaceStudy, QrStudy, QualityStudy, SwissToolkit } from './home-sections.js'
import type { ComparisonForm } from './landing-sections.js'
import { projects } from './projects.js'

function GitHubLabel() {
  return <><Icon name="github" size={18} />{' GitHub'}</>
}

export function Footer({ version }: { version?: string } = {}) {
  if (version) return <Grid as="footer" width="site" surface="ink" space="chapter" align="start">
    <GridItem medium={3} large={4}><Stack align="start" gap={6}>
      <Typography variant="folio" numeric aria-hidden="true">10</Typography>
      <TextLink href="/" variant="quiet" aria-label="Alpina UI home">
        <Stack direction="row" gap={3} wrap={false}>
          <Avatar decorative name="Alpina" size="lg" src="/assets/logo.svg" />
          <Typography as="span" variant="heading">Alpina UI</Typography>
        </Stack>
      </TextLink>
      <TextLink href="/docs/guides/release/">Version {version}</TextLink>
    </Stack></GridItem>
    <GridItem medium={2} large={2} start={{ large: 6 }}><Stack role="navigation" aria-label="Footer library links" align="start" gap={2}>
      <Typography as="h2" variant="label">Library</Typography>
      <TextLink href="/start-here/">Start here</TextLink>
      <TextLink href="/docs/">Documentation</TextLink>
      <TextLink href="/docs/components/">Components</TextLink>
      <TextLink href="/examples/">Examples</TextLink>
      <TextLink href="/kit/">Designer kit</TextLink>
    </Stack></GridItem>
    <GridItem medium={3} large={2}><Stack role="navigation" aria-label="Footer project links" align="start" gap={2}>
      <Typography as="h2" variant="label">Project</Typography>
      <TextLink href="/principles/">Design principles</TextLink>
      <TextLink href="/status/">Component status</TextLink>
      <TextLink href={repository}><GitHubLabel /></TextLink>
      <TextLink href={repository + '/blob/main/LICENSE'}>MIT license</TextLink>
    </Stack></GridItem>
    <GridItem medium={3} large={3}><Stack role="navigation" aria-label="Getting started by language" align="start" gap={2}>
      <Typography as="h2" variant="label">Guide language</Typography>
      {[
        ['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français'], ['it', 'Italiano'],
      ].map(([lang, name]) => <TextLink key={lang} lang={lang} hrefLang={lang}
        href={'/docs/guides/start/' + (lang === 'en' ? '' : lang + '/')}>{name}</TextLink>)}
    </Stack></GridItem>
  </Grid>
  return (
    <Grid as="footer" width="site" surface="ink" space="compact">
      <GridItem>
        <Stack direction="row" justify="space-between" align="baseline" gap={2} columnGap={6}>
          <TextLink href="/" variant="quiet"><Typography as="span" variant="label">Alpina UI</Typography></TextLink>
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

export function Landing({ version, count, command, islands, migration }: { version: string; count: number; command: string; islands: Record<string, string>; migration: ComparisonForm[] }) {
  return <>
    <Masthead current="home" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <Grid as="section" id="cover" width="site" space="viewport" align="end" surface="accent" data-al-theme="light" guides entrance="sequence" aria-labelledby="home-title">
        <GridItem entranceStep={2}><Stack direction="row" justify="space-between" gap={2}>
          <Stack direction="row" align="baseline" gap={3} wrap={false}>
            <Typography variant="folio" numeric aria-hidden="true">01</Typography>
            <Typography variant="label">Open-source React library</Typography>
          </Stack>
          <TextLink variant="action" href="/start-here/">Start here</TextLink>
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
        <GridItem medium={4} large={5} entranceStep={3}><Typography variant="lead" id="cover-intro">A precise grid, expressive type and accessible controls. With QR-bill, AHV and cantons built in.</Typography></GridItem>
        <GridItem medium={4} large={5} entranceStep={3} start={{ large: 8 }}><Stack direction="row" gap={4} columnGap={6}>
          <TextLink href="/docs/components/">Browse components ({count})</TextLink>
          <TextLink href="#qr-bill">Try the QR-bill</TextLink>
        </Stack></GridItem>
      </Grid>
      <InterfaceStudy html={islands.dashboard} />
      <SwissToolkit html={islands.swiss} />
      <QrStudy html={islands.qr} />
      <GridStudy />
      <QualityStudy />
      <MigrationStudy forms={migration} />
      <AgentStudy skill={islands.skill} mcp={islands.mcp} />
      <Installation html={islands.install} command={command} />
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
