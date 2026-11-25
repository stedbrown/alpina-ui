import type { ChartDatum } from './chart-datum.js'
import { scaleSeries } from './plot-frame.js'

export function SeriesLine({ rows, compact, format }: {
  rows: readonly ChartDatum[]; compact?: boolean; format: (n: number) => string
}) {
  const { min, max, position } = scaleSeries(rows, false)
  const height = compact ? 40 : 144
  const x = (index: number) => rows.length === 1 ? 50 : index * 100 / (rows.length - 1)
  const y = (value: number) => max === min ? height / 2 : height - 4 - position(value) * (height - 8) / 100
  const points = rows.map((row, i) => x(i) + ',' + y(row.value)).join(' ')
  const last = rows[rows.length - 1]
  return <div className={compact ? 'al-series-spark' : 'al-series-line'} aria-hidden="true">
    {!compact && <div className="al-series-scale" data-flat={min === max || undefined}><span>{format(max)}</span>{min !== max && <span>{format(min)}</span>}</div>}
    <svg width="100%" height={height} className="al-series-trace">
      {!compact && <>
        <line x1="0" x2="100%" y1={y(min)} y2={y(min)} />
        {max !== min && <line x1="0" x2="100%" y1={y(max)} y2={y(max)} />}
      </>}
      <svg width="100%" height={height} viewBox={'0 0 100 ' + height} preserveAspectRatio="none">
        <polyline points={points} fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <circle cx={x(rows.length - 1) + '%'} cy={y(last.value)} r="3" />
    </svg>
    {compact ? <span>{format(last.value)}</span> :
      <div className="al-series-range"><span>{rows[0].label}</span>{rows.length > 1 && <span>{last.label}</span>}</div>}
  </div>
}
