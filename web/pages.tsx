import {
  Grid,
  GridItem,
  NavigationMenu,
  Separator,
  Stack,
  TextLink,
  Typography,
} from 'alpina-ui'

const repository = 'https://github.com/stedbrown/alpina-ui'
type Section = 'home' | 'docs' | 'examples' | 'agents'

export function Masthead({ current }: { current: Section }) {
  const links = [
    { href: '/docs/', label: 'Documentation', current: current === 'docs' },
    { href: '/examples/', label: 'Examples', current: current === 'examples' },
    { href: '/agents/', label: 'Agent tools', current: current === 'agents' },
    { href: repository, label: 'GitHub ↗' },
  ]

  return (
    <Grid as="header" space="compact">
      <GridItem>
        <TextLink variant="skip" href="#content">Skip to content</TextLink>
        <Stack direction="row" justify="space-between" gap={1} columnGap={6}>
          <TextLink variant="quiet" href="/" aria-current={current === 'home' ? 'page' : undefined}>
            <Typography as="span" variant="heading">Alpina UI</Typography>
          </TextLink>
          <NavigationMenu label="Main navigation" orientation="horizontal" sections={[{ links }]} />
        </Stack>
      </GridItem>
    </Grid>
  )
}

export function Footer() {
  return (
    <Grid as="footer" surface="ink" space="compact">
      <GridItem>
        <Stack direction="row" justify="space-between" align="baseline" gap={2} columnGap={6}>
          <TextLink href="/" variant="quiet"><Typography as="span" variant="heading">Alpina UI</Typography></TextLink>
          <Stack direction="row" gap={4}>
            <TextLink href={repository + '/blob/main/LICENSE'}>MIT license</TextLink>
            <TextLink href={repository}>GitHub ↗</TextLink>
          </Stack>
        </Stack>
      </GridItem>
    </Grid>
  )
}

const componentSamples = [
  { name: 'Grid', href: '/docs/components/grid/', detail: 'Follow the same margins and gutters as this page at four, eight, and twelve columns.' },
  { name: 'Dropdown menu', href: '/docs/components/dropdown-menu/', detail: 'Try a keyboard-operated action menu with a destructive action and focus restoration.' },
  { name: 'Swiss address form', href: '/docs/components/swiss-address-form/', detail: 'Switch between the four national languages while keeping a partially entered address.' },
]

export function Landing() {
  return (
    <>
      <Masthead current="home" />
      <main id="content" tabIndex={-1}>
        <Grid surface="accent" space="cover" ruler>
          <GridItem>
            <Typography as="h1" variant="poster" tone="ink">
              Alpina <Typography as="span" variant="inherit" tone="paper">UI</Typography>
            </Typography>
          </GridItem>
        </Grid>
        <Grid as="section" aria-labelledby="introduction" space="section">
          <GridItem medium={4} large={6}>
            <Typography as="h2" variant="display" id="introduction">Swiss typography for React.</Typography>
          </GridItem>
          <GridItem medium={4} large={5} start={{ large: 8 }}>
            <Stack gap={5} align="start">
              <Typography variant="lead">78 components for building interfaces on a responsive typographic grid.</Typography>
              <Stack direction="row" gap={3} columnGap={5}>
                <TextLink variant="action" href="/docs/">Read the docs →</TextLink>
                <TextLink href="/examples/">Explore examples</TextLink>
              </Stack>
            </Stack>
          </GridItem>
        </Grid>
        <Grid><GridItem><Separator weight="section" /></GridItem></Grid>
        <Grid as="section" aria-labelledby="components" space="section">
          <GridItem medium={3} large={5}>
            <Stack gap={4} align="start">
              <Typography as="h2" variant="display" id="components">Component index</Typography>
              <TextLink href="/docs/">Browse the catalog →</TextLink>
            </Stack>
          </GridItem>
          <GridItem medium={5} large={6} start={{ large: 7 }}>
            <Stack gap={5}>
              {componentSamples.map((sample) => (
                <Stack key={sample.href} gap={2}>
                  <Typography as="h3" variant="heading"><TextLink href={sample.href}>{sample.name}</TextLink></Typography>
                  <Typography measure="narrow">{sample.detail}</Typography>
                  <Separator />
                </Stack>
              ))}
            </Stack>
          </GridItem>
        </Grid>
        <Grid as="section" aria-labelledby="examples" space="section" surface="ink">
          <GridItem medium={4} large={6}>
            <Typography as="h2" variant="display" id="examples">Working examples</Typography>
          </GridItem>
          <GridItem medium={4} large={5} start={{ large: 8 }}>
            <Stack gap={4} align="start">
              <Typography variant="lead">See how a whole project fits together, from a canton filter to a bilingual address book.</Typography>
              <TextLink href="/examples/">Open the example projects →</TextLink>
            </Stack>
          </GridItem>
        </Grid>
      </main>
      <Footer />
    </>
  )
}

const projects = [
  {
    name: 'Studio address book',
    description: 'Find a studio by canton, switch between Italian and German, and edit its postal address. Changes last until you reload the page.',
    href: '/examples/bilingual-address-book/',
    source: '/tree/main/recipes/rubrica',
    report: '/blob/main/recipes/rubrica/PROVA.md',
  },
  {
    name: 'Client directory',
    description: 'Filter client records by canton, edit a postal address in any of the four national languages, and sort orders by their total in Swiss francs.',
    href: '/examples/client-directory/',
    source: '/blob/main/catalog/overview.tsx',
  },
]

export function Examples() {
  return (
    <>
      <Masthead current="examples" />
      <main id="content" tabIndex={-1}>
        <Grid as="section" aria-labelledby="examples-title" space="cover">
          <GridItem>
            <Typography as="h1" variant="poster" id="examples-title">Examples</Typography>
          </GridItem>
          <GridItem medium={6} large={6}>
            <Typography variant="lead">Explore complete applications built with Alpina. Open a project to try it, or read the React source.</Typography>
          </GridItem>
        </Grid>
        {projects.map((project) => (
          <Grid as="article" key={project.href} space="compact">
            <GridItem><Separator weight="section" /></GridItem>
            <GridItem medium={4} large={6}>
              <Typography as="h2" variant="display"><TextLink variant="quiet" href={project.href}>{project.name}</TextLink></Typography>
            </GridItem>
            <GridItem medium={4} large={5} start={{ large: 8 }}>
              <Stack gap={4} align="start">
                <Typography measure="narrow">{project.description}</Typography>
                <Stack direction="row" gap={3} columnGap={5}>
                  <TextLink variant="action" href={project.href}>Open project →</TextLink>
                  <TextLink href={repository + project.source}>Source</TextLink>
                  {project.report && <TextLink href={repository + project.report}>Build report</TextLink>}
                </Stack>
              </Stack>
            </GridItem>
          </Grid>
        ))}
      </main>
      <Footer />
    </>
  )
}
