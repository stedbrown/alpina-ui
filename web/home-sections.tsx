import type { ReactNode } from 'react'
import { CodeBlock, Grid, GridItem, InlineCode, PageRegion, Stack, TextLink, Typography } from 'alpina-ui'
import { DashboardBlock } from '../blocks/dashboard.js'
import { InstallCommand } from './landing-samples.js'
import { QrDesk, SwissDesk } from './home-live.js'

export const skillCommand = 'npx skills add stedbrown/alpina-ui --skill alpina-ui'
export const mcpConfig = JSON.stringify({ mcpServers: { 'alpina-ui': {
  command: 'node', args: ['/absolute/path/to/project/node_modules/alpina-ui/cli/alpina.mjs', 'mcp'] } } }, null, 2)

/** The interactive homepage samples. The site renders each one on the server and hydrates it near the viewport. */
export function homeIsland(name: string, data: { command?: string } = {}) {
  switch (name) {
    case 'dashboard': return <DashboardBlock as="div" headingLevel={3} />
    case 'swiss': return <SwissDesk />
    case 'qr': return <QrDesk />
    case 'skill': return <CodeBlock label="Terminal" code={skillCommand} />
    case 'mcp': return <CodeBlock label="MCP client configuration" code={mcpConfig} />
    case 'install': return <InstallCommand command={data.command!} />
    default: return null
  }
}
export const homeIslandNames = ['dashboard', 'swiss', 'qr', 'skill', 'mcp', 'install'] as const

export function Island({ name, html, command }: { name: string; html: string; command?: string }) {
  return <Stack scripting="enabled" data-landing-island={name} data-command={command} dangerouslySetInnerHTML={{ __html: html }} />
}

export function ChapterIntro({ folio, id, title, text, children }: { folio: string; id: string; title: ReactNode; text: string; children?: ReactNode }) {
  return <Stack align="start" gap={4}>
    <Typography variant="folio" numeric aria-hidden="true">{folio}</Typography>
    <Typography as="h2" variant="display" id={id}>{title}</Typography>
    <Typography measure="narrow">{text}</Typography>{children}
  </Stack>
}

export function InterfaceStudy({ html }: { html: string }) {
  // The dashboard block brings its own site grid, so it sits beside the intro grid rather than inside a column.
  return <PageRegion as="section" id="interfaces" aria-labelledby="interfaces-title">
    <Grid width="site" space="chapter" align="end" surface="paper">
      <GridItem medium={4} large={5}><ChapterIntro folio="02" id="interfaces-title" title="Real interfaces"
        text="Not a gallery of buttons. This invoice dashboard is one copyable block: filter the period, search a client, sort the CHF column." /></GridItem>
      <GridItem medium={4} large={4} start={{ large: 9 }}><Stack gap={2} align="start">
        <TextLink href="/blocks/dashboard/">Copy the dashboard block →</TextLink>
        <TextLink href="/blocks/">See all page blocks →</TextLink>
      </Stack></GridItem>
    </Grid>
    <Island name="dashboard" html={html} />
  </PageRegion>
}

export function SwissToolkit({ html }: { html: string }) {
  return <Grid as="section" id="swiss" width="site" space="chapter" align="start" surface="ink" aria-labelledby="swiss-title">
    <GridItem medium={3} large={4}><ChapterIntro folio="03" id="swiss-title" title="Built for Switzerland"
      text="Inputs that know AHV check digits, Swiss IBANs and every postcode. Type 1003 or 6900: the town, the canton and its next public holidays follow, in four national languages.">
      <TextLink href="/docs/guides/swiss/">Read the Swiss guide →</TextLink>
      <TextLink href="/docs/components/ahv-input/">AhvInput →</TextLink>
      <TextLink href="/docs/components/canton-select/">CantonSelect →</TextLink>
    </ChapterIntro></GridItem>
    <GridItem medium={5} large={8} start={{ large: 5 }}><Island name="swiss" html={html} /></GridItem>
  </Grid>
}

export function QrStudy({ html }: { html: string }) {
  return <Grid as="section" id="qr-bill" width="site" space="chapter" align="start" surface="accent" data-al-theme="light" aria-labelledby="qr-title">
    <GridItem medium={3} large={4}><ChapterIntro folio="04" id="qr-title" title="A real QR-bill"
      text="One component draws the SIX payment part and receipt in millimetres, with a QR code banking apps can scan. Change the amount and watch the code change.">
      <Typography><InlineCode>{'<SwissQrBill bill={bill} />'}</InlineCode></Typography>
      <TextLink href="/docs/components/swiss-qr-bill/">Print a QR-bill →</TextLink>
      <TextLink href="/docs/components/invoice-document/">Full invoice with InvoiceDocument →</TextLink>
    </ChapterIntro></GridItem>
    <GridItem medium={5} large={8} start={{ large: 5 }}><Island name="qr" html={html} /></GridItem>
  </Grid>
}

const qualities = [
  ['AA', 'WCAG 2.2 target', 'Keyboard paths, visible focus and labelled controls. Every page is checked with axe at 360 and 1280 pixels.', '/principles/', 'Read the principles →'],
  ['2', 'Themes', 'Light and dark from the same tokens, chosen by the system or by the reader, with one red accent.', '/themes/', 'Build a theme →'],
  ['4', 'National languages', 'Messages, dates, cantons and holidays in German, French, Italian and Romansh.', '/docs/guides/swiss/', 'Read the Swiss guide →'],
  ['0', 'Runtime dependencies', 'React and React DOM are the only peers. Typed ESM, plain CSS and editable source you can copy with the CLI.', '/docs/guides/cli/', 'Copy source with the CLI →'],
] as const

export function QualityStudy() {
  return <Grid as="section" id="quality" width="site" space="chapter" align="start" surface="ink" aria-labelledby="quality-title">
    <GridItem><ChapterIntro folio="06" id="quality-title" title="Made to be relied on"
      text="The details that usually come last are built in from the first component." /></GridItem>
    {qualities.map(([figure, title, text, href, link]) => <GridItem key={title} small={2} medium={4} large={3}>
      <Stack gap={3} align="start">
        <Typography as="p" variant="display" numeric>{figure}</Typography>
        <Typography as="h3" variant="heading">{title}</Typography>
        <Typography>{text}</Typography>
        <TextLink href={href}>{link}</TextLink>
      </Stack>
    </GridItem>)}
  </Grid>
}

export function AgentStudy({ skill, mcp }: { skill: string; mcp: string }) {
  return <Grid as="section" id="agents" width="site" space="chapter" align="start" surface="ink" aria-labelledby="agents-title">
    <GridItem medium={3} large={4}><ChapterIntro folio="08" id="agents-title" title="Ready for AI agents"
      text="Give your coding assistant the Alpina rules in one command. A read-only MCP server lets it search components, read source and follow the guides offline.">
      <TextLink href="/agents/">Set up agent tools →</TextLink>
      <TextLink href="/llms.txt">Read llms.txt →</TextLink>
    </ChapterIntro></GridItem>
    <GridItem medium={5} large={7} start={{ large: 6 }}><Stack gap={5}>
      <Stack gap={2}><Typography as="h3" variant="label">1 · Install the skill</Typography><Island name="skill" html={skill} /></Stack>
      <Stack gap={2}><Typography as="h3" variant="label">2 · Connect the MCP server</Typography><Island name="mcp" html={mcp} /></Stack>
    </Stack></GridItem>
  </Grid>
}
