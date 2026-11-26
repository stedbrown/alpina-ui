import { useEffect, useRef, useState } from 'react'
import {
  Badge, Button, Card, CurrencyCHF, Field, Grid, GridItem, Icon, Input, Progress, Select, Stack, Switch,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea, TextLink, ToggleGroup, Typography,
} from 'alpina-ui'
import { defaultTheme, hexColor, presets, suggestDark, themeFromSearch, themeSearch, themeValues, type Theme } from './theme-values.js'

const invalidColor = 'Enter a color in the form #rrggbb.'
const same = (a: Theme, b: Theme) => a.accent === b.accent && a.dark === b.dark && a.unit === b.unit

function score(ratio: number) {
  return ratio.toFixed(2) + ':1 · ' + (ratio >= 4.5 ? 'Pass' : 'Fail')
}

function Preview({ scheme, values, forced }: { scheme: 'light' | 'dark'; values: Record<string, string>; forced: boolean }) {
  const card = useRef<HTMLElement>(null)
  // Theme tokens are custom properties on the specimen, as an application would set them on a container.
  // Forced colors keep the system palette.
  useEffect(() => {
    const preview = card.current!
    for (const [key, value] of Object.entries(values)) {
      if (!key.startsWith('--al-')) throw Error('Expected an Alpina design token')
      if (forced) preview.style.removeProperty(key)
      else preview.style.setProperty(key, value)
    }
  }, [values, forced])
  return <Card as="section" ref={card} data-theme-preview={scheme} data-al-theme={scheme}
    aria-label={(scheme === 'light' ? 'Light' : 'Dark') + ' preview'}>
    <Stack direction="row" justify="space-between">
      <Typography as="h3" variant="heading">Studio invoice</Typography><Badge tone="accent">Open</Badge>
    </Stack>
    <Stack gap={1}>
      <Typography variant="label">Amount due</Typography>
      <Typography variant="display" numeric><CurrencyCHF amount={840} locale="de-CH" /></Typography>
      <Typography numeric>Due <time dateTime="2027-03-12">12 March 2027</time></Typography>
    </Stack>
    <Progress label="Paid" value={60} />
    <Switch defaultChecked>Send a reminder</Switch>
    <Stack direction="row">
      <Button asChild><a href="/examples/invoice-review/">Review invoice <Icon name="arrow-right" size={16} /></a></Button>
      <TextLink href="/docs/components/badge/">Badge reference</TextLink>
    </Stack>
  </Card>
}

