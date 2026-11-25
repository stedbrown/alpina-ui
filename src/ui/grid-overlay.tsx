import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Grid } from './grid.js'
import './grid-overlay.css'

export interface GridOverlayProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** A container overlay fills its nearest positioned ancestor. */
  placement?: 'viewport' | 'container'
  width?: 'site' | 'full'
}

/** A non-interactive proofing layer using the same column and margin calculations as Grid. */
export const GridOverlay = forwardRef<HTMLDivElement, GridOverlayProps>(function GridOverlay(
  { placement = 'viewport', width = 'site', className = '', ...props }, ref,
) {
  return (
    <div {...props} ref={ref} className={('al-grid-overlay ' + className).trim()}
      data-placement={placement} aria-hidden="true">
      <Grid guides width={width} />
    </div>
  )
})
