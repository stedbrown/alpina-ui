import { forwardRef } from 'react'
import { PlotFrame, type PlotProps } from './plot-frame.js'
import { SeriesLine } from './line-plot.js'

export interface LineChartProps extends PlotProps {}
export const LineChart = forwardRef<HTMLElement, LineChartProps>(function LineChart(props, ref) {
  return <PlotFrame {...props} elementRef={ref} renderPlot={(rows, format) =>
    <SeriesLine rows={rows} format={format} />} />
})
