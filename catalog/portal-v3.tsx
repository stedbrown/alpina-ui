import { AppShell, Sidebar, SideNav, SideNavLink, NavigationMenu, NavigationBrand, NavigationAction, ThemeToggle, CodeBlock, TextLink, Prose, Typography } from 'alpina-ui'

export function AppShellExample() {
  return (
    <AppShell
      contentAs="section"
      navigationLabel="Studio navigation"
      brand="Atelier"
      sidebar={
        <Sidebar as="div" role="group" aria-label="Example contents">
          <SideNav label="Archive sections">
            <SideNavLink active href="#app-shell">Editions</SideNavLink>
            <SideNavLink href="#sidebar">Sidebar index</SideNavLink>
          </SideNav>
        </Sidebar>
      }
      toolbar="Archive"
      openLabel="Open archive"
    >
      <Typography as="h2" variant="heading">
        Available editions
      </Typography>
      <Typography>Typesetting notebooks, 1960–1965 series.</Typography>
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
      collapseLabel="Menu"
      brand={<NavigationBrand href="#navigation-menu">Handbook</NavigationBrand>}
      actions={<><NavigationAction href="#guide/release">Releases</NavigationAction><ThemeToggle /></>}
      sections={[{ links: [
        { href: '#navigation-menu', label: 'Navigation', current: true },
        { href: '#guide/design', label: 'Design' }
      ] }]}
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
    <Typography>
      See the <TextLink href="#guide/design">Swiss graphic design research</TextLink> for the sources behind this project.
    </Typography>
  )
}
export function ProseExample() {
  return (
    <Prose>
      <Typography as="h2" variant="heading">Theatre publications</Typography>
      <Typography>The programme changes each week. The first column always shows the date and time.</Typography>
      <Typography>
        <TextLink href="#guide/design">Read the research</TextLink>
      </Typography>
    </Prose>
  )
}
