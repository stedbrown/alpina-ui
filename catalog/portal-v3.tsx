import { AppShell, Sidebar, NavigationMenu, CodeBlock, TextLink, Prose, Typography } from 'alpina-ui'

export function AppShellExample() {
  return (
    <AppShell
      contentAs="section"
      navigationLabel="Studio navigation"
      brand="Atelier"
      sidebar={
        <Sidebar as="div" role="group" aria-label="Example contents" masthead="Atelier">
          <TextLink href="#sidebar">Sidebar index</TextLink>
        </Sidebar>
      }
      toolbar="Archive"
      openLabel="Open archive"
    >
      <Typography as="h2" variant="heading">
        Available editions
      </Typography>
      <p>Typesetting notebooks, 1960–1965 series.</p>
    </AppShell>
  )
}
export function SidebarExample() {
  return (
    <Sidebar
      as="div"
      role="group"
      aria-label="Example contents"
      masthead="Contents"
      footer="English edition"
    >
      <NavigationMenu
        label="Chapters"
        sections={[
          {
            links: [
              { href: '#grid', label: 'Modular grid' },
              { href: '#typography', label: 'Type scale' },
            ],
          },
        ]}
      />
    </Sidebar>
  )
}
export function NavigationMenuExample() {
  return (
    <NavigationMenu
      label="Handbook contents"
      sections={[
        {
          title: 'Documentation',
          links: [
            { href: '#navigation-menu', label: 'Navigation', current: true },
            { href: '#guide/research', label: 'Swiss design research' },
          ],
        },
      ]}
    />
  )
}
export function CodeBlockExample() {
  return (
    <CodeBlock
      label="layout.tsx"
      code={'<Grid>\n  <GridItem small={4}>Programme</GridItem>\n</Grid>'}
    />
  )
}
export function TextLinkExample() {
  return (
    <p>
      See the <TextLink href="#guide/research">Swiss graphic design research</TextLink> for the sources behind this project.
    </p>
  )
}
export function ProseExample() {
  return (
    <Prose>
      <h2>Theatre publications</h2>
      <p>The programme changes each week. The first column always shows the date and time.</p>
      <p>
        <TextLink href="#guide/research">Read the research</TextLink>
      </p>
    </Prose>
  )
}
