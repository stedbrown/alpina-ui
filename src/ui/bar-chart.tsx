import { forwardRef } from 'react'
import { ComparisonPlot, type ComparisonPlotProps } from './comparison-plot.js'
export type { ChartSeries } from './comparison-plot.js'
import { finiteRows, MISSING, PlotFrame, scaleSeries, ValueBar } from './plot-frame.js'

export interface BarChartProps extends ComparisonPlotProps {}
export const BarChart = forwardRef<HTMLElement, BarChartProps>(function BarChart({ series, data = [], ...props }, ref) {
  if (series) return <ComparisonPlot {...props} series={series} elementRef={ref} kind="bars" />
  return <PlotFrame {...props} data={data} elementRef={ref} renderPlot={(rows, format) => {
    const { position } = scaleSeries(finiteRows(rows))
    return <ol className="al-series-bars" aria-hidden="true">{rows.map((row, i) => { const known = Number.isFinite(row.value)
      return <li key={i}><span>{row.label}</span>{known ? <ValueBar value={row.value} position={position} /> : <span />}
        <span>{known ? format(row.value) : MISSING}</span></li> })}</ol>
  }} />
})
