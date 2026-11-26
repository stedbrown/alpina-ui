import { numberText } from './number-text.js'
import { formatSwissNumber } from '../swiss/format-swiss-number.js'
import type { SwissMessageLocale } from '../swiss/locales.js'
import { useId, type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react'
import type { ChartDatum } from './chart-datum.js'
import './plots.css'

export interface PlotProps extends Omit<ComponentPropsWithoutRef<'figure'>, 'title' | 'children'> {
  title: string
  description?: string
  /** Missing or non-finite values stay in the sequence as a gap and read as a dash in the table. */
  data: readonly ChartDatum[]
  /** Selects the default labels and Swiss digit grouping. Defaults to English with Swiss grouping. */
  locale?: SwissMessageLocale
  formatValue?: (value: number) => string
  categoryLabel?: string
  valueLabel?: string
  tableLabel?: string
  loading?: boolean
  loadingLabel?: string
  emptyLabel?: string
}

const labels: Readonly<Record<SwissMessageLocale, { category: string; value: string; table: string; empty: string; loading: string; comparison: string }>> = {
  en: { category: 'Category', value: 'Value', table: 'Data table', empty: 'No observations', loading: 'Loading data…', comparison: 'Comparison' },
  'de-CH': { category: 'Kategorie', value: 'Wert', table: 'Datentabelle', empty: 'Keine Daten', loading: 'Daten werden geladen…', comparison: 'Vergleich' },
  'fr-CH': { category: 'Catégorie', value: 'Valeur', table: 'Tableau des données', empty: 'Aucune donnée', loading: 'Chargement des données…', comparison: 'Comparaison' },
  'it-CH': { category: 'Categoria', value: 'Valore', table: 'Tabella dei dati', empty: 'Nessun dato', loading: 'Caricamento dei dati…', comparison: 'Confronto' },
  'rm-CH': { category: 'Categoria', value: 'Valur', table: 'Tabella da datas', empty: 'Naginas datas', loading: 'Chargiar las datas…', comparison: 'Cumparegliaziun' },
}
export function plotLabels(locale: SwissMessageLocale = 'en') { return labels[locale] ?? labels.en }
export function defaultPlotFormat(locale: SwissMessageLocale = 'en') { return (value: number) => formatSwissNumber(value, locale) }
export const MISSING = '—'
export function finiteRows(rows: readonly ChartDatum[]) { return rows.filter(row => Number.isFinite(row.value)) }

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
  const hatch = useId() + '-loss'
  const origin = position(0)
  const end = position(value)
  return <svg className="al-value-bar" width="100%" height="24" aria-hidden="true">
    {value < 0 && <defs><pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse">
      <path d="M-1 1L1 -1M0 6L6 0M5 7L7 5" />
    </pattern></defs>}
    <line x1={origin + '%'} x2={origin + '%'} y1="0" y2="24" />
    <rect fill={value < 0 ? 'url(#' + hatch + ')' : undefined} x={Math.min(origin, end) + '%'} y="4" width={Math.abs(end - origin) + '%'} height="16" />
  </svg>
}

export function SeriesTable({ rows, category, value, format, comparison }: {
  rows: readonly ChartDatum[]; category: string; value: string; format: (n: number) => string
  comparison?: { label: string; position: (n: number) => number }
}) {
  return <table className="al-series-table">
    <thead><tr><th scope="col">{category}</th>{comparison && <th scope="col">{comparison.label}</th>}
      <th scope="col">{value}</th></tr></thead>
    <tbody>{rows.map((row, i) => { const known = Number.isFinite(row.value)
      return <tr key={i}><th scope="row">{row.label}</th>
        {comparison && <td>{known && <ValueBar value={row.value} position={comparison.position} />}</td>}
        <td>{known ? format(row.value) : MISSING}</td></tr> })}</tbody>
  </table>
}

interface FrameProps extends PlotProps {
  elementRef: Ref<HTMLElement>
  /** Receives every observation in order, including gaps. At least one value is finite. */
  renderPlot: (rows: readonly ChartDatum[], format: (n: number) => string) => ReactNode
  isTable?: boolean
}
export function PlotFrame({ title, description, data, locale, formatValue, categoryLabel, valueLabel, tableLabel,
  emptyLabel, loading = false, loadingLabel, elementRef, renderPlot, isTable, className = '', ...props }: FrameProps) {
  const text = plotLabels(locale)
  const formatNumber = formatValue ?? defaultPlotFormat(locale)
  const format = (value: number) => numberText(formatNumber(value))
  const id = useId()
  return <figure {...props} ref={elementRef} className={('al-series ' + className).trim()}
    aria-labelledby={id} aria-describedby={description ? id + '-description' : undefined}>
    <figcaption id={id}>{title}</figcaption>
    {description && <p id={id + '-description'}>{description}</p>}
    {loading ? <p role="status">{loadingLabel ?? text.loading}</p> : finiteRows(data).length === 0 ? <p>{emptyLabel ?? text.empty}</p> : <>
      {renderPlot(data, format)}
      {!isTable && <details><summary>{tableLabel ?? text.table}</summary>
        <SeriesTable rows={data} category={categoryLabel ?? text.category} value={valueLabel ?? text.value} format={format} />
      </details>}
    </>}
  </figure>
}
