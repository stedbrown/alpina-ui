import { PageRegion } from 'alpina-ui'
import { Button, Field, Grid, GridItem, Input, Item, Separator, Stack, TextLink, Typography } from 'alpina-ui'
import { inventory } from '../catalog/inventory.js'
import { Masthead, Footer, PageHeading } from './pages.js'

export function ComponentDirectory() {
  const groups = [...new Set(inventory.map((entry) => entry[3]))]
  return <>
    <Masthead current="components" />
    <PageRegion as="main" id="content" tabIndex={-1}>
      <PageHeading title="Component index" summary={`Try ${inventory.length} React components, inspect their APIs and copy the source.`}>
          <template id="component-filter">
            <Stack gap={2}>
              <Field label="Find a component">{(props) => <Input {...props} type="search" placeholder="Name, task or category" />}</Field>
              <Stack direction="row" justify="space-between">
                <Typography variant="caption" role="status" data-filter-count="">{inventory.length} components</Typography>
                <Button type="button" size="sm" variant="ghost" disabled>Clear</Button>
              </Stack>
            </Stack>
          </template>
          <Stack align="start"><TextLink href="/status/">Check component status</TextLink></Stack>
      </PageHeading>
      {groups.map((group) => (
        <Grid key={group} as="section" width="site" space="compact" data-directory-group="" aria-label={group}>
          <GridItem><Separator weight="section" /></GridItem>
          <GridItem medium={2} large={4}><Typography as="h2" variant="heading">{group}</Typography></GridItem>
          <GridItem medium={6} large={8} subgrid="columns">
            {inventory.filter((entry) => entry[3] === group).map(([slug, name, title, , description]) => (
              <GridItem asChild key={slug} medium={3} large={4} data-directory-entry={[slug, name, title, group, description].join(' ')}>
                <Item title={<TextLink href={'/docs/components/' + slug + '/'}>{name}</TextLink>} description={description} />
              </GridItem>
            ))}
          </GridItem>
        </Grid>
      ))}
    </PageRegion>
    <Footer />
  </>
}
