import { Grid, GridItem, Stack, SwissDate, Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow, TextLink, Typography } from 'alpina-ui'
import { Masthead, Footer } from './pages.js'

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
      <Grid as="section" width="site" space="cover" aria-labelledby="status-title">
        <GridItem medium={6} large={8}><Stack gap={3}>
          <Typography as="h1" variant="title" id="status-title">Component status</Typography>
          <Typography measure="reading">Stable components have an established API. Beta components are available for use while their API develops.</Typography>
        </Stack></GridItem>
      </Grid>
      <Grid as="section" width="site" space="compact" aria-label="Component release status">
        <GridItem large={9}><Stack>
          <Typography measure="reading">Dates track changes to the component, its styles or its implementation dependencies.</Typography>
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
        </Stack></GridItem>
      </Grid>
    </main>
    <Footer />
  </>
}
