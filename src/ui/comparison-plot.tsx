import type { Ref } from 'react'
import { PlotFrame, scaleSeries, ValueBar, type PlotProps } from './plot-frame.js'
import type { ChartDatum } from './chart-datum.js'

export interface ChartSeries {
  name: string
  data: readonly ChartDatum[]
}

export interface ComparisonPlotProps extends Omit<PlotProps, 'data'> {
  /** Supply one ordered series in data, or compare named series on a common scale. */
  data?: readonly ChartDatum[]
  series?: readonly ChartSeries[]
}

function dash(index: number) { return index === 0 ? undefined : (index * 2 + 2) + ' 3' }

export function ComparisonPlot({ series = [], kind, elementRef, categoryLabel = 'Category', tableLabel = 'Data table', ...props }:
  Omit<ComparisonPlotProps, 'data'> & { kind: 'bars' | 'lines'; elementRef: Ref<HTMLElement> }) {
  const categories = [...new Set(series.flatMap(group => group.data.map(point => point.label)))]
  const observations = series.flatMap(group => group.data).filter(point => Number.isFinite(point.value))
  const values = series.map(group => new Map(group.data.filter(point => Number.isFinite(point.value)).map(point => [point.label, point.value])))
  const { min, max, position } = scaleSeries(observations, kind === 'bars')
  const x = (i: number) => categories.length === 1 ? 50 : 100 * i / (categories.length - 1)
  const y = (value: number) => max === min ? 72 : 140 - position(value) * 1.36

  return <PlotFrame {...props} data={observations} elementRef={elementRef} isTable renderPlot={(_, format) => <>
    <ul className="al-series-legend" data-kind={kind} aria-hidden="true">{series.map((group, index) =>
      <li key={index} data-series={index % 3}><svg width="24" height="12" aria-hidden="true">
        {kind === 'bars' ? <rect x="1" y="1" width="22" height="10" /> :
          <line x1="0" x2="24" y1="6" y2="6" strokeDasharray={dash(index)} />}
      </svg>{group.name}</li>)}</ul>
    {kind === 'bars' ? <div className="al-series-groups" aria-hidden="true">{categories.map(label => <div className="al-series-group" key={label}>
      <strong>{label}</strong><ol className="al-series-bars">{series.map((group, index) => {
        const value = values[index].get(label)
        return <li key={index} data-series={index % 3}><span>{group.name}</span>
          {value === undefined ? <span /> : <ValueBar value={value} position={position} />}
          <span>{value === undefined ? '—' : format(value)}</span></li>
      })}</ol></div>)}</div> : <div className="al-series-line" aria-hidden="true">
      <div className="al-series-scale" data-flat={min === max || undefined}><span>{format(max)}</span>{min !== max && <span>{format(min)}</span>}</div>
      <svg width="100%" height="144" className="al-series-trace">
        <line x1="0" x2="100%" y1={y(min)} y2={y(min)} />
        {max !== min && <line x1="0" x2="100%" y1={y(max)} y2={y(max)} />}
        {values.map((group, index) => {
          let path = '', previous = false
          for (const [i, label] of categories.entries()) {
            const value = group.get(label)
            if (value !== undefined) path += (previous ? 'L' : 'M') + x(i) + ' ' + y(value) + ' '
            previous = value !== undefined
          }
          return <g key={index} data-series={index % 3} className="al-series-line-group">
            <svg width="100%" height="144" viewBox="0 0 100 144" preserveAspectRatio="none">
              <path d={path} strokeDasharray={dash(index)} vectorEffect="non-scaling-stroke" />
            </svg>
            {categories.map((label, i) => { const value = group.get(label)
              return value === undefined ? null : <circle key={label} cx={x(i) + '%'} cy={y(value)} r="2" />
            })}
          </g>
        })}
      </svg>
      <div className="al-series-range"><span>{categories[0]}</span>{categories.length > 1 && <span>{categories.at(-1)}</span>}</div>
    </div>}
    <details><summary>{tableLabel}</summary><div className="al-series-table-scroll" role="region" aria-label={tableLabel} tabIndex={0}><table className="al-series-table">
      <thead><tr><th scope="col">{categoryLabel}</th>{series.map((group, i) => <th scope="col" key={i}>{group.name}</th>)}</tr></thead>
      <tbody>{categories.map(label => <tr key={label}><th scope="row">{label}</th>{values.map((group, i) => {
        const value = group.get(label)
        return <td key={i}>{value === undefined ? '—' : format(value)}</td>
      })}</tr>)}</tbody>
    </table></div></details>
  </>} />
}
