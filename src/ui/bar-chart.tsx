import { forwardRef } from 'react'
import { ComparisonPlot, type ComparisonPlotProps } from './comparison-plot.js'
export type { ChartSeries } from './comparison-plot.js'
import { PlotFrame, scaleSeries, ValueBar } from './plot-frame.js'

export interface BarChartProps extends ComparisonPlotProps {}
export const BarChart = forwardRef<HTMLElement, BarChartProps>(function BarChart({ series, data = [], ...props }, ref) {
  if (series) return <ComparisonPlot {...props} series={series} elementRef={ref} kind="bars" />
  return <PlotFrame {...props} data={data} elementRef={ref} renderPlot={(rows, format) => {
    const { position } = scaleSeries(rows)
    return <ol className="al-series-bars" aria-hidden="true">{rows.map((row, i) =>
      <li key={i}><span>{row.label}</span><ValueBar value={row.value} position={position} />
        <span>{format(row.value)}</span></li>)}</ol>
  }} />
})
