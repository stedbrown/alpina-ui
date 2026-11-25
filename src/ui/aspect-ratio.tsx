import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './aspect-ratio.css'
export interface AspectRatioProps extends ComponentPropsWithoutRef<'div'> {
  ratio?: number
  /** Use contain when the whole illustration or screenshot carries information. */
  fit?: 'contain' | 'cover'
}
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  {
    ratio = 16 / 9,
    fit,
    style,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      {...props}
      data-fit={fit}
      style={{ aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9, ...style }}
      className={('al-aspect-ratio ' + className).trim()}
    />
  )
})
