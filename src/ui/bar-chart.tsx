import { forwardRef } from 'react'
import { PlotFrame, scaleSeries, ValueBar, type PlotProps } from './plot-frame.js'

export interface BarChartProps extends PlotProps {}
export const BarChart = forwardRef<HTMLElement, BarChartProps>(function BarChart(props, ref) {
  return <PlotFrame {...props} elementRef={ref} renderPlot={(rows, format) => {
    const { position } = scaleSeries(rows)
    return <ol className="al-series-bars" aria-hidden="true">{rows.map((row, i) =>
      <li key={i}><span>{row.label}</span><ValueBar value={row.value} position={position} />
        <span>{format(row.value)}</span></li>)}</ol>
  }} />
})
