import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './aspect-ratio.css'
export interface AspectRatioProps extends ComponentPropsWithoutRef<'div'> {
  ratio?: number
}
export function AspectRatio({
  ratio = 16 / 9,
  style,
  className = '',
  ...props
}: AspectRatioProps): ReactElement {
  return (
    <div
      {...props}
      style={{ aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9, ...style }}
      className={('al-aspect-ratio ' + className).trim()}
    />
  )
}
