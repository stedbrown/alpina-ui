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
  Label,
  Select,
  Typography,
  Empty,
} from 'alpina-ui'
import 'alpina-ui/styles.css'
import { inventory, type Item } from './inventory.js'
import * as baseExamples from './demos.js'
import * as dataExamples from './data-examples.js'
import * as designExamples from './design-examples.js'
import * as elements from './elements-v3.js'
import * as actions from './actions-v3.js'
import * as workflows from './workflows-v3.js'
import * as portal from './portal-v3.js'
import { StackExample } from './stack-example.js'
import { SwissAddressFormExample } from './address-example.js'
import { ApiReference } from './api-reference.js'
import { Preview } from './preview.js'
import { InstallGuide } from './install-guide.js'
import { DirectoryLive } from './directory-live.js'
import { DirectorySource } from './directory-source.js'
import { Specimen } from './specimen.js'
import { Overview } from './overview.js'
import {
  apiReference,
  componentFiles,
  directorySources,
  exampleCss,
  guides,
  sourceFiles,
  sources,
  version,
} from 'alpina:content'
import './catalog.css'
import './examples.css'

const demos = {
  ...baseExamples,
  ...dataExamples,
  ...designExamples,
  ...elements,
  ...actions,
  ...workflows,
  ...portal,
  SwissAddressFormExample,
  StackExample,
}
const guideNames: Record<string, string> = {
  research: 'Ricerca e fonti',
  design: 'Misure e griglia',
  start: 'Avvio rapido',
  cli: 'Confrontare i sorgenti',
  release: 'Passare alla 0.5',
  directory: 'Rubrica bilingue',
  portal: 'Costruire il portale',
  core: 'Fondamenti',
  elements: 'Testo e dati',
  interactive: 'Interazioni',
  actions: 'Menu e finestre',
  workflows: 'Moduli e sequenze',
  swiss: 'Formati svizzeri',
  coverage: 'Confronto con shadcn/ui',
}
const searchTerms: Record<string, string> = {
  stack: 'barra strumenti toolbar spaziatura gruppo azioni',
  'dropdown-menu': 'menu a tendina azioni contestuali',
  'canton-select': 'filtro cantone tutti i cantoni',
  'canton-combobox': 'filtro cantone ricerca località',
  input: 'cerca contatti filtro ricerca',
  'data-table': 'ordina contatti elenco',
  'locale-select': 'selettore lingue bilingue tedesco italiano',
}
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('it')
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
    <TextLink className="brand" href="#overview" aria-label="Alpina UI, panoramica">
      <i aria-hidden="true" />
      Alpina UI
    </TextLink>
  )
}
const views = { Anteprima: '', Codice: 'codice', API: 'api', Sorgente: 'sorgente' } as const
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
    key in elements
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
        <code className="component-path">{name}</code>
        <Typography variant="display" as="h1" id="item-heading">
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </header>
      <ButtonGroup label="Vista del componente" className="view-toggle">
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
      <Preview visible={mode === 'Anteprima'}>
        <Demo />
      </Preview>
      {mode === 'API' && <ApiReference entries={apiReference[id]} />}
      {mode === 'Codice' && (
        <>
          <CodeBlock className="snippet" label="Esempio.tsx" code={source} />
          {source.includes('./esempio.css') && (
            <details>
              <summary>Foglio CSS condiviso degli esempi</summary>
              <CodeBlock label="esempio.css" code={exampleCss} />
            </details>
          )}
        </>
      )}
      {mode === 'Sorgente' && (
        <section className="source-view">
          <Label htmlFor="source-file">File distribuiti</Label>
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
        label="Aggiungi al progetto"
        code={'npx --no-install alpina add ' + id}
      />
      <div className="bench-bottom">
        <TextLink href="#guide/start">Installazione</TextLink>
        <TextLink href={'#guide/' + guide}>Guida d’uso</TextLink>
      </div>
    </article>
  )
}
function App() {
  const [hash, navigateView] = useRoute()
  const [itemId, subpage] = hash.split('/')
  const item = inventory.find((row) => row[0] === itemId)
  const mode = (Object.keys(views) as View[]).find((view) => views[view] === subpage) ?? 'Anteprima'
  const guide = hash.startsWith('guide/')
    ? Object.hasOwn(guideNames, hash.slice(6))
      ? hash.slice(6)
      : 'start'
    : null
  const liveDirectory = hash === 'rubrica-bilingue'
  const directory = hash === 'rubrica'
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
  const area = item?.[3] || (guide ? 'Documentazione' : directory ? 'Rubrica' : 'Campionario')
  function navigate() {
    setMobile(false)
    setQuery('')
  }
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
    document.title = (item?.[2] || (guide && guideNames[guide]) || area) + ' · Alpina UI'
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
  }, [item, guide, area, liveDirectory])
  useEffect(() => {
    function shortcut(e: KeyboardEvent) {
      if (location.hash === '#rubrica-bilingue') return
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
      aria-label="Catalogo"
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
            aria-label="Cerca componenti"
            placeholder="Cerca componenti"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query && matches[0]) {
                location.hash = matches[0][0]
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
          <span>{inventory.length} componenti</span>
        </>
      }
    >
      {!query && (
        <NavigationMenu
          label="Libreria"
          onNavigate={navigate}
          sections={[
            {
              links: [
                { href: '#overview', label: 'Campionario', current: overview },
                { href: '#rubrica', label: 'Rubrica clienti', current: directory },
                { href: '#rubrica-bilingue', label: 'Rubrica IT / DE' },
                { href: '#guide/start', label: 'Installazione', current: guide === 'start' },
                {
                  href: '#guide/research',
                  label: 'Documentazione',
                  current: !!guide && guide !== 'start',
                },
              ],
            },
          ]}
        />
      )}
      <NavigationMenu
        id="index-list"
        label="Indice dei componenti"
        onNavigate={navigate}
        sections={groups.map((title) => ({
          title,
          links: matches
            .filter((row) => row[3] === title)
            .map((row) => ({ href: '#' + row[0], label: row[2], current: item?.[0] === row[0] })),
        }))}
      />
      {!matches.length && <Empty role="status" title="Nessun componente trovato." />}
    </Sidebar>
  )
  if (liveDirectory) return <DirectoryLive />
  return (
    <AppShell
      brand={<Brand />}
      sidebar={sidebar}
      open={mobile}
      onOpenChange={setMobile}
      mainId="main-content"
      toolbar={
        <>
          <div className="bread">
            <TextLink href="#overview">Libreria</TextLink>
            <span aria-hidden="true">/</span>
            <span>{area}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Tema scuro"
            aria-pressed={dark}
            onClick={() => setDark(!dark)}
          >
            <i className="theme-disc" aria-hidden="true" />
            {dark ? 'Tema scuro' : 'Tema chiaro'}
          </Button>
        </>
      }
    >
      {item ? (
        <Workbench key={item[0]} item={item} mode={mode} navigateView={navigateView} />
      ) : guide ? (
        <>
          <NavigationMenu
            className="guide-nav"
            label="Sezioni della guida"
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
          {guide === 'start' ? (
            <InstallGuide html={guides.start} />
          ) : (
            <Prose className="guide-content" dangerouslySetInnerHTML={{ __html: guides[guide] }} />
          )}
          {guide === 'directory' && <DirectorySource files={directorySources} />}
        </>
      ) : directory ? (
        <Overview />
      ) : (
        <Specimen />
      )}
    </AppShell>
  )
}
createRoot(document.getElementById('app')!).render(<App />)
