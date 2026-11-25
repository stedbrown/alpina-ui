import type { ReactNode } from 'react'
import {
  Grid, GridItem, GridOverlay, GridSpecimen, InlineCode, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Separator, Stack, Switch, TextLink, Typography,
} from 'alpina-ui'
import { ComparisonCode } from './comparison-code.js'
import { AppearancePair } from './appearance-pair.js'
import { TypeProof } from './type-proof.js'
import { AccessProof } from './access-proof.js'
import { TypeSpecimen } from './type-specimen.js'

const folios: Record<string, string> = {
  'grid-title': '02', 'type-title': '03', 'components-title': '04', 'appearance-title': '05',
  'access-title': '06', 'swiss-title': '07', 'migration-title': '08', 'install-title': '09',
}

export function SectionIntro({ id, title, text, children }: { id: string; title: string; text: string; children?: ReactNode }) {
  return <Stack align="start" gap={4}>
    <Typography variant="folio" numeric aria-hidden="true">{folios[id]}</Typography>
    <Typography as="h2" variant="display" id={id}>{title}</Typography>
    <Typography measure="narrow">{text}</Typography>{children}
  </Stack>
}

export function GridStudy() {
  return <Grid as="section" id="grid" width="site" space="chapter" align="start" surface="paper" aria-labelledby="grid-title">
    <GridItem medium={3} large={4}><SectionIntro id="grid-title" title="The grid" text="Four, eight or twelve columns. Follow one edge from the time to the title, then switch off the guides.">
      <Stack direction="row" gap={2} scripting="enabled"><Switch id="show-grid" defaultChecked aria-controls="programme-guides" /><Label htmlFor="show-grid">Show grid</Label></Stack>
      <TextLink href="/docs/components/grid/">Explore Grid →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}>
      <GridSpecimen label="Studio programme with column guides">
        <Grid align="end" space="compact"><GridItem><Typography variant="label">Public programme / March</Typography></GridItem>
          <GridItem><Typography as="h3" variant="title">Open studio</Typography></GridItem>
          <GridItem><Separator weight="section" /></GridItem>
          <GridItem small={1} medium={2} large={2}><Typography variant="label" numeric>10.00</Typography></GridItem>
          <GridItem small={3} medium={6} large={10}><Typography>Letterpress demonstration</Typography></GridItem>
          <GridItem small={1} medium={2} large={2}><Typography variant="label" numeric>14.00</Typography></GridItem>
          <GridItem small={3} medium={6} large={10}><Typography>Type design workshop</Typography></GridItem>
        </Grid>
        <GridOverlay id="programme-guides" placement="container" width="full" />
      </GridSpecimen>
    </GridItem>
  </Grid>
}

export function TypeStudy({ html }: { html: string }) {
  return <Grid as="section" width="site" space="chapter" id="type" surface="ink" aria-labelledby="type-title">
    <GridItem medium={3} large={4}><SectionIntro id="type-title" title="The typography" text="Compare a capital, a bowl and a descender. Set the size in pixels and the tracking in em.">
      <TextLink href="/docs/components/typography/">Explore Typography →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}><Stack scripting="enabled" data-landing-island="type" dangerouslySetInnerHTML={{ __html: html }} />
      <Stack scripting="none"><TypeProof interactive={false} /></Stack></GridItem>
  </Grid>
}

export function AppearanceStudy() {
  return <Grid as="section" width="site" space="chapter" surface="accent" data-al-theme="light" aria-labelledby="appearance-title">
    <GridItem medium={3} large={4}><SectionIntro id="appearance-title" title="Light and dark" text="Compare the same reading-room notice on paper and in reverse. Swap the proofs to judge both against either side of the page.">
      <Stack surface="paper" inset={2} direction="row" gap={2} scripting="enabled"><Switch id="proof-dark" aria-controls="appearance-proof" /><Label htmlFor="proof-dark">Swap proofs</Label></Stack>
      <TextLink href="/themes/">Open the theme builder →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}>
      <AppearancePair />
    </GridItem>
  </Grid>
}

