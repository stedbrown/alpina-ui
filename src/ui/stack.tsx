import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ForwardRefExoticComponent, type RefAttributes } from 'react'
import { Slot, type SlottedSignature } from './slot.js'
import './stack.css'

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12

export interface StackProps extends ComponentPropsWithoutRef<'div'> {
  /** Apply spacing and layout to a single semantic child, including a list or form. */
  asChild?: boolean
  /** Arranges children in a row or column. */
  direction?: 'row' | 'column'
  /** Spacing in multiples of Alpina’s typographic unit. */
  gap?: Space
  /** Horizontal gap when it differs from the vertical gap. */
  columnGap?: Space
  /** Pad all sides in multiples of the typographic unit. */
  inset?: Space
  /** Ink and paper set a matching theme for controls inside the stack. */
  surface?: 'soft' | 'ink' | 'paper'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'space-between'
  /** Allows controls to wrap onto additional lines. */
  wrap?: boolean
  /** Show this presentation according to the browser's scripting capability. */
  scripting?: 'enabled' | 'none'
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    asChild = false,
    direction = 'column',
    gap = 4,
    columnGap,
    inset,
    surface,
    align,
    justify = 'start',
    wrap,
    scripting,
    className = '',
    style,
    ...props
  },
  ref,
) {
  const layout = {
    '--al-stack-gap': 'var(--al-space-' + gap + ')',
    columnGap: columnGap === undefined ? undefined : 'var(--al-space-' + columnGap + ')',
    padding: inset === undefined ? undefined : 'var(--al-space-' + inset + ')',
    flexDirection: direction,
    alignItems: align ?? (direction === 'row' ? 'center' : 'stretch'),
    justifyContent: justify,
    flexWrap: (wrap ?? direction === 'row') ? 'wrap' : 'nowrap',
    ...style,
  } as CSSProperties
  const theme = surface === 'ink' ? 'dark' : surface === 'paper' ? 'light' : undefined
  const Root = asChild ? Slot : 'div'
  return <Root data-scripting={scripting} data-al-theme={theme} data-surface={surface} {...props} ref={ref}
    className={('al-stack ' + className).trim()} style={layout} />
}) as SlottedSignature<StackProps> & ForwardRefExoticComponent<StackProps & RefAttributes<HTMLDivElement>>
