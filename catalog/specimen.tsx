import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Grid, GridItem, Typography, Select, Button, NavigationMenu } from 'alpina-ui'
import './specimen.css'

const programme = [
  { time: '09:30', title: 'La misura della pagina', format: 'Lezione' },
  { time: '11:00', title: 'Comporre con la griglia', format: 'Laboratorio' },
  { time: '14:15', title: 'Leggere la città', format: 'Conversazione' },
] as const

const widths = [
  { value: 'auto', label: 'Automatica' },
  { value: '320', label: '320 px' },
  { value: '640', label: '640 px' },
  { value: '960', label: '960 px' },
] as const
type Width = (typeof widths)[number]['value']

interface Measures {
  width: number
  columns: number
  margin: number
  gutter: number
  unit: number
  typeSize: number
  lineHeight: number
  scrollable: boolean
}

function px(value: string) {
  return Math.round(Number.parseFloat(value) * 10) / 10
}

export function Specimen() {
  const [width, setWidth] = useState<Width>('auto')
  const [guides, setGuides] = useState(false)
  const [measures, setMeasures] = useState<Measures>()
  const viewport = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    const scrollArea = viewport.current
    const grid = scrollArea?.querySelector<HTMLElement>('.al-grid')
    const title = scrollArea?.querySelector<HTMLElement>('.sp-poster-title')
    const unit = scrollArea?.querySelector<HTMLElement>('.sp-unit-probe')
    if (!scrollArea || !grid || !title || !unit) return
    function measure() {
      if (!scrollArea || !grid || !title || !unit) return
      const layout = getComputedStyle(grid)
      const type = getComputedStyle(title)
      const next: Measures = {
        width: Math.round(grid.getBoundingClientRect().width),
        columns: layout.gridTemplateColumns.trim().split(/\s+/).length,
        margin: px(layout.paddingInlineStart),
        gutter: px(layout.columnGap),
        unit: Math.round(unit.getBoundingClientRect().width * 10) / 10,
        typeSize: px(type.fontSize),
        lineHeight: px(type.lineHeight),
        scrollable: scrollArea.scrollWidth > scrollArea.clientWidth + 1,
      }
      setMeasures(next)
    }
    measure()
    const observer = new ResizeObserver(measure)
    for (const node of [scrollArea, grid, title, unit]) observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="sp-home">
      <header className="sp-head">
        <Typography variant="display" as="h1" className="sp-product">
          Alpina UI
        </Typography>
        <Typography as="p" variant="body" className="sp-intro">
          Componenti React per progettare con la tipografia svizzera. Prova il programma qui sotto,
          misura le colonne e consulta il codice.
        </Typography>
      </header>
      <section className="sp-workbench" aria-label="Campionario tipografico">
        <div className="sp-toolbar">
          <Typography variant="label" as="p" className="sp-toolbar-title">
            Campione tipografico
          </Typography>
          <div className="sp-controls">
            <div className="sp-width">
              <label htmlFor={id + '-width'}>Larghezza</label>
              <Select
                id={id + '-width'}
                value={width}
                onChange={(event) => {
                  setWidth(event.target.value as Width)
                  viewport.current?.scrollTo({ left: 0 })
                }}
              >
                {widths.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="sp-guides-button"
              aria-pressed={guides}
              aria-controls={id}
              onClick={() => setGuides(!guides)}
            >
              <span className="sp-guides-icon" aria-hidden="true" />
              Mostra griglia
            </Button>
          </div>
        </div>
        <div
          ref={viewport}
          className="sp-viewport"
          tabIndex={measures?.scrollable ? 0 : undefined}
          role="region"
          aria-label="Programma illustrativo degli incontri di grafica"
          id={id}
        >
          <div
            className="sp-sheet"
            style={{ '--sp-width': width === 'auto' ? '100%' : width + 'px' } as CSSProperties}
          >
            <Grid guides={guides}>
              <GridItem className="sp-running-head">
                <Typography variant="label" as="span">
                  Lugano
                </Typography>
                <Typography variant="caption" as="span">
                  Programma illustrativo
                </Typography>
              </GridItem>
              <GridItem small={1} medium={2} large={3} className="sp-date-cell">
                <time dateTime="2026-11-24" aria-label="24 novembre 2026" className="sp-date">
                  <strong>24</strong>
                  <span>nov.</span>
                  <span>2026</span>
                </time>
              </GridItem>
              <GridItem small={3} medium={6} large={9} className="sp-title-cell">
                <Typography variant="display" as="h2" className="sp-poster-title">
                  <span>Incontri</span> <span>di grafica</span>
                </Typography>
              </GridItem>
              <GridItem className="sp-print" aria-hidden="true">
                <i />
                <i />
                <i />
              </GridItem>
              {programme.map((session) => (
                <GridItem key={session.time} className="sp-session">
                  <time dateTime={session.time} className="sp-time">
                    {session.time}
                  </time>
                  <div className="sp-session-text">
                    <Typography variant="label" as="h3">
                      {session.title}
                    </Typography>
                    <Typography variant="caption" as="span">
                      {session.format}
                    </Typography>
                  </div>
                </GridItem>
              ))}
            </Grid>
            <span className="sp-unit-probe" aria-hidden="true" />
          </div>
        </div>
        {measures?.scrollable && <p className="sp-scroll-hint">Scorri il campione in orizzontale.</p>}
        <dl className="sp-measures" aria-label="Misure effettive del campione">
          <div>
            <dt>Larghezza</dt>
            <dd>{measures ? measures.width + ' px' : '—'}</dd>
          </div>
          <div>
            <dt>Colonne</dt>
            <dd>{measures?.columns ?? '—'}</dd>
          </div>
          <div>
            <dt>Margine</dt>
            <dd>{measures ? measures.margin + ' px' : '—'}</dd>
          </div>
          <div>
            <dt>Intercolonna</dt>
            <dd>{measures ? measures.gutter + ' px' : '—'}</dd>
          </div>
          <div>
            <dt>Unità</dt>
            <dd>{measures ? measures.unit + ' px' : '—'}</dd>
          </div>
          <div>
            <dt>Corpo / interlinea titolo</dt>
            <dd>{measures ? measures.typeSize + ' / ' + measures.lineHeight + ' px' : '—'}</dd>
          </div>
        </dl>
      </section>
      <NavigationMenu
        className="sp-links"
        label="Esplora il sistema"
        orientation="horizontal"
        sections={[
          {
            links: [
              { href: '#guide/design', label: 'Guida al design' },
              { href: '#guide/research', label: 'Ricerca e fonti' },
              { href: '#grid', label: 'Griglia' },
              { href: '#typography', label: 'Tipografia' },
              { href: '#rubrica', label: 'Rubrica di esempio' },
            ],
          },
        ]}
      />
    </div>
  )
}
