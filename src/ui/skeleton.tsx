import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './skeleton.css'

export interface SkeletonProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  variant?: 'block' | 'text' | 'avatar'
}
export function Skeleton({ variant = 'block', className = '', ...props }: SkeletonProps): ReactElement {
  return (
    <div
      {...props}
      data-variant={variant}
      aria-hidden="true"
      className={`al-skeleton ${className}`.trim()}
    />
  )
}
