import { AppearanceButton } from '../web/appearance-button.js'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import {
  AppShell, Avatar, Breadcrumb, ComponentPreview, InputGroup, ReferenceArticle,
  Sidebar,
  NavigationMenu,
  Prose,
  CodeBlock,
  TextLink,
  Input,
  Kbd,
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Icon,
  Label,
  Select,
  Typography,
  Stack,
  Empty,
} from 'alpina-ui'
import 'alpina-ui/styles.css'
import { inventory, type Item } from './inventory.js'
import { bilingualProject, clientProject, componentHref, guideHref, workflowProjects, type WorkflowProject } from './paths.js'
import * as baseExamples from './demos.js'
import * as paymentExamples from './payment-examples.js'
import * as dataExamples from './data-examples.js'
import * as designExamples from './design-examples.js'
import * as elements from './elements-v3.js'
import * as actions from './actions-v3.js'
import * as workflows from './workflows-v3.js'
import * as portal from './portal-v3.js'
import { StackExample } from './stack-example.js'
import { IconExample } from './icon-example.js'
import * as composition from './composition-examples.js'
import { SwissAddressFormExample } from './address-example.js'
import { ApiReference } from './api-reference.js'
import { ReferenceGuidance } from './reference-guidance.js'
import { InstallGuide } from './install-guide.js'
import { DirectoryLive } from './directory-live.js'
import { DirectorySource } from './directory-source.js'
import { Specimen } from './specimen.js'
import { Overview } from './overview.js'
import { InvoiceReview } from './invoice-review.js'
import { WorkshopRegistration } from './workshop-registration.js'
import {
  apiReference, brandMark,
  componentFiles,
  directorySources,
  guides,
  guideManifest,
  sourceFiles,
  loadPostalSource,
  sources,
  usageNotes,
  version,
} from 'alpina:content'

