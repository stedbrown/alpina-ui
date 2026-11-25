import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './skeleton.css'

export interface SkeletonProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  variant?: 'block' | 'text' | 'avatar'
}
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = 'block', className = '', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      {...props}
      data-variant={variant}
      aria-hidden="true"
      className={`al-skeleton ${className}`.trim()}
    />
  )
})
