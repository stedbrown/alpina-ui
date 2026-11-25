import type { ReactNode } from 'react'
import {
  Badge, Collapsible, DescriptionList, Field, Grid, GridItem, GridOverlay, GridSpecimen, InlineCode, Label,
  Select, Separator, Stack, Switch, TextLink, Typography,
} from 'alpina-ui'
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

export function TypeStudy() {
  return <Grid as="section" width="site" space="chapter" id="type" surface="ink" aria-labelledby="type-title">
    <GridItem medium={3} large={4}><SectionIntro id="type-title" title="The typography" text="Look at the space between the letters. Change the scale and spacing of the same word.">
      <TextLink href="/docs/components/typography/">Explore Typography →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}><Stack gap={5}>
      <Typography variant="masthead" tracking="optical" id="type-proof">Grotesk</Typography>
      <Separator />
      <Stack direction="row" gap={5} align="end" scripting="enabled">
        <Field id="proof-scale" label="Type scale">{control => <Select {...control} defaultValue="masthead">
          <option value="heading">Heading</option><option value="display">Display</option><option value="masthead">Masthead</option>
        </Select>}</Field>
        <Field id="proof-spacing" label="Letter spacing">{control => <Select {...control} defaultValue="optical">
          <option value="optical">Optical</option><option value="normal">Normal</option>
        </Select>}</Field>
      </Stack>
    </Stack></GridItem>
  </Grid>
}

export function AppearanceStudy() {
  return <Grid as="section" width="site" space="chapter" surface="accent" data-al-theme="light" aria-labelledby="appearance-title">
    <GridItem medium={3} large={4}><SectionIntro id="appearance-title" title="Light and dark" text="Change the paper and ink of this reading-room notice. The rest of the page keeps its own appearance.">
      <Stack direction="row" gap={2} scripting="enabled"><Switch id="proof-dark" defaultChecked aria-controls="appearance-proof" /><Label htmlFor="proof-dark">Dark preview</Label></Stack>
      <TextLink href="/themes/">Open the theme builder →</TextLink>
    </SectionIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}>
      <Stack surface="ink" inset={6} gap={5} id="appearance-proof">
        <Stack direction="row" justify="space-between"><Typography variant="label">Library / Reading room</Typography><Badge>Open</Badge></Stack>
        <Typography as="h3" variant="display">Reference desk</Typography><Separator />
        <DescriptionList items={[{term:'Hours', detail:'09.00–17.00'},{term:'Location', detail:'Level 2'}]} />
      </Stack>
    </GridItem>
  </Grid>
}

export function AccessStudy({ html }: { html: string }) {
  return <Grid as="section" width="site" space="chapter" surface="paper" aria-labelledby="access-title">
    <GridItem medium={3} large={4}><SectionIntro id="access-title" title="Accessible by design" text="Tab to the name field, enter a name and hold a reading desk. Magnify the same form and compare the focus ring and status in system colors." /></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}><Stack id="access-proof" scripting="enabled" data-landing-island="access" dangerouslySetInnerHTML={{ __html: html }} />
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

export function MigrationStudy() {
  return <Grid as="section" width="site" space="chapter" surface="accent" data-al-theme="light" aria-labelledby="migration-title">
    <GridItem medium={3} large={4}><SectionIntro id="migration-title" title="From shadcn/ui" text="Start with a familiar component and compare its API. Migrate a single screen at a time." /></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}><Stack align="start" gap={4}>
      <Collapsible summary="Compare Button"><Typography>Both libraries accept <InlineCode>asChild</InlineCode> so a link can take button styling. Alpina supplies the square corners and focus ring in its stylesheet.</Typography></Collapsible>
      <TextLink href="/docs/guides/migration/">Compare components in the migration guide →</TextLink>
    </Stack></GridItem>
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
