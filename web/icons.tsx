import {
  Button, Field, Grid, GridItem, Icon, iconNames, Input, Select, Separator, Stack,
  TextLink, Typography, type IconName,
} from 'alpina-ui'
import { Footer, Masthead, PageHeading } from './pages.js'

const groups = {
  Navigation: ['arrow-right', 'arrow-left', 'arrow-up-right', 'chevron-down', 'chevron-right', 'external-link', 'menu', 'search'],
  Actions: ['plus', 'minus', 'close', 'check', 'copy', 'download', 'filter', 'sort', 'sliders'],
  Content: ['grid', 'list', 'table', 'calendar', 'clock', 'document', 'folder', 'book', 'map-pin', 'info'],
  Development: ['code', 'git-branch', 'git-commit', 'repository', 'star'],
} satisfies Record<string, IconName[]>

const searchTerms: Partial<Record<IconName, string>> = {
  'git-branch': 'github version control',
  'git-commit': 'revision version control',
  repository: 'github repo source control',
  sliders: 'settings adjustments',
  document: 'file page',
  'map-pin': 'address location',
}

export function Icons() {
  return <>
    <Masthead current="icons" />
    <main id="content" tabIndex={-1}>
      <PageHeading title="Alpina icons" summary={`${iconNames.length} original pictograms drawn on a 24-unit grid. Choose a size and copy the JSX.`}>
        <Stack align="start"><TextLink href="/docs/components/icon/">Icon usage and API <Icon name="arrow-right" size={16} /></TextLink></Stack>
      </PageHeading>
      <template id="icon-tools">
        <Grid width="site" space="compact" surface="paper" align="end">
          <GridItem medium={4} large={5}>
            <Field label="Find an icon">{props => <Input {...props} type="search" placeholder="Name, category or use" data-icon-search="" />}</Field>
          </GridItem>
          <GridItem small={2} medium={2} large={2}>
            <Field label="Preview size">{props => <Select {...props} defaultValue="24" data-icon-size="">
              {[16, 24, 32, 48].map(size => <option key={size} value={size}>{size} px</option>)}
            </Select>}</Field>
          </GridItem>
          <GridItem small={2} medium={2} large={5}>
            <Stack direction="row" align="center" justify="space-between" gap={1}>
              <Typography variant="caption" role="status" data-icon-count="">{iconNames.length} icons</Typography>
              <Button variant="ghost" size="sm" data-icon-clear="" disabled>Clear</Button>
            </Stack>
          </GridItem>
        </Grid>
      </template>
      {Object.entries(groups).map(([group, names]) =>
        <Grid as="section" aria-label={group} key={group} width="site" space="compact" data-icon-group={group}>
          <GridItem><Separator weight="section" /></GridItem>
          <GridItem><Typography as="h2" variant="heading">{group}</Typography></GridItem>
          {names.map(name =>
            <GridItem key={name} small={2} medium={2} large={2} data-icon-entry={name} data-keywords={searchTerms[name]}>
              <Stack surface="soft" inset={3} gap={4}>
                <Stack direction="row" justify="space-between" wrap={false}>
                  <Icon name={name} size={24} data-icon-drawing="" />
                  <template data-icon-copy="">
                    <Button variant="ghost" size="sm" aria-label={'Copy JSX for ' + name} title={'Copy JSX for ' + name}><Icon name="copy" size={16} /></Button>
                  </template>
                </Stack>
                <Typography as="span" variant="label" data-icon-name="" role="status">{name}</Typography>
                <template data-icon-result="">
                  <Input readOnly aria-label={'JSX for ' + name} />
                </template>
              </Stack>
            </GridItem>
          )}
        </Grid>
      )}
    </main>
    <Footer />
  </>
}