const demos = {
  ...composition,
  ...baseExamples,
  ...paymentExamples,
  ...dataExamples,
  ...designExamples,
  ...elements,
  ...actions,
  ...workflows,
  ...portal,
  SwissAddressFormExample,
  StackExample,
  IconExample,
}
const guideNames: Record<string, string> = Object.fromEntries(guideManifest.map(({ id, title }) => [id, title]))
const guideGroups = [
  { title: 'Guides', keys: guideManifest.filter(guide => guide.navigation === 'guides').map(guide => guide.id) },
  { title: 'Release candidate', keys: guideManifest.filter(guide => guide.navigation === 'candidate').map(guide => guide.id) },
]
const searchTerms: Record<string, string> = {
  stack: 'toolbar spacing action groups',
  icon: 'pictogram symbol SVG glyph git branch repository',
  'dropdown-menu': 'dropdown contextual actions',
  'canton-select': 'canton filter all cantons',
  'canton-combobox': 'canton filter search location',
  input: 'search contacts filter',
  'data-table': 'sort contacts list',
  'locale-select': 'language selector Deutsch Français Italiano Rumantsch grischun German French Italian Romansh',
}
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en')
const searchIndex = inventory.map((row) => ({
  row,
  text: fold([...row, searchTerms[row[0]] ?? ''].join(' ')),
}))
const groups = Array.from(new Set(inventory.map((row) => row[3])))
function useRoute() {
  const [hash, setHash] = useState(() => typeof location === 'undefined' ? '' : location.hash.slice(1))
  useEffect(() => {
    const update = () => {
      setHash(location.hash.slice(1))
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  const navigateView = useCallback((next: string) => {
    location.hash = next
    setHash(next)
  }, [])
  return [hash, navigateView] as const
}

function Brand({ hostedDocs }: { hostedDocs: boolean }) {
  return (
    <TextLink variant="brand" href={hostedDocs ? '/' : '#overview'} aria-label={hostedDocs ? 'Alpina UI home' : 'Alpina UI overview'}>
      <Avatar decorative size="sm" name="Alpina" src={brandMark} />Alpina UI
    </TextLink>
  )
}
const views = { Preview: '', Code: 'code', API: 'api', Source: 'source' } as const
type View = keyof typeof views
function PostalDirectorySource({ file }: { file: string }) {
  const [code, setCode] = useState('')
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    loadPostalSource().then(text => { if (active) setCode(text) }, () => { if (active) setFailed(true) })
    return () => { active = false }
  }, [])
  if (!code) return <Typography role="status">{failed ? 'The source file could not be loaded. Reopen Source to retry.' : 'Loading source…'}</Typography>
  return <CodeBlock data-source-snippet="" label={file} code={code} />
}
function Workbench({
  item,
  hostedDocs,
  mode,
  navigateView,
}: {
  item: Item
  hostedDocs: boolean
  mode: View
  navigateView: (next: string) => void
}) {
  const [id, name, title, , description] = item
  const files = componentFiles[id]
  const [file, setFile] = useState(files[0])
  const key = (name + 'Example') as keyof typeof demos
  const Demo = demos[key]
  const source = sources[key]
  const guide =
    ['swiss-qr-bill', 'qr-bill-scanner'].includes(id) ? 'qr-bill' : key in elements
      ? 'elements'
      : key in actions
        ? 'actions'
        : key in workflows
          ? 'workflows'
          : key in portal
            ? 'portal'
            : ['grid', 'typography', 'stack'].includes(id)
              ? 'design'
              : files[0].startsWith('ui/')
                ? 'core'
                : files[0].split('/')[0]
  return (
    <ReferenceArticle title={hostedDocs ? name : title} headingId="item-heading"
      summary={description} identifier={hostedDocs ? 'alpina-ui/' + files[0].replace(/\.tsx$/, '') : name}
      toolbar={<ButtonGroup label="Component view" data-component-views="">
        {(Object.keys(views) as View[]).map((view) => {
          const destination = views[view] ? id + '/' + views[view] : id
          return <Button
            variant={view === mode ? 'primary' : 'outline'}
            size="sm"
            key={view}
            aria-pressed={view === mode}
            data-component-view={destination}
            onClick={() => navigateView(destination)}
          >
            {view}
          </Button>
        })}
      </ButtonGroup>}>
      <ComponentPreview onDialogDismiss={() => document.querySelector<HTMLButtonElement>('[data-component-views] [aria-pressed="true"]')?.focus()} visible={mode === 'Preview'}>
        <Demo />
      </ComponentPreview>
      {mode === 'Preview' && (
        <Stack gap={1}>
          <Typography as="h2" variant="heading">Usage notes</Typography>
          <Typography measure="reading">{usageNotes[id]}</Typography>
        </Stack>
      )}
      {mode === 'Preview' && <ReferenceGuidance key={id} slug={id} />}
      {mode === 'API' && <ApiReference entries={apiReference[id]} />}
      {mode === 'Code' && (
        <>
          <CodeBlock data-source-snippet="" label="Example.tsx" code={source} />
        </>
      )}
      {mode === 'Source' && (
        <Stack gap={2}>
          <Label htmlFor="source-file">Distributed files</Label>
          <Select id="source-file" value={file} onChange={(e) => setFile(e.target.value)}>
            {files.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
          {file === 'swiss/postal-localities.data.ts'
            ? <PostalDirectorySource file={file} />
            : <CodeBlock data-source-snippet="" label={file} code={sourceFiles[file]} />}
        </Stack>
      )}
      <CodeBlock
        label="Add to your project"
        code={'npx --no-install alpina add ' + id}
      />
      <Stack direction="row" gap={4}>
        <TextLink href={guideHref('start', hostedDocs)}>Installation</TextLink>
        <TextLink href={guideHref(guide, hostedDocs)}>Usage guide</TextLink>
      </Stack>
    </ReferenceArticle>
  )
}
export function App({ pathname }: { pathname: string }) {
  const [, pageType, pageId] = /^\/docs\/(guides|components)\/([\w-]+)$/.exec(pathname) ?? []
  const hostedDocs = pathname === '/docs' || !!pageId
  const pathRoute = pageType === 'guides' ? 'guide/' + pageId : pageId
  const siteLinks = [
    { href: '/', label: 'Home' },
    { href: '/docs/', label: 'Docs', current: pageType !== 'components' },
    { href: '/docs/components/', label: 'Components', current: pageType === 'components' },
    { href: '/blocks/', label: 'Blocks' },
    { href: '/icons/', label: 'Icons' },
    { href: '/themes/', label: 'Themes' },
    { href: '/principles/', label: 'Principles' },
    { href: '/examples/', label: 'Examples' },
    { href: '/agents/', label: 'Agents' },
    { href: 'https://github.com/stedbrown/alpina-ui', label: <><Icon name="git-branch" size={18} />{' GitHub'}</> },
  ]

  const [hash, navigateView] = useRoute()
  const route = hash || pathRoute || (hostedDocs ? 'guide/start' : 'overview')
  const [itemId, viewPath] = route.split('/')
  const subpage = viewPath === 'codice' ? 'code' : viewPath === 'sorgente' ? 'source' : viewPath
  const item = inventory.find((row) => row[0] === itemId)
  const mode = (Object.keys(views) as View[]).find((view) => views[view] === subpage) ?? 'Preview'
  const guide = route.startsWith('guide/')
    ? Object.hasOwn(guideNames, route.slice(6))
      ? route.slice(6)
      : 'start'
    : null
  const liveDirectory = hash === 'bilingual-address-book' || hash === 'rubrica-bilingue'
  const directory = hash === 'address-book' || hash === 'rubrica'
  const workflow = workflowProjects.find((project) => project.slug === hash)
  const overview = !guide && !item && !directory
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState({ open: false, focusSearch: false })
  const setIndexOpen = useCallback((open: boolean) => {
    setIndex(previous => previous.open === open ? previous : { open, focusSearch: false })
  }, [])
  const search = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const words = fold(query.trim()).split(/\s+/).filter(Boolean)
  const matches = searchIndex
    .filter((entry) => words.every((word) => entry.text.includes(word)))
    .map((entry) => entry.row)
  const area = item?.[3] || (guide ? 'Documentation' : directory ? 'Address book' : 'Specimen')
  function navigate() {
    setIndexOpen(false)
    setQuery('')
  }
  useEffect(() => {
    if (hostedDocs && (directory || liveDirectory))
      location.replace(liveDirectory ? bilingualProject : clientProject)
    else if (hostedDocs && workflow) location.replace('/examples/' + workflow.slug + '/')
  }, [directory, liveDirectory, workflow])
  useEffect(() => {
    if (liveDirectory) return
    const title = item ? (hostedDocs ? item[1] : item[2]) : (guide && guideNames[guide]) || workflow?.title || area
    document.title = title + ' · Alpina UI'
    window.scrollTo(0, 0)
    const mobileLayout = matchMedia('(max-width:740px)').matches
    if (!first.current && mobileLayout)
      document.getElementById('main-content')?.focus({ preventScroll: true })
    first.current = false
    const selected = list.current?.querySelector<HTMLElement>('a[aria-current=page]')
    if (list.current && selected && !mobileLayout) {
      const a = selected.getBoundingClientRect(),
        b = list.current.getBoundingClientRect()
      if (a.bottom > b.bottom || a.top < b.top) list.current.scrollTop += a.top - b.top - 40
    }
  }, [item, guide, area, liveDirectory, workflow])
  useLayoutEffect(() => {
    if (!index.focusSearch) return
    search.current?.focus()
    search.current?.select()
  }, [index])
  useEffect(() => {
    function focusSearch() {
      // Each shortcut also requests focus again when the index is already open.
      setIndex({ open: true, focusSearch: true })
    }
    function shortcut(e: KeyboardEvent) {
      if (['#bilingual-address-book', '#rubrica-bilingue'].includes(location.hash) || workflowProjects.some(({ slug }) => location.hash === '#' + slug)) return
      if (document.querySelector('dialog[open]') || e.isComposing || e.defaultPrevented) return
      const typing =
        e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable=true]')
      if (
        (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey)
      ) {
        e.preventDefault()
        focusSearch()
      }
    }
    window.addEventListener('keydown', shortcut)
    const root = document.getElementById('app')!
    root.dispatchEvent(new Event('alpina-index-ready'))
    const view = root.dataset.viewIntent
    delete root.dataset.viewIntent
    if (view) navigateView(view)
    const intent = root.dataset.indexIntent
    delete root.dataset.indexIntent
    if (intent === 'browse') setIndexOpen(true)
    if (intent === 'search') focusSearch()
    return () => window.removeEventListener('keydown', shortcut)
  }, [navigateView, setIndexOpen])
  const sidebar = (
    <Sidebar
      ref={list}
      aria-label="Catalog"
      tools={
        <InputGroup trailing={<Kbd aria-hidden="true">/</Kbd>}>
          <Input
            ref={search}
            type="search"
            aria-label="Search components"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query && matches[0]) {
                location.href = componentHref(matches[0][0], hostedDocs)
                navigate()
              }
            }}
          />
        </InputGroup>
      }
      footer={
        <>
          <span>v{version}</span>
          <span>{inventory.length} components</span>
        </>
      }
    >
      {!query && hostedDocs && (
        <NavigationMenu
          label="Documentation guides"
          onNavigate={navigate}
          sections={guideGroups.map(({ title, keys }) => ({
            title,
            links: [
              ...keys.map((key) => ({
                href: guideHref(key, true),
                label: guideNames[key],
                current: guide === key,
              })),
            ],
          }))}
        />
      )}
      {!query && !hostedDocs && (
        <NavigationMenu
          label="Library"
          onNavigate={navigate}
          sections={[
            {
              links: [
                { href: '#overview', label: 'Specimen', current: overview },
                { href: '#address-book', label: 'Client address book', current: directory },
                { href: '#bilingual-address-book', label: 'IT / DE address book' },
                ...workflowProjects.map(({ slug, title }) => ({ href: '#' + slug, label: title })),
                { href: '#guide/start', label: 'Installation', current: guide === 'start' },
                {
                  href: '#guide/research',
                  label: 'Documentation',
                  current: !!guide && guide !== 'start',
                },
              ],
            },
          ]}
        />
      )}
      <NavigationMenu
        id="index-list"
        label="Component index"
        onNavigate={navigate}
        sections={groups.map((title) => ({
          title,
          links: matches
            .filter((row) => row[3] === title)
            .map((row) => ({
              href: componentHref(row[0], hostedDocs),
              label: hostedDocs ? row[1] : row[2],
              current: item?.[0] === row[0],
            })),
        }))}
      />
      {!matches.length && <Empty role="status" title="No matching components." />}
    </Sidebar>
  )
  if (liveDirectory) return <DirectoryLive />
  if (workflow) return <WorkflowExample key={workflow.slug} project={workflow} hosted={false} />
  return (
    <AppShell
      brand={<Brand hostedDocs={hostedDocs} />}
      sidebar={sidebar}
      open={index.open}
      onOpenChange={setIndexOpen}
      mainId="main-content"
      toolbar={
        <>
          {hostedDocs ? (
            <NavigationMenu label="Site navigation" data-site-nav="" orientation="horizontal" collapseLabel="Menu" sections={[{ links: siteLinks }]} />
          ) : (
            <Breadcrumb label="Current section" items={[{ href: '#overview', label: 'Library' }, { label: area }]} />
          )}
          <AppearanceButton />
        </>
      }
    >
      {item ? (
        <Workbench key={item[0]} item={item} hostedDocs={hostedDocs} mode={mode} navigateView={navigateView} />
      ) : guide ? (
        <>
          {!hostedDocs && (
            <NavigationMenu
              label="Guide sections"
              orientation="horizontal"
              sections={[
                {
                  links: Object.entries(guideNames).map(([key, label]) => ({
                    href: '#guide/' + key,
                    label,
                    current: key === guide,
                  })),
                },
              ]}
            />
          )}
          {guide === 'start' ? (
            <InstallGuide html={guides.start} />
          ) : (
            <Prose data-guide-content="" dangerouslySetInnerHTML={{ __html: guides[guide] }} />
          )}
          {guide === 'directory' && <DirectorySource files={directorySources} hosted={hostedDocs} />}
        </>
      ) : directory ? (
        <Overview />
      ) : (
        <Specimen hosted={hostedDocs} />
      )}
    </AppShell>
  )
}
function Project({ bilingual }: { bilingual: boolean }) {
  const source = bilingual
    ? 'https://github.com/stedbrown/alpina-ui/tree/main/recipes/rubrica'
    : 'https://github.com/stedbrown/alpina-ui/blob/main/catalog/overview.tsx'
  return (
    <>
      <Grid as="header" width="site" space="compact"><GridItem><NavigationMenu
        lang="en"
        label="Example navigation"
        data-project-nav=""
        orientation="horizontal"
        collapseLabel="Menu"
        sections={[{ links: [
          { href: '/examples/', label: '← Examples' },
          { href: bilingual ? guideHref('directory', true) : componentHref('swiss-address-form', true), label: 'Documentation' },
          { href: source, label: 'Source on GitHub' },
        ] }]}
      /></GridItem></Grid>
      {bilingual ? <DirectoryLive standalone /> : (
        <Grid as="main" width="site" space="section"><GridItem><Overview hosted /></GridItem></Grid>
      )}
    </>
  )
}
function WorkflowExample({ project, hosted }: { project: WorkflowProject; hosted: boolean }) {
  return <>
    <Grid as="header" width="site" space="compact"><GridItem>
      <TextLink variant="skip" href="#main-content" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main-content')?.focus()
      }}>Skip to example</TextLink>
      <NavigationMenu label="Example navigation" orientation="horizontal" collapseLabel="Menu" sections={[{ links: [
        { href: hosted ? '/examples/' : '#overview', label: hosted ? '← Examples' : '← Catalog' },
        { href: componentHref(project.component, hosted), label: 'Component reference' },
        { href: 'https://github.com/stedbrown/alpina-ui/blob/main/' + project.source, label: 'Source on GitHub' },
      ] }]} />
    </GridItem></Grid>
    {project.slug === 'workshop-registration' ? <WorkshopRegistration /> : <InvoiceReview />}
  </>
}
if (typeof document !== 'undefined') {
  const pathname = location.pathname.replace(/(?:\/index\.html)?\/?$/, '')
  const bilingual = pathname + '/' === bilingualProject
  const workflow = workflowProjects.find(({ slug }) => pathname === '/examples/' + slug)
  const page = workflow ? <WorkflowExample project={workflow} hosted />
    : bilingual || pathname + '/' === clientProject ? <Project bilingual={bilingual} /> : <App pathname={pathname} />
  const root = document.getElementById('app')!
  // Bookmarked views and query-configured examples can differ from the canonical preview.
  if (root.hasAttribute('data-prerendered') && !location.hash && !location.search) hydrateRoot(root, page)
  else createRoot(root).render(page)
}
