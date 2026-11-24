import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from 'react'
import './scroll-area.css'
export interface ScrollAreaProps extends ComponentPropsWithoutRef<'div'> {
  label: string
  maxHeight?: CSSProperties['maxBlockSize']
}
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { label, maxHeight, className = '', style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      {...props}
      style={{ maxBlockSize: maxHeight, ...style }}
      className={('al-scroll-area ' + className).trim()}
    />
  )
})
