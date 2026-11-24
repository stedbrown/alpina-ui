import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from 'react'
import './stack.css'

type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12

export interface StackProps extends ComponentPropsWithoutRef<'div'> {
  /** Dispone i figli lungo una riga o una colonna. */
  direction?: 'row' | 'column'
  /** Distanza in multipli del modulo tipografico di Alpina. */
  gap?: Space
  /** Spazio fra colonne quando differisce dalla distanza verticale. */
  columnGap?: Space
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'space-between'
  /** Permette ai gruppi di controlli di scendere su più righe. */
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
