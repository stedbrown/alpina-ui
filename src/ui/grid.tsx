import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react'
import './grid.css'

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  guides?: boolean
}
export function Grid({ guides = false, children, className = '', ...props }: GridProps): ReactElement {
  return (
    <div {...props} className={('al-layout ' + className).trim()}>
      <div className="al-grid" data-guides={guides || undefined}>
        {children}
        {guides && (
          <div className="al-grid-guides" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
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
export function GridItem({
  start,
  small = 4,
  medium = 8,
  large = 12,
  className = '',
  style,
  ...props
}: GridItemProps): ReactElement {
  return (
    <div
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
}
