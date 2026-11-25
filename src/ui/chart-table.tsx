import { forwardRef } from 'react'
import { PlotFrame, SeriesTable, scaleSeries, type PlotProps } from './plot-frame.js'

export interface ChartTableProps extends PlotProps {
  comparisonLabel?: string
}
export const ChartTable = forwardRef<HTMLElement, ChartTableProps>(function ChartTable(
  { comparisonLabel = 'Comparison', categoryLabel = 'Category', valueLabel = 'Value', ...props }, ref,
) {
  return <PlotFrame {...props} elementRef={ref} isTable renderPlot={(rows, format) =>
    <SeriesTable rows={rows} category={categoryLabel} value={valueLabel} format={format}
      comparison={{ label: comparisonLabel, position: scaleSeries(rows).position }} />} />
})
