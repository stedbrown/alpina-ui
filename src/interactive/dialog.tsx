'use client'
import type { ReactElement } from 'react'
import { ModalSurface, type ModalSurfaceProps } from './modal-surface.js'
export interface DialogProps extends ModalSurfaceProps {
  size?: 'compact' | 'regular' | 'wide'
}
export function Dialog({ size = 'regular', ...props }: DialogProps): ReactElement {
  return <ModalSurface kind="dialog" size={size} {...props} />
}
