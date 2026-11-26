import { forwardRef } from 'react'
import { finiteRows, plotLabels, PlotFrame, SeriesTable, scaleSeries, type PlotProps } from './plot-frame.js'

export interface ChartTableProps extends PlotProps {
  comparisonLabel?: string
}
export const ChartTable = forwardRef<HTMLElement, ChartTableProps>(function ChartTable(
  { comparisonLabel, categoryLabel, valueLabel, ...props }, ref,
) {
  const text = plotLabels(props.locale)
  return <PlotFrame {...props} elementRef={ref} isTable renderPlot={(rows, format) =>
    <SeriesTable rows={rows} category={categoryLabel ?? text.category} value={valueLabel ?? text.value} format={format}
      comparison={{ label: comparisonLabel ?? text.comparison, position: scaleSeries(finiteRows(rows)).position }} />} />
})
