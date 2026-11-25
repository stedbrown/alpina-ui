import { Badge, Button, CurrencyCHF, Field, Grid, GridItem, Icon, Input, Select, Separator, Stack, Textarea, TextLink, Typography } from 'alpina-ui'
import { Footer, Masthead, PageHeading } from './pages.js'
import { defaultTheme, themeValues } from './theme-values.js'

const initial = themeValues(defaultTheme)

export function Themes() {
  return <>
    <Masthead current="themes" />
    <main id="content" tabIndex={-1}>
      <PageHeading title="Theme builder" summary="Set the accent and grid unit. Check the invoice contrast and copy the CSS." />
      <Grid width="site" space="compact" align="start">
        <GridItem medium={3} large={4}>
          <template id="theme-tools">
            <Stack gap={4}>
              <Field label="Accent color" id="theme-accent">{props => <Input {...props} type="color" defaultValue={defaultTheme.accent} />}</Field>
              <Field label="Grid unit" id="theme-unit">{props => <Select {...props} defaultValue="4">
                {[3, 4, 5, 6].map(unit => <option key={unit} value={unit}>{unit} px</option>)}
              </Select>}</Field>
              <Field label="Appearance" id="theme-mode">{props => <Select {...props} defaultValue="light">
                <option value="light">Light</option><option value="dark">Dark</option><option value="auto">Use device setting</option>
              </Select>}</Field>
              <Stack align="start"><Button id="theme-reset" variant="outline">Restore defaults</Button></Stack>
            </Stack>
          </template>
          <noscript><Typography>Enable JavaScript to edit this theme. The default CSS is available below.</Typography></noscript>
        </GridItem>
        <GridItem medium={5} large={7} start={{ large: 6 }}>
          <Stack id="theme-preview" data-al-theme="light" surface="paper" inset={5} gap={4} role="region" aria-label="Live invoice preview">
            <Separator weight="section" />
            <Stack direction="row" justify="space-between">
              <Typography as="h2" variant="heading">Studio invoice</Typography><Badge tone="accent">Open</Badge>
            </Stack>
            <Stack gap={1}>
              <Typography variant="label">Amount due</Typography>
              <Typography variant="display" numeric><CurrencyCHF amount={840} locale="de-CH" /></Typography>
              <Typography numeric>Due <time dateTime="2027-03-12">12 March 2027</time></Typography>
            </Stack>
            <Stack direction="row">
              <Button asChild><a href="/examples/invoice-review/">Review invoice <Icon name="arrow-right" size={16} /></a></Button>
              <TextLink href="/docs/components/badge/">Badge reference</TextLink>
            </Stack>
            <Separator />
          </Stack>
        </GridItem>
      </Grid>
      <Grid width="site" space="section" align="start">
        <GridItem medium={3} large={4}>
          <Stack gap={3} aria-live="polite" aria-atomic="true">
            <Typography as="h2" variant="heading">Text contrast</Typography>
            <Typography variant="label">Button label on accent</Typography><Typography id="button-contrast">{initial.button.toFixed(2)}:1 · Pass</Typography>
            <Typography variant="label">Accent text on background</Typography><Typography id="text-contrast">{initial.text.toFixed(2)}:1 · Pass</Typography>
            <Typography variant="caption">WCAG AA requires 4.5:1 for normal text. The button label switches to black when white falls below that threshold.</Typography>
          </Stack>
        </GridItem>
        <GridItem medium={5} large={7} start={{ large: 6 }}>
          <Stack gap={2}>
            <Field id="theme-css" label="CSS variables" description="Load after Alpina’s stylesheet. For dark mode, set data-al-theme=&quot;dark&quot; on your container.">
              {props => <Textarea {...props} readOnly rows={11} spellCheck={false} defaultValue={initial.css} />}
            </Field>
            <Stack direction="row">
              <template id="theme-copy"><Button variant="outline"><Icon name="copy" size={16} />Copy CSS</Button></template>
              <Typography variant="caption" role="status" id="copy-feedback" />
            </Stack>
          </Stack>
        </GridItem>
      </Grid>
    </main>
    <Footer />
  </>
}
