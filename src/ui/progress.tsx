import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './progress.css'

export interface ProgressProps extends Omit<ComponentPropsWithoutRef<'progress'>, 'value' | 'max'> {
  label: string
  value?: number
  max?: number
  formatValue?: (value: number, max: number) => string
  /** Print the label and the current value above the bar. The bar keeps the same accessible name and value. */
  showLabel?: boolean
}
export const Progress = forwardRef<HTMLProgressElement, ProgressProps>(function Progress(
  {
    label,
    value,
    max = 100,
    formatValue,
    showLabel = false,
    className = '',
    ...props
  },
  ref,
) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100
  const current =
    value !== undefined && Number.isFinite(value) ? Math.min(limit, Math.max(0, value)) : undefined
  const bar = (
    <progress
      ref={ref}
      {...props}
      max={limit}
      value={current}
      aria-label={label}
      aria-valuetext={
        current === undefined
          ? props['aria-valuetext']
          : (formatValue?.(current, limit) ?? props['aria-valuetext'])
      }
      className={`al-progress ${className}`.trim()}
    />
  )
  if (!showLabel) return bar
  const shown =
    current === undefined ? undefined : (formatValue?.(current, limit) ?? Math.round((current / limit) * 100) + '%')
  return (
    <div className="al-progress-field">
      {/* Hidden from assistive technology: the bar itself carries the same name and value. */}
      <div className="al-progress-header" aria-hidden="true">
        <span className="al-progress-label">{label}</span>
        {shown !== undefined && <span className="al-progress-value">{shown}</span>}
      </div>
      {bar}
    </div>
  )
})
