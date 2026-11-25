import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './aspect-ratio.css'
export interface AspectRatioProps extends ComponentPropsWithoutRef<'div'> {
  ratio?: number
  /** Use contain when the whole illustration or screenshot carries information. */
  fit?: 'contain' | 'cover'
}
export function AspectRatio({
  ratio = 16 / 9,
  fit,
  style,
  className = '',
  ...props
}: AspectRatioProps): ReactElement {
  return (
    <div
      {...props}
      data-fit={fit}
      style={{ aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9, ...style }}
      className={('al-aspect-ratio ' + className).trim()}
    />
  )
}
