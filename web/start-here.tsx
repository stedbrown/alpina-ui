import { Grid, GridItem, PageRegion, Separator, Stack, TextLink, Typography } from 'alpina-ui'
import { Footer, Masthead, PageHeading } from './pages.js'

const paths = [
  { title: 'I’m a developer', href: '/docs/guides/start/', detail: 'Install the package, load its stylesheet and render your first component.', action: 'Set up React' },
  { title: 'I’m a designer', href: '/kit/', detail: 'Download the column grids, type scale and design tokens for your design tool.', action: 'Open the designer kit' },
  { title: 'I’m coming from shadcn', href: '/docs/guides/migration/', detail: 'Match the components you use today with their Alpina equivalents.', action: 'Read the migration guide' },
] as const

export function StartHere() {
  return <>
    <Masthead current="docs" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <PageHeading title="Start here" summary="Choose a starting point for your work." />
      {paths.map(path => <Grid as="section" key={path.href} width="site" space="compact">
        <GridItem><Separator /></GridItem>
        <GridItem medium={4} large={6}><Typography as="h2" variant="display">{path.title}</Typography></GridItem>
        <GridItem medium={4} large={5} start={{ large: 8 }}><Stack align="start" gap={3}>
          <Typography measure="narrow">{path.detail}</Typography><TextLink href={path.href}>{path.action} →</TextLink>
        </Stack></GridItem>
      </Grid>)}
    </PageRegion>
    <Footer />
  </>
}
