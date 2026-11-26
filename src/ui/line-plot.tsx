import { CategoryAxis, LineGuides } from './plot-axis.js'
import type { ChartDatum } from './chart-datum.js'
import { finiteRows, scaleSeries } from './plot-frame.js'

export function SeriesLine({ rows, compact, format }: {
  rows: readonly ChartDatum[]; compact?: boolean; format: (n: number) => string
}) {
  // Every observation keeps its place on the category axis. A missing value breaks the line.
  const known = finiteRows(rows)
  const { min, max, position } = scaleSeries(known, false)
  const height = compact ? 40 : 144
  const x = (index: number) => rows.length === 1 ? 50 : index * 100 / (rows.length - 1)
  const y = (value: number) => max === min ? height / 2 : height - 4 - position(value) * (height - 8) / 100
  const runs: string[][] = [[]]
  rows.forEach((row, i) => {
    if (Number.isFinite(row.value)) runs[runs.length - 1].push(x(i) + ',' + y(row.value))
    else if (runs[runs.length - 1].length) runs.push([])
  })
  let lastIndex = rows.length - 1
  while (lastIndex > 0 && !Number.isFinite(rows[lastIndex].value)) lastIndex--
  const last = rows[lastIndex]
  return <div className={compact ? 'al-series-spark' : 'al-series-line'} aria-hidden="true">
    {!compact && <div className="al-series-scale" data-flat={min === max || undefined}><span>{format(max)}</span>{min !== max && <span>{format(min)}</span>}</div>}
    <svg width="100%" height={height} className="al-series-trace">
      {!compact && <LineGuides top={y(max)} bottom={y(min)} />}
      <svg width="100%" height={height} viewBox={'0 0 100 ' + height} preserveAspectRatio="none">
        {runs.filter(run => run.length > 1).map((run, i) =>
          <polyline key={i} points={run.join(' ')} fill="none" vectorEffect="non-scaling-stroke" />)}
      </svg>
      {runs.filter(run => run.length === 1).map((run, i) => { const [cx, cy] = run[0].split(',')
        return <circle key={i} cx={cx + '%'} cy={cy} r="2" /> })}
      <circle cx={x(lastIndex) + '%'} cy={y(last.value)} r="3" />
    </svg>
    {compact ? <span>{format(last.value)}</span> :
      <CategoryAxis labels={rows.map(row => row.label)} />}
  </div>
}
