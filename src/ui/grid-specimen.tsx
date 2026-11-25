import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './grid-specimen.css'

export interface GridSpecimenProps extends ComponentPropsWithoutRef<'div'> {
  /** Width of the proof in CSS pixels. Automatic proofs fill their container. */
  width?: number | 'auto'
  label: string
  /** Magnification factor. At 4, children lay out at one quarter of the available width. */
  zoom?: number
  /** Preview browser system colors without changing the rest of the page. */
  palette?: 'system'
}

/** Keep a proof at its intended width inside a keyboard-scrollable region. */
export const GridSpecimen = forwardRef<HTMLDivElement, GridSpecimenProps>(function GridSpecimen(
  { width = 'auto', zoom = 1, palette, label, children, className = '', tabIndex = 0, ...props }, ref,
) {
  if (width !== 'auto' && (!Number.isFinite(width) || width <= 0)) throw new RangeError('A proof width must be positive.')
  if (!Number.isFinite(zoom) || zoom <= 0) throw new RangeError('Proof zoom must be positive.')
  return <div {...props} ref={ref} role="region" aria-label={label} tabIndex={tabIndex}
    className={('al-grid-specimen ' + className).trim()}>
    <div className="al-grid-proof" data-palette={palette} style={{ inlineSize: width === 'auto' ? '100%' : width, zoom: zoom === 1 ? undefined : zoom }}>
      {children}
      <span aria-hidden="true" className="al-grid-proof-unit" />
    </div>
  </div>
})

export interface GridMeasurements {
  width: number
  columns: number
  margin: number
  gutter: number
  unit: number
  typeSize: number
  lineHeight: number
  scrollable: boolean
}

/** Observe the first Alpina Grid inside a mounted proof and a sample of its typography. */
export function observeGridSpecimen(viewport: HTMLElement, sample: HTMLElement, onMeasure: (metrics: GridMeasurements) => void) {
  const grid = viewport.querySelector<HTMLElement>('.al-grid')
  const unit = viewport.querySelector<HTMLElement>('.al-grid-proof-unit')
  if (!grid || !unit || !viewport.contains(sample)) throw new Error('A grid specimen needs a Grid and a text sample inside its viewport.')
  const px = (value: number) => Math.round(value * 10) / 10
  const measure = () => {
    const layout = getComputedStyle(grid)
    const type = getComputedStyle(sample)
    onMeasure({
      width: Math.round(grid.getBoundingClientRect().width),
      columns: layout.gridTemplateColumns.trim().split(/\s+/).length,
      margin: px(parseFloat(layout.paddingInlineStart)),
      gutter: px(parseFloat(layout.columnGap)),
      unit: px(unit.getBoundingClientRect().width),
      typeSize: px(parseFloat(type.fontSize)),
      lineHeight: px(parseFloat(type.lineHeight)),
      scrollable: viewport.scrollWidth > viewport.clientWidth + 1,
    })
  }
  measure()
  const observer = new ResizeObserver(measure)
  for (const element of [viewport, grid, sample, unit]) observer.observe(element)
  return () => observer.disconnect()
}
