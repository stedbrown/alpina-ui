import { createElement, forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode, type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { Slot, type SlottedSignature } from './slot.js'
import './grid.css'
export { GridSpecimen, observeGridSpecimen, type GridMeasurements, type GridSpecimenProps } from './grid-specimen.js'

export type GridFields = 'thirds' | 'five-seven' | readonly string[]
function fieldName(name: string) {
  if (!/^[a-zA-Z][\w-]*$/.test(name)) throw new TypeError('Grid field names must start with a letter and contain letters, numbers, underscores or hyphens.')
  return 'al-field-' + name
}
function fieldMatrix(lines: readonly string[]) {
  const cells = lines.map(line => line.trim().split(/\s+/))
  const columns = cells[0]?.length
  if (!columns || cells.some(row => row.length !== columns)) throw new TypeError('Grid fields need equally wide rows.')
  const areas = new Map<string, { top: number; bottom: number; left: number; right: number; count: number }>()
  const template = cells.map((row, y) => '"' + row.map((name, x) => {
    if (name === '.') return '.'
    const area = areas.get(name) ?? { top: y, bottom: y, left: x, right: x, count: 0 }
    area.bottom = y
    area.left = Math.min(area.left, x)
    area.right = Math.max(area.right, x)
    area.count++
    areas.set(name, area)
    return fieldName(name)
  }).join(' ') + '"').join(' ')
  for (const [name, area] of areas) {
    if (area.count !== (area.right - area.left + 1) * (area.bottom - area.top + 1))
      throw new TypeError('Grid field "' + name + '" must form a rectangle.')
  }
  return { columns, template, rows: cells.length }
}
function positiveTrack(value: number | undefined) {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < 1))
    throw new RangeError('Grid row counts, starts and spans must be positive integers.')
  return value
}
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  guides?: boolean
  /** Introduce the first three rows once. Respects the reader's reduced-motion setting. */
  entrance?: 'sequence'
  as?: 'div' | 'header' | 'main' | 'section' | 'article' | 'footer'
  /** Block padding for a band or section. A viewport cover fills at least 100svh and grows with its content. */
  space?: 'compact' | 'section' | 'cover' | 'viewport' | 'chapter'
  /** Center the columns in the site's 100rem frame while the surface stays full width. */
  width?: 'site' | 'full'
  /** Align items within their grid row. The default is stretch. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  surface?: 'paper' | 'ink' | 'accent'
  /** Prints the column numbers and gutters of the active responsive grid. */
  ruler?: boolean
  /** Equal-height row tracks from the medium container breakpoint. */
  rows?: number
  /** Named lead/detail fields or a matrix of space-separated rectangular area names. */
  fields?: GridFields
}
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  {
    as: Element = 'div',
    guides = false,
    entrance,
    ruler = false,
    rows,
    fields,
    space,
    width,
    align,
    surface,
    children,
    className = '',
    ...props
  },
  ref,
) {
  const matrix = fields && typeof fields !== 'string' ? fieldMatrix(fields) : undefined
  const columns = matrix?.columns ?? 12
  const rowCount = positiveTrack(rows) ?? matrix?.rows
  if (matrix && rowCount !== matrix.rows) throw new RangeError('Grid rows must match the number of rows in fields.')
  const trackStyle = {
    '--al-field-columns': fields ? columns : undefined,
    '--al-grid-rows': rowCount,
    '--al-field-areas': matrix?.template,
  } as CSSProperties
  const tracks = ruler || guides ? Array.from({ length: Math.max(4, columns) }, (_, i) => i) : []
  return createElement(
    Element,
    { ...props, ref, 'data-entrance': entrance, 'data-space': space, 'data-surface': surface, className: ('al-layout ' + className).trim() },
    <div className="al-grid" data-width={width} data-align={align} data-guides={guides || undefined}
      data-fields={matrix ? 'matrix' : typeof fields === 'string' ? fields : undefined}
      data-rows={rowCount} style={trackStyle}>
      {children}
      {ruler && (
        <div className="al-grid-ruler" aria-hidden="true">
          {tracks.map(i => <span key={i} data-field-track={fields !== undefined && i < columns || undefined}>{i + 1}</span>)}
        </div>
      )}
      {guides && (
        <div className="al-grid-guides" id={props.id ? props.id + '-guides' : undefined} aria-hidden="true">
          {tracks.map(i => (
            <i key={i} data-field-track={fields !== undefined && i < columns || undefined} />
          ))}
        </div>
      )}
    </div>,
  )
})
type Span4 = 1 | 2 | 3 | 4
type Span8 = Span4 | 5 | 6 | 7 | 8
type Span12 = Span8 | 9 | 10 | 11 | 12
export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Apply position and subgrid to a single child, such as Card. */
  asChild?: boolean
  /** Group several items into one beat of the parent grid’s entrance sequence. */
  entranceStep?: 1 | 2 | 3
  field?: string
  /** One-based starting row and the number of shared rows occupied. */
  row?: number
  rowSpan?: number
  subgrid?: 'rows' | 'columns' | 'both'
  small?: Span4
  medium?: Span8
  large?: Span12
  start?: { small?: Span4; medium?: Span8; large?: Span12 }
  children?: ReactNode
}
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem(
  {
    start,
    asChild = false,
    entranceStep,
    field,
    row,
    rowSpan,
    subgrid,
    small = 4,
    medium = 8,
    large = 12,
    className = '',
    style,
    ...props
  },
  ref,
) {
  const Element = asChild ? Slot : 'div'
  return (
    <Element
      ref={ref}
      {...props}
      className={('al-grid-item ' + className).trim()}
      data-entrance-step={entranceStep}
      data-field={field}
      data-subgrid={subgrid}
      style={
        {
          '--al-span-s': small,
          '--al-span-m': medium,
          '--al-span-l': large,
          '--al-field-name': field === undefined ? undefined : fieldName(field),
          '--al-row': positiveTrack(row),
          '--al-row-span': positiveTrack(rowSpan),
          '--al-start-s': start?.small && Math.min(start.small, 5 - small),
          '--al-start-m': start?.medium && Math.min(start.medium, 9 - medium),
          '--al-start-l': start?.large && Math.min(start.large, 13 - large),
          ...style,
        } as CSSProperties
      }
    />
  )
}) as SlottedSignature<GridItemProps> & ForwardRefExoticComponent<GridItemProps & RefAttributes<HTMLDivElement>>

/** A semantic page region for composition without additional grid tracks. */
export interface PageRegionProps extends HTMLAttributes<HTMLElement> {
  as?: 'main' | 'article' | 'section' | 'div' | 'header' | 'footer' | 'aside'
}
export const PageRegion = forwardRef<HTMLElement, PageRegionProps>(function PageRegion(
  { as = 'div', ...props }, ref,
) {
  return createElement(as, { ...props, ref })
})
