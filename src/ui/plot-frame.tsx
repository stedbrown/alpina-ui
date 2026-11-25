import { useId, type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react'
import type { ChartDatum } from './chart-datum.js'
import './plots.css'

export interface PlotProps extends Omit<ComponentPropsWithoutRef<'figure'>, 'title' | 'children'> {
  title: string
  description?: string
  data: readonly ChartDatum[]
  formatValue?: (value: number) => string
  categoryLabel?: string
  valueLabel?: string
  tableLabel?: string
  loading?: boolean
  loadingLabel?: string
  emptyLabel?: string
}

export function scaleSeries(rows: readonly ChartDatum[], includeZero = true) {
  // Normalize before subtracting extrema so opposite finite magnitudes cannot overflow.
  const magnitude = rows.reduce((max, row) => Math.max(max, Math.abs(row.value)), 0) || 1
  const initial = includeZero ? 0 : rows[0]?.value ?? 0
  const min = rows.reduce((n, row) => Math.min(n, row.value), initial)
  const max = rows.reduce((n, row) => Math.max(n, row.value), initial)
  const lower = min / magnitude
  const range = max / magnitude - lower || 1
  return { min, max, position: (value: number) => 100 * (value / magnitude - lower) / range }
}

export function ValueBar({ value, position }: { value: number; position: (n: number) => number }) {
  const origin = position(0)
  const end = position(value)
  return <svg className="al-value-bar" width="100%" height="24" aria-hidden="true">
    <line x1={origin + '%'} x2={origin + '%'} y1="0" y2="24" />
    <rect x={Math.min(origin, end) + '%'} y="4" width={Math.abs(end - origin) + '%'} height="16" />
  </svg>
}

export function SeriesTable({ rows, category, value, format, comparison }: {
  rows: readonly ChartDatum[]; category: string; value: string; format: (n: number) => string
  comparison?: { label: string; position: (n: number) => number }
}) {
  return <table className="al-series-table">
    <thead><tr><th scope="col">{category}</th>{comparison && <th scope="col">{comparison.label}</th>}
      <th scope="col">{value}</th></tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}><th scope="row">{row.label}</th>
      {comparison && <td><ValueBar value={row.value} position={comparison.position} /></td>}
      <td>{format(row.value)}</td></tr>)}</tbody>
  </table>
}

interface FrameProps extends PlotProps {
  elementRef: Ref<HTMLElement>
  renderPlot: (rows: readonly ChartDatum[], format: (n: number) => string) => ReactNode
  isTable?: boolean
}
export function PlotFrame({ title, description, data, formatValue = String, categoryLabel = 'Category',
  valueLabel = 'Value', tableLabel = 'Data table', emptyLabel = 'No observations', loading = false,
  loadingLabel = 'Loading data…', elementRef, renderPlot, isTable, className = '', ...props }: FrameProps) {
  const id = useId()
  const rows = data.filter(row => Number.isFinite(row.value))
  return <figure {...props} ref={elementRef} className={('al-series ' + className).trim()}
    aria-labelledby={id} aria-describedby={description ? id + '-description' : undefined}>
    <figcaption id={id}>{title}</figcaption>
    {description && <p id={id + '-description'}>{description}</p>}
    {loading ? <p role="status">{loadingLabel}</p> : rows.length === 0 ? <p>{emptyLabel}</p> : <>
      {renderPlot(rows, formatValue)}
      {!isTable && <details><summary>{tableLabel}</summary>
        <SeriesTable rows={rows} category={categoryLabel} value={valueLabel} format={formatValue} />
      </details>}
    </>}
  </figure>
}
