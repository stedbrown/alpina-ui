import { Grid, GridItem, Icon, Separator, Stack, TextLink, Typography } from 'alpina-ui'
import { Footer, Masthead, PageHeading } from './pages.js'

export const blocks = [
  { slug: 'login', title: 'Login', detail: 'An email and password form with validation, submission state and an application sign-in callback.' },
  { slug: 'dashboard', title: 'Dashboard', detail: 'An invoice ledger with a reporting period, a chart and a sortable table of CHF amounts.' },
  { slug: 'account-settings', title: 'Account settings', detail: 'Edit a profile, choose a language and save email preferences. Discard changes to recover the last saved values.' },
  { slug: 'pricing', title: 'CHF pricing', detail: 'Compare plans by billing interval and download a quote or connect your checkout.' },
] as const
type Block = (typeof blocks)[number]
const source = (slug: string) => 'https://github.com/stedbrown/alpina-ui/blob/main/blocks/' + slug + '.tsx'

export function Blocks() {
  return <>
    <Masthead current="blocks" />
    <main id="content" tabIndex={-1}>
      <PageHeading title="Page blocks" summary="Four complete React pages. Try a page, then copy its TypeScript file with the CLI." />
      {blocks.map(block => <Grid key={block.slug} as="article" width="site" space="compact">
        <GridItem><Separator /></GridItem>
        <GridItem medium={4} large={7}><Typography as="h2" variant="display"><TextLink variant="quiet" href={'/blocks/' + block.slug + '/'}>{block.title}</TextLink></Typography></GridItem>
        <GridItem medium={4} large={5}>
          <Stack gap={3} align="start">
            <Typography measure="narrow">{block.detail}</Typography>
            <Stack direction="row"><TextLink variant="action" href={'/blocks/' + block.slug + '/'}>Open page <Icon name="arrow-right" size={16} /></TextLink>
              <TextLink href={source(block.slug)}>React source</TextLink></Stack>
          </Stack>
        </GridItem>
      </Grid>)}
    </main><Footer />
  </>
}

export function BlockPage({ block, preview }: {block: Block; preview: string}) {
  return <>
    <Masthead current="blocks" />
    <Grid width="site" space="compact" surface="ink"><GridItem>
      <Stack direction="row" justify="space-between">
        <TextLink href="/blocks/"><Icon name="arrow-left" size={16} /> All blocks</TextLink>
        <Typography as="span" variant="label"><code>alpina add block/{block.slug}</code></Typography>
        <TextLink href={source(block.slug)}>React source</TextLink>
      </Stack>
    </GridItem></Grid>
    {block.slug === 'login' && <Grid width="site" space="compact"><GridItem><Typography variant="caption">
      Sign in with <strong>demo@example.org</strong> and the password <strong>atelier-demo</strong>. The preview checks these sample credentials locally.
    </Typography></GridItem></Grid>}
    <div id="content" tabIndex={-1} data-block-preview={block.slug} dangerouslySetInnerHTML={{ __html: preview }} />
    <Footer />
  </>
}
