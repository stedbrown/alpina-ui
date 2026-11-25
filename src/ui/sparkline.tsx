import { forwardRef } from 'react'
import { PlotFrame, type PlotProps } from './plot-frame.js'
import { SeriesLine } from './line-plot.js'

export interface SparklineProps extends PlotProps {}
export const Sparkline = forwardRef<HTMLElement, SparklineProps>(function Sparkline(props, ref) {
  return <PlotFrame {...props} elementRef={ref} renderPlot={(rows, format) =>
    <SeriesLine rows={rows} format={format} compact />} />
})
