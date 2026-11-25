import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  AppShell,
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
import { Preview } from './preview.js'
import { InstallGuide } from './install-guide.js'
import { DirectoryLive } from './directory-live.js'
import { DirectorySource } from './directory-source.js'
import { Specimen } from './specimen.js'
import { Overview } from './overview.js'
import { InvoiceReview } from './invoice-review.js'
import { WorkshopRegistration } from './workshop-registration.js'
import {
  apiReference,
  componentFiles,
  directorySources,
  exampleCss,
  guides,
  sourceFiles,
  sources,
  usageNotes,
  version,
} from 'alpina:content'
import './catalog.css'
import './examples.css'

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
const guideNames: Record<string, string> = {
  research: 'Research and sources',
  design: 'Measurements and grids',
  start: 'Quick start',
  cli: 'Compare source files',
  release: 'Alpina upgrade notes',
  migration: 'From shadcn/ui to Alpina',
  directory: 'Bilingual address book',
  portal: 'Build the portal',
  core: 'Foundations',
  elements: 'Text and data',
  interactive: 'Interactions',
  actions: 'Menus and dialogs',
  workflows: 'Forms and workflows',
  swiss: 'Swiss formats',
  'qr-bill': 'Swiss QR-bill',
  coverage: 'Comparison with shadcn/ui',
}
const guideGroups = [
  { title: 'Get started', keys: ['start', 'migration', 'cli', 'release'] },
  { title: 'Design', keys: ['design', 'research'] },
  {
    title: 'Guides',
    keys: ['core', 'elements', 'interactive', 'actions', 'workflows', 'swiss', 'qr-bill', 'portal', 'directory', 'coverage'],
  },
]
// Keep links to bundled guides and component previews inside the single-file catalog.
function guideContent(html: string, hosted: boolean) {
  if (hosted) return html
  return html.replace(/href="https:\/\/alpina-ui\.vercel\.app\/docs\/(components|guides)\/([\w-]+)\/"/g,
    (_, section, slug) => 'href="' + (section === 'guides' ? guideHref(slug, false) : componentHref(slug, false)) + '"')
}
const pathname = location.pathname.replace(/(?:\/index\.html)?\/?$/, '')
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
  { href: '/examples/', label: 'Examples' },
  { href: '/agents/', label: 'Agents' },
  { href: 'https://github.com/stedbrown/alpina-ui', label: <><Icon name="git-branch" size={18} />{' GitHub'}</> },
]
const searchTerms: Record<string, string> = {
  stack: 'toolbar spacing action groups',
  icon: 'pictogram symbol SVG glyph git branch repository',
  'dropdown-menu': 'dropdown contextual actions',
  'canton-select': 'canton filter all cantons',
  'canton-combobox': 'canton filter search location',
  input: 'search contacts filter',
  'data-table': 'sort contacts list',
  'locale-select': 'language selector bilingual German Italian',
}
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('en')
const searchIndex = inventory.map((row) => ({
  row,
  text: fold([...row, searchTerms[row[0]] ?? ''].join(' ')),
}))
const groups = Array.from(new Set(inventory.map((row) => row[3])))
function useRoute() {
  const [hash, setHash] = useState(() => location.hash.slice(1))
  useEffect(() => {
    const update = () => {
      setHash(location.hash.slice(1))
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  function navigateView(next: string) {
    location.hash = next
    setHash(next)
  }
  return [hash, navigateView] as const
}

function Brand() {
  return (
    <TextLink className="brand" href={hostedDocs ? '/' : '#overview'} aria-label={hostedDocs ? 'Alpina UI home' : 'Alpina UI overview'}>
      <i aria-hidden="true" />
      Alpina UI
    </TextLink>
  )
}
const views = { Preview: '', Code: 'code', API: 'api', Source: 'source' } as const
type View = keyof typeof views
function Workbench({
  item,
  mode,
  navigateView,
}: {
  item: Item
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
    id === 'swiss-qr-bill' ? 'qr-bill' : key in elements
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
    <article className="bench" aria-labelledby="item-heading">
      <header className="component-hero">
        <code className="component-path">{hostedDocs ? 'alpina-ui/' + files[0].replace(/\.tsx$/, '') : name}</code>
        <Typography variant="display" as="h1" id="item-heading">
          {hostedDocs ? name : title}
        </Typography>
        <Typography>{description}</Typography>
      </header>
      <ButtonGroup label="Component view" className="view-toggle">
        {(Object.keys(views) as View[]).map((view) => (
          <Button
            variant={view === mode ? 'primary' : 'outline'}
            size="sm"
            key={view}
            aria-pressed={view === mode}
            onClick={() => {
              navigateView(views[view] ? id + '/' + views[view] : id)
            }}
          >
            {view}
          </Button>
        ))}
      </ButtonGroup>
      <Preview visible={mode === 'Preview'}>
        <Demo />
      </Preview>
      {mode === 'Preview' && (
        <Stack gap={1}>
          <Typography as="h2" variant="heading">Usage notes</Typography>
          <Typography measure="reading">{usageNotes[id]}</Typography>
        </Stack>
      )}
      {mode === 'API' && <ApiReference entries={apiReference[id]} />}
      {mode === 'Code' && (
        <>
          <CodeBlock className="snippet" label="Example.tsx" code={source} />
          {source.includes('./example.css') && (
            <details>
              <summary>Shared example stylesheet</summary>
              <CodeBlock label="example.css" code={exampleCss} />
            </details>
          )}
        </>
      )}
      {mode === 'Source' && (
        <section className="source-view">
          <Label htmlFor="source-file">Distributed files</Label>
          <Select id="source-file" value={file} onChange={(e) => setFile(e.target.value)}>
            {files.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
          <CodeBlock className="snippet" label={file} code={sourceFiles[file]} />
        </section>
      )}
      <CodeBlock
        className="install"
        label="Add to your project"
        code={'npx --no-install alpina add ' + id}
      />
      <div className="bench-bottom">
        <TextLink href={guideHref('start', hostedDocs)}>Installation</TextLink>
        <TextLink href={guideHref(guide, hostedDocs)}>Usage guide</TextLink>
      </div>
    </article>
  )
}
function App() {
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
  const [mobile, setMobile] = useState(false)
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('alpina-catalog-theme') === 'dark'
    } catch {
      return false
    }
  })
  const search = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const words = fold(query.trim()).split(/\s+/).filter(Boolean)
  const matches = searchIndex
    .filter((entry) => words.every((word) => entry.text.includes(word)))
    .map((entry) => entry.row)
  const area = item?.[3] || (guide ? 'Documentation' : directory ? 'Address book' : 'Specimen')
  function navigate() {
    setMobile(false)
    setQuery('')
  }
  useEffect(() => {
    if (hostedDocs && (directory || liveDirectory))
      location.replace(liveDirectory ? bilingualProject : clientProject)
    else if (hostedDocs && workflow) location.replace('/examples/' + workflow.slug + '/')
  }, [directory, liveDirectory, workflow])
  useEffect(() => {
    document.documentElement.dataset.alTheme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem('alpina-catalog-theme', dark ? 'dark' : 'light')
    } catch {
      /* Optional preference */
    }
  }, [dark])
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
  useEffect(() => {
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
        setMobile(true)
        requestAnimationFrame(() => {
          search.current?.focus()
          search.current?.select()
        })
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])
  const sidebar = (
    <Sidebar
      ref={list}
      aria-label="Catalog"
      masthead={
        <>
          <Brand />
          <span className="version">v{version}</span>
        </>
      }
      tools={
        <div className="search-field">
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
          <Kbd aria-hidden="true">/</Kbd>
        </div>
      }
      footer={
        <>
          <span>React + TypeScript</span>
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
                label: key === 'directory' ? 'Build a bilingual address book' : guideNames[key],
                current: guide === key,
              })),
              ...(title === 'Design' ? [{ href: '/docs/#overview', label: 'Typography specimen', current: overview }] : []),
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
      brand={<Brand />}
      sidebar={sidebar}
      open={mobile}
      onOpenChange={setMobile}
      mainId="main-content"
      toolbar={
        <>
          {hostedDocs ? (
            <NavigationMenu label="Site navigation" className="site-nav" orientation="horizontal" collapseLabel="Menu" sections={[{ links: siteLinks }]} />
          ) : (
            <div className="bread">
              <TextLink href="#overview">Library</TextLink>
              <span aria-hidden="true">/</span>
              <span>{area}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Dark theme"
            aria-pressed={dark}
            onClick={() => setDark(!dark)}
          >
            <i className="theme-disc" aria-hidden="true" />
            <span className="theme-name">Dark theme</span>
          </Button>
        </>
      }
    >
      {item ? (
        <Workbench key={item[0]} item={item} mode={mode} navigateView={navigateView} />
      ) : guide ? (
        <>
          {!hostedDocs && (
            <NavigationMenu
              className="guide-nav"
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
            <InstallGuide html={guideContent(guides.start, hostedDocs)} />
          ) : (
            <Prose className="guide-content" dangerouslySetInnerHTML={{ __html: guideContent(guides[guide], hostedDocs) }} />
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
      <NavigationMenu
        lang="en"
        label="Example navigation"
        className="project-nav"
        orientation="horizontal"
        collapseLabel="Menu"
        sections={[{ links: [
          { href: '/examples/', label: '← Examples' },
          { href: bilingual ? guideHref('directory', true) : componentHref('swiss-address-form', true), label: 'Documentation' },
          { href: source, label: 'Source on GitHub' },
        ] }]}
      />
      {bilingual ? <DirectoryLive standalone /> : (
        <main className="client-project"><Overview hosted /></main>
      )}
    </>
  )
}
function WorkflowExample({ project, hosted }: { project: WorkflowProject; hosted: boolean }) {
  return <>
    <Grid as="header" space="compact"><GridItem>
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
const isBilingualProject = pathname + '/' === bilingualProject
const isProject = isBilingualProject || pathname + '/' === clientProject
const workflow = workflowProjects.find(({ slug }) => pathname === '/examples/' + slug)
createRoot(document.getElementById('app')!).render(workflow
  ? <WorkflowExample project={workflow} hosted />
  : isProject ? <Project bilingual={isBilingualProject} /> : <App />)
