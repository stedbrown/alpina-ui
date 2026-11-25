import { version } from 'alpina-ui/package.json'
import { Grid, GridItem, Icon, NavigationAction, NavigationBrand, NavigationMenu, TextLink } from 'alpina-ui'
import { AppearanceButton } from './appearance-button.js'

export const repository = 'https://github.com/stedbrown/alpina-ui'

const sections = [
  ['docs', '/docs/', 'Docs'],
  ['components', '/docs/components/', 'Components'],
  ['blocks', '/blocks/', 'Blocks'],
  ['icons', '/icons/', 'Icons'],
  ['themes', '/themes/', 'Themes'],
  ['kit', '/kit/', 'Kit'],
  ['principles', '/principles/', 'Principles'],
  ['examples', '/examples/', 'Examples'],
  ['agents', '/agents/', 'Agents'],
] as const
export type SiteSection = 'home' | typeof sections[number][0]

export function Masthead({ current, skipTo = '#content' }: { current: SiteSection; skipTo?: string }) {
  const cover = current === 'home'
  return <Grid as="header" width="site" surface={cover ? 'accent' : 'paper'} data-al-theme={cover ? 'light' : undefined}>
    <GridItem>
      <TextLink variant="skip" href={skipTo}>Skip to content</TextLink>
      <NavigationMenu label="Site navigation" lang="en" data-site-nav="" collapseLabel="Menu" surface={cover ? 'accent' : undefined}
        brand={<NavigationBrand href="/" logo="/assets/logo.svg" aria-label="Alpina UI home" aria-current={cover ? 'page' : undefined}>Alpina</NavigationBrand>}
        sections={[{ links: sections.map(([id, href, label]) => ({ href, label, current: current === id })) }]}
        actions={<>
          <NavigationAction href="/docs/guides/release/" aria-label={'Release ' + version}>v{version}</NavigationAction>
          <NavigationAction href={repository} icon={<Icon name="github" size={18} />}>GitHub</NavigationAction>
          <AppearanceButton />
        </>}
      />
    </GridItem>
  </Grid>
}
