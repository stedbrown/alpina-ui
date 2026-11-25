import { forwardRef } from 'react'
import { ComparisonPlot, type ComparisonPlotProps } from './comparison-plot.js'
export type { ChartSeries } from './comparison-plot.js'
import { PlotFrame } from './plot-frame.js'
import { SeriesLine } from './line-plot.js'

export interface LineChartProps extends ComparisonPlotProps {}
export const LineChart = forwardRef<HTMLElement, LineChartProps>(function LineChart({ series, data = [], ...props }, ref) {
  if (series) return <ComparisonPlot {...props} series={series} elementRef={ref} kind="lines" />
  return <PlotFrame {...props} data={data} elementRef={ref} renderPlot={(rows, format) =>
    <SeriesLine rows={rows} format={format} />} />
})
