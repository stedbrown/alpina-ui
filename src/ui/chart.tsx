import { numberText } from './number-text.js'
import { forwardRef, useId, type ComponentPropsWithoutRef, type CSSProperties } from 'react'
import './chart.css'
import type { ChartDatum } from './chart-datum.js'
export type { ChartDatum } from './chart-datum.js'
export interface ChartProps extends Omit<ComponentPropsWithoutRef<'figure'>, 'title'> {
  title: string
  data: readonly ChartDatum[]
  formatValue?: (value: number) => string
  tableLabel?: string
  categoryLabel?: string
  valueLabel?: string
  emptyLabel?: string
}
export const Chart = forwardRef<HTMLElement, ChartProps>(function Chart(
  {
    title,
    data,
    formatValue = String,
    tableLabel = 'Data table',
    categoryLabel = 'Category',
    valueLabel = 'Value',
    emptyLabel = 'No data',
    className = '',
    ...props
  },
  ref,
) {
  const titleId = useId()
  const rows = data.filter((row) => Number.isFinite(row.value))
  const magnitude = rows.reduce((n, row) => Math.max(n, Math.abs(row.value)), 0) || 1
  const minimum = rows.reduce((n, row) => Math.min(n, row.value / magnitude), 0)
  const maximum = rows.reduce((n, row) => Math.max(n, row.value / magnitude), 0)
  const range = maximum - minimum || 1
  const origin = (-minimum / range) * 100
  return (
    <figure ref={ref} {...props} aria-labelledby={titleId} className={('al-chart ' + className).trim()}>
      <figcaption id={titleId}>{title}</figcaption>
      {rows.length === 0 ? (
        <p>{emptyLabel}</p>
      ) : (
        <>
          <ul
            aria-hidden="true"
            className="al-chart-plot"
            style={{ '--al-chart-origin': origin + '%' } as CSSProperties}
          >
            {rows.map((row, index) => {
              const extent = (Math.abs(row.value / magnitude) / range) * 100
              const start = row.value >= 0 ? origin : origin - extent
              return (
                <li key={index}>
                  <span>{row.label}</span>
                  <span className="al-chart-track">
                    <i
                      data-negative={row.value < 0 || undefined}
                      style={{ insetInlineStart: start + '%', inlineSize: extent + '%' }}
                    />
                  </span>
                  <span className="al-chart-value">{numberText(formatValue(row.value))}</span>
                </li>
              )
            })}
          </ul>
          <details>
            <summary>{tableLabel}</summary>
            <div className="al-chart-data">
              <table aria-labelledby={titleId}>
                <thead>
                  <tr>
                    <th scope="col">{categoryLabel}</th>
                    <th scope="col">{valueLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <th scope="row">{row.label}</th>
                      <td>{numberText(formatValue(row.value))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </figure>
  )
})
