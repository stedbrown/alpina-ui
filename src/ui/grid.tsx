import { createElement, forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import './grid.css'

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  guides?: boolean
  as?: 'div' | 'header' | 'main' | 'section' | 'article' | 'footer'
  /** Block padding for a compact band, a content section, or a larger opening section. */
  space?: 'compact' | 'section' | 'cover'
  /** Center the columns in the site's 100rem frame while the surface stays full width. */
  width?: 'site' | 'full'
  /** Align items within their grid row. The default is stretch. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  surface?: 'paper' | 'ink' | 'accent'
  /** Prints the column numbers and gutters of the active responsive grid. */
  ruler?: boolean
}
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  {
    as: Element = 'div',
    guides = false,
    ruler = false,
    space,
    width,
    align,
    surface,
    children,
    className = '',
    ...props
  },
  ref,
) {
  return createElement(
    Element,
    { ...props, ref, 'data-space': space, 'data-surface': surface, className: ('al-layout ' + className).trim() },
    <div className="al-grid" data-width={width} data-align={align} data-guides={guides || undefined}>
      {children}
      {ruler && (
        <div className="al-grid-ruler" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i}>{i + 1}</span>)}
        </div>
      )}
      {guides && (
        <div className="al-grid-guides" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      )}
    </div>,
  )
})
type Span4 = 1 | 2 | 3 | 4
type Span8 = Span4 | 5 | 6 | 7 | 8
type Span12 = Span8 | 9 | 10 | 11 | 12
export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  small?: Span4
  medium?: Span8
  large?: Span12
  start?: { small?: Span4; medium?: Span8; large?: Span12 }
  children?: ReactNode
}
export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(function GridItem(
  {
    start,
    small = 4,
    medium = 8,
    large = 12,
    className = '',
    style,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      {...props}
      className={('al-grid-item ' + className).trim()}
      style={
        {
          '--al-span-s': small,
          '--al-span-m': medium,
          '--al-span-l': large,
          '--al-start-s': start?.small && Math.min(start.small, 5 - small),
          '--al-start-m': start?.medium && Math.min(start.medium, 9 - medium),
          '--al-start-l': start?.large && Math.min(start.large, 13 - large),
          ...style,
        } as CSSProperties
      }
    />
  )
})
