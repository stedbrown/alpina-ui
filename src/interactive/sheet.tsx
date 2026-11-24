'use client'
import type { ReactElement } from 'react'
import { ModalSurface, type ModalSurfaceProps } from './modal-surface.js'
export interface SheetProps extends ModalSurfaceProps {
  side?: 'start' | 'end'
  size?: 'compact' | 'regular' | 'wide'
}
export function Sheet({ side = 'end', size = 'regular', ...props }: SheetProps): ReactElement {
  return <ModalSurface kind="sheet" side={side} size={size} {...props} />
}
