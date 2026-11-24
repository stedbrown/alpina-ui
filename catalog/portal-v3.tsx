import { AppShell, Sidebar, NavigationMenu, CodeBlock, TextLink, Prose, Typography } from 'alpina-ui'

export function AppShellExample() {
  return (
    <AppShell
      contentAs="section"
      navigationLabel="Navigazione dell’atelier"
      brand="Atelier"
      sidebar={
        <Sidebar as="div" role="group" aria-label="Sommario dell’esempio" masthead="Atelier">
          <TextLink href="#sidebar">Indice laterale</TextLink>
        </Sidebar>
      }
      toolbar="Archivio"
      openLabel="Apri archivio"
    >
      <Typography as="h2" variant="heading">
        Edizioni disponibili
      </Typography>
      <p>Quaderni di composizione. Serie 1960–1965.</p>
    </AppShell>
  )
}
export function SidebarExample() {
  return (
    <Sidebar
      as="div"
      role="group"
      aria-label="Sommario dell’esempio"
      masthead="Sommario"
      footer="Edizione italiana"
    >
      <NavigationMenu
        label="Capitoli del sommario"
        sections={[
          {
            links: [
              { href: '#grid', label: 'Griglia modulare' },
              { href: '#typography', label: 'Scala tipografica' },
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
      label="Indice del manuale"
      sections={[
        {
          title: 'Documentazione',
          links: [
            { href: '#navigation-menu', label: 'Navigazione', current: true },
            { href: '#guide/research', label: 'Ricerca sul design svizzero' },
          ],
        },
      ]}
    />
  )
}
export function CodeBlockExample() {
  return (
    <CodeBlock
      label="composizione.tsx"
      code={'<Grid>\n  <GridItem small={4}>Programma</GridItem>\n</Grid>'}
    />
  )
}
export function TextLinkExample() {
  return (
    <p>
      Consulta la <TextLink href="#guide/research">ricerca sulla grafica svizzera</TextLink> per leggere
      le fonti del progetto.
    </p>
  )
}
export function ProseExample() {
  return (
    <Prose>
      <h2>Le edizioni del teatro</h2>
      <p>Il programma cambia ogni settimana. La data e l’orario occupano sempre la prima colonna.</p>
      <p>
        <TextLink href="#guide/research">Leggi la ricerca</TextLink>
      </p>
    </Prose>
  )
}
