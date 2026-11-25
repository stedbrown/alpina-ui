import { Grid, GridItem, Stack, TextLink } from 'alpina-ui'
import { SectionIntro } from './landing-sections.js'
import { PrintDesk } from './print-desk.js'

export function HomeShowcase({ queue }: { queue: string }) {
  return <Grid as="section" id="component-showcase" aria-labelledby="components-title" width="site" space="chapter" surface="paper">
    <GridItem medium={3} large={4}><SectionIntro id="components-title" title="The components" text="Price an edition and send it to press. Each job keeps its paper, inks, quantity and quote in the production queue.">
      <TextLink href="/examples/">Explore complete projects →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={8} large={8} start={{large:5}}><Stack scripting="enabled" data-landing-island="queue" dangerouslySetInnerHTML={{ __html: queue }} />
      <Stack scripting="none"><PrintDesk interactive={false} /></Stack></GridItem>
  </Grid>
}