/** The interactive theme builder. The page renders it on the server with the default theme and hydrates it. */
export function ThemeBuilder() {
  const [mounted, setMounted] = useState(false)
  const [forced, setForced] = useState(false)
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [accentText, setAccentText] = useState(defaultTheme.accent)
  const [darkText, setDarkText] = useState(defaultTheme.dark)
  // Until someone edits the dark accent, it follows the light one.
  const [darkEdited, setDarkEdited] = useState(false)
  const [blurred, setBlurred] = useState({ accent: false, dark: false })
  const [feedback, setFeedback] = useState('')
  const accentInput = useRef<HTMLInputElement>(null)
  const cssField = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const shared = themeFromSearch(location.search)
    setTheme(shared)
    setAccentText(shared.accent)
    setDarkText(shared.dark)
    setDarkEdited(shared.dark !== suggestDark(shared.accent))
    const colors = matchMedia('(forced-colors: active)')
    const sync = () => setForced(colors.matches)
    sync()
    colors.addEventListener('change', sync)
    setMounted(true)
    return () => colors.removeEventListener('change', sync)
  }, [])
  // Keep the address shareable: it holds every value that differs from the defaults.
  useEffect(() => {
    if (mounted) history.replaceState(history.state, '', location.pathname + themeSearch(theme) + location.hash)
  }, [mounted, theme])

  function change(next: Theme) {
    setTheme(next)
    setFeedback('')
  }
  function apply(next: Theme, edited: boolean) {
    change(next)
    setAccentText(next.accent)
    setDarkText(next.dark)
    setDarkEdited(edited)
    setBlurred({ accent: false, dark: false })
  }
  function typeAccent(value: string) {
    setAccentText(value)
    setFeedback('')
    if (!hexColor.test(value)) return
    const accent = value.toLowerCase()
    const dark = darkEdited ? theme.dark : suggestDark(accent)
    if (!darkEdited) setDarkText(dark)
    change({ ...theme, accent, dark })
  }
  function typeDark(value: string) {
    setDarkText(value)
    setDarkEdited(true)
    setFeedback('')
    if (hexColor.test(value)) change({ ...theme, dark: value.toLowerCase() })
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(values.css)
      setFeedback('CSS copied')
    } catch {
      cssField.current?.focus()
      cssField.current?.select()
      setFeedback('CSS selected. Use your device’s copy command.')
    }
  }

  const values = themeValues(theme)
  const preset = presets.find(item => item.accent === theme.accent && item.dark === theme.dark)
  const accentError = blurred.accent && !hexColor.test(accentText) ? invalidColor : undefined
  const darkError = blurred.dark && !hexColor.test(darkText) ? invalidColor : undefined
  return <Stack gap={0}>
    <Grid width="site" space="compact" align="start">
      <GridItem medium={3} large={4}>
        {mounted ? <Stack gap={4}>
          <ToggleGroup label="Starting colors" layout="grid" value={preset ? [preset.accent] : []}
            options={presets.map(item => ({ value: item.accent, label: item.name }))}
            onValueChange={selected => {
              const next = presets.find(item => item.accent === selected[0])
              if (next) apply({ ...theme, accent: next.accent, dark: next.dark }, false)
            }} />
          <Field label="Accent color" description="Used on white. Six hexadecimal digits, for example #eb0000." error={accentError}>
            {props => <Input {...props} ref={accentInput} value={accentText} maxLength={7} autoComplete="off" spellCheck={false}
              onChange={event => typeAccent(event.currentTarget.value)}
              onBlur={() => setBlurred(state => ({ ...state, accent: true }))} />}
          </Field>
          <Field label="Dark accent" description={darkEdited ? 'Used on black.' : 'Used on black. Suggested from the accent until you change it.'} error={darkError}>
            {props => <Input {...props} value={darkText} maxLength={7} autoComplete="off" spellCheck={false}
              onChange={event => typeDark(event.currentTarget.value)}
              onBlur={() => setBlurred(state => ({ ...state, dark: true }))} />}
          </Field>
          <Field label="Grid unit">{props => <Select {...props} value={String(theme.unit)}
            onChange={event => change({ ...theme, unit: Number(event.currentTarget.value) })}>
            {[3, 4, 5, 6].map(unit => <option key={unit} value={unit}>{unit} px</option>)}
          </Select>}</Field>
          <Stack align="start" gap={2}>
            <Button variant="outline" disabled={same(theme, defaultTheme)} onClick={() => {
              apply(defaultTheme, false)
              accentInput.current?.focus()
            }}>Restore defaults</Button>
            <Typography variant="caption">The page address keeps this theme, so you can bookmark or share it.</Typography>
          </Stack>
        </Stack> : <noscript><Typography>Enable JavaScript to edit this theme. The default CSS is available below.</Typography></noscript>}
      </GridItem>
      <GridItem medium={5} large={7} start={{ large: 6 }}>
        <Grid space="compact" align="start">
          <GridItem medium={4}><Preview scheme="light" values={values.light.values} forced={forced} /></GridItem>
          <GridItem medium={4}><Preview scheme="dark" values={values.dark.values} forced={forced} /></GridItem>
        </Grid>
      </GridItem>
    </Grid>
    <Grid width="site" space="section" align="start">
      <GridItem medium={3} large={4}>
        <Stack gap={3}>
          <Typography as="h2" variant="heading">Text contrast</Typography>
          <Typography variant="caption">WCAG AA requires 4.5:1 for normal text. A button label switches to black when white falls below that threshold.</Typography>
        </Stack>
      </GridItem>
      <GridItem medium={5} large={7} start={{ large: 6 }}>
        <Table aria-live="polite">
          <TableHeader><TableRow><TableHead>Check</TableHead><TableHead>Light</TableHead><TableHead>Dark</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableHead scope="row">Button label on accent</TableHead>
              <TableCell id="contrast-light-button">{score(values.light.button)}</TableCell><TableCell id="contrast-dark-button">{score(values.dark.button)}</TableCell></TableRow>
            <TableRow><TableHead scope="row">Accent text on background</TableHead>
              <TableCell id="contrast-light-text">{score(values.light.text)}</TableCell><TableCell id="contrast-dark-text">{score(values.dark.text)}</TableCell></TableRow>
          </TableBody>
        </Table>
      </GridItem>
    </Grid>
    <Grid width="site" space="section" align="start">
      <GridItem medium={3} large={4}>
        <Typography as="h2" variant="heading">Copy the theme</Typography>
      </GridItem>
      <GridItem medium={5} large={7} start={{ large: 6 }}>
        <Stack gap={2}>
          <Field label="CSS variables" description="Load after Alpina’s stylesheet. Set data-al-theme to light, dark or auto on your container.">
            {props => <Textarea {...props} ref={cssField} readOnly rows={12} spellCheck={false} value={values.css} />}
          </Field>
          {mounted && <Stack direction="row">
            <Button variant="outline" onClick={copy}><Icon name="copy" size={16} />Copy CSS</Button>
            <Typography variant="caption" role="status">{feedback}</Typography>
          </Stack>}
        </Stack>
      </GridItem>
    </Grid>
  </Stack>
}
