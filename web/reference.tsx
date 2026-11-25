import { Grid, GridItem, Prose, Stack, TextLink, Typography } from 'alpina-ui'
import { Masthead, Footer } from './pages.js'
import { inventory } from '../catalog/inventory.js'

export { Landing, Examples } from './pages.js'
export { ComponentDirectory } from './component-directory.js'
export { Icons } from './icons.js'
export { projects } from './projects.js'
export { inventory }

export function ReferencePage({ html, agents = false }: { html: string; agents?: boolean }) {
  return <>
    <Masthead current={agents ? 'agents' : 'docs'} />
    <Grid as="main" id="content" space="section">
      <GridItem medium={6} large={8} start={{ medium: 2, large: 3 }}>
        <Prose dangerouslySetInnerHTML={{ __html: html }} />
      </GridItem>
    </Grid>
    <Footer />
  </>
}

export function ExampleIntroduction({ title, description }: { title: string; description: string }) {
  return <>
    <Masthead current="examples" />
    <Grid as="main" id="content" space="section">
      <GridItem large={8}>
        <Stack gap={6}>
          <Typography as="h1" variant="display">{title}</Typography>
          <Typography measure="reading">{description}</Typography>
          <Typography>Enable JavaScript to use this example.</Typography>
          <TextLink href="/examples/">Browse examples</TextLink>
        </Stack>
      </GridItem>
    </Grid>
    <Footer />
  </>
}
