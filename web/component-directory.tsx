import { Button, Field, Grid, GridItem, Input, Item, Stack, TextLink, Typography } from 'alpina-ui'
import { inventory } from '../catalog/inventory.js'
import { Masthead, Footer } from './pages.js'

export function ComponentDirectory() {
  const groups = [...new Set(inventory.map((entry) => entry[3]))]
  return <>
    <Masthead current="components" />
    <main id="content" tabIndex={-1}>
      <Grid width="site" space="cover">
        <GridItem medium={5} large={7}>
          <Stack gap={3}>
            <Typography as="h1" variant="title">Component index</Typography>
            <Typography>{inventory.length} React components. Open one to try it, inspect its API or copy the source.</Typography>
            <TextLink href="/status/">Check component status</TextLink>
          </Stack>
        </GridItem>
        <GridItem medium={3} large={4} start={{ large: 9 }}>
          <template id="component-filter">
            <Stack gap={2}>
              <Field label="Find a component">{(props) => <Input {...props} type="search" placeholder="Name, task or category" />}</Field>
              <Stack direction="row" justify="space-between">
                <Typography variant="caption" role="status" data-filter-count="">{inventory.length} components</Typography>
                <Button type="button" size="sm" variant="ghost" disabled>Clear</Button>
              </Stack>
            </Stack>
          </template>
        </GridItem>
      </Grid>
      {groups.map((group) => (
        <Grid key={group} as="section" width="site" space="compact" data-directory-group="" aria-label={group}>
          <GridItem><Typography as="h2" variant="heading">{group}</Typography></GridItem>
          {inventory.filter((entry) => entry[3] === group).map(([slug, name, title, , description]) => (
            <GridItem key={slug} medium={4} large={4} data-directory-entry={[slug, name, title, group, description].join(' ')}>
              <Item title={<TextLink href={'/docs/components/' + slug + '/'}>{name}</TextLink>} description={description} />
            </GridItem>
          ))}
        </Grid>
      ))}
    </main>
    <Footer />
  </>
}
