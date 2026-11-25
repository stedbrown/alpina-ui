import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './progress.css'

export interface ProgressProps extends Omit<ComponentPropsWithoutRef<'progress'>, 'value' | 'max'> {
  label: string
  value?: number
  max?: number
  formatValue?: (value: number, max: number) => string
}
export const Progress = forwardRef<HTMLProgressElement, ProgressProps>(function Progress(
  {
    label,
    value,
    max = 100,
    formatValue,
    className = '',
    ...props
  },
  ref,
) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100
  const current =
    value !== undefined && Number.isFinite(value) ? Math.min(limit, Math.max(0, value)) : undefined
  return (
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
})