export function AccessStudy({ html }: { html: string }) {
  return <Grid as="section" width="site" space="chapter" surface="paper" aria-labelledby="access-title">
    <GridItem medium={3} large={3}><SectionIntro id="access-title" title="Accessible by design" text="Reserve a reading desk with the keyboard. Increase the zoom to stack the fields, then follow the focus ring through the form.">
      <TextLink href="/docs/components/field/">Explore accessible fields →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={8} start={{ large: 5 }}><Stack id="access-proof" scripting="enabled" data-landing-island="access" dangerouslySetInnerHTML={{ __html: html }} />
      <Stack scripting="none"><AccessProof interactive={false} /></Stack></GridItem>
  </Grid>
}

export function SwissStudy() {
  return <Grid as="section" width="site" space="chapter" surface="ink" aria-labelledby="swiss-title">
    <GridItem medium={3} large={4}><SectionIntro id="swiss-title" title="Ready for Switzerland" text="Use the same components for Swiss work. Compare one invoice across the four national languages.">
      <TextLink href="/docs/components/swiss-qr-bill/">Print a QR-bill →</TextLink>
      <TextLink href="/docs/components/ahv-input/">Validate an AHV number →</TextLink>
      <TextLink href="/docs/guides/swiss/">Find cantonal holidays →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}><TypeSpecimen /></GridItem>
  </Grid>
}

export interface ComparisonForm { library: string; name: string; code: string; url: string }

export function MigrationStudy({ forms }: { forms: ComparisonForm[] }) {
  return <Grid as="section" width="site" space="chapter" surface="accent" data-al-theme="light" aria-labelledby="migration-title">
    <GridItem medium={4} large={5}><SectionIntro id="migration-title" title="From shadcn/ui" text="Set an edition label in both forms. The same React handler runs behind each set of controls.">
      <TextLink href="/docs/guides/migration/">Open the migration guide →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={4} large={5} start={{large:8}}><Stack surface="paper" inset={4}>
      <Table layout="fixed" aria-label="Edition form equivalents">
        <TableHeader><TableRow><TableHead scope="col">shadcn/ui</TableHead><TableHead scope="col">Alpina UI</TableHead></TableRow></TableHeader>
        <TableBody>{[['label + Input', 'Field + Input'], ['Button', 'Button'], ['grid gap-4', 'Stack gap={4}'], ['output', 'Typography as="output"']].map(([before, after]) =>
          <TableRow key={before}><TableCell>{before}</TableCell><TableCell>{after}</TableCell></TableRow>)}</TableBody>
      </Table>
    </Stack></GridItem>
    {forms.map(({ library, name, url, code }) => <GridItem key={library} medium={4} large={6}>
      <Stack surface="paper" inset={4} gap={4}>
        <Typography as="h3" variant="heading">{name}</Typography>
        <GridSpecimen label={name + ' preview'} tabIndex={-1} document={{src: url, title: name + ' edition label'}} />
        <Stack data-landing-island="comparison-code" data-name={name}><ComparisonCode library={name} code={code} /></Stack>
      </Stack>
    </GridItem>)}
  </Grid>
}

export function Installation({ html, command }: { html: string; command: string }) {
  return <Grid as="section" width="site" space="chapter" surface="paper" aria-labelledby="install-title">
    <GridItem medium={3} large={4}><SectionIntro id="install-title" title="Install in 30 seconds" text="Install the release archive in a React project. Import alpina-ui/styles.css once in the application entry point.">
      <TextLink href="/docs/guides/start/">Read the setup guide →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}><Stack scripting="enabled" data-landing-island="install" data-command={command} dangerouslySetInnerHTML={{ __html: html }} />
      <Stack scripting="none"><Typography><InlineCode>{command}</InlineCode></Typography></Stack></GridItem>
  </Grid>
}
