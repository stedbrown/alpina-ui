import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from 'react'
import './stack.css'

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12

export interface StackProps extends ComponentPropsWithoutRef<'div'> {
  /** Arranges children in a row or column. */
  direction?: 'row' | 'column'
  /** Spacing in multiples of Alpina’s typographic unit. */
  gap?: Space
  /** Horizontal gap when it differs from the vertical gap. */
  columnGap?: Space
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'space-between'
  /** Allows controls to wrap onto additional lines. */
  wrap?: boolean
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 4,
    columnGap,
    align,
    justify = 'start',
    wrap,
    className = '',
    style,
    ...props
  },
  ref,
) {
  const layout = {
    '--al-stack-gap': 'var(--al-space-' + gap + ')',
    columnGap: columnGap === undefined ? undefined : 'var(--al-space-' + columnGap + ')',
    flexDirection: direction,
    alignItems: align ?? (direction === 'row' ? 'center' : 'stretch'),
    justifyContent: justify,
    flexWrap: (wrap ?? direction === 'row') ? 'wrap' : 'nowrap',
    ...style,
  } as CSSProperties
  return <div {...props} ref={ref} className={('al-stack ' + className).trim()} style={layout} />
})
