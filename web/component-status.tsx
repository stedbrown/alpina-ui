import { Grid, GridItem, SwissDate, Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow, TextLink, Typography } from 'alpina-ui'
import { Masthead, Footer, PageHeading } from './pages.js'

interface ComponentRecord {
  slug: string
  name: string
  stage: 'Stable' | 'Beta'
  changed: string
}

export function ComponentStatus({ records }: { records: ComponentRecord[] }) {
  return <>
    <Masthead current="components" />
    <main id="content" tabIndex={-1}>
      <PageHeading title="Component status" summary="Stable components have an established API. Beta components are available for use while their API develops." />
      <Grid as="section" width="site" space="compact" aria-label="Component release status">
        <GridItem medium={3} large={4}>
          <Typography measure="reading">Dates track changes to the component, its styles or its implementation dependencies.</Typography>
          <TextLink href="/docs/guides/beta-review/">Read the 1.0 Beta recommendations</TextLink>
        </GridItem>
        <GridItem medium={5} large={8}>
          <Table aria-label="Component release status">
            <TableHeader><TableRow><TableHead>Component</TableHead><TableHead>Stage</TableHead><TableHead>Last change</TableHead></TableRow></TableHeader>
            <TableBody>{records.map(record =>
              <TableRow key={record.slug}>
                <TableCell><TextLink href={'/docs/components/' + record.slug + '/'}>{record.name}</TextLink></TableCell>
                <TableCell>{record.stage}</TableCell>
                <TableCell><SwissDate value={record.changed} locale="de-CH" /></TableCell>
              </TableRow>
            )}</TableBody>
          </Table>
        </GridItem>
      </Grid>
    </main>
    <Footer />
  </>
}
