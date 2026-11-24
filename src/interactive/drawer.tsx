'use client'
import { useRef, type PointerEvent, type ReactElement } from 'react'
import { useControllable } from './controllable.js'
import { ModalSurface, type ModalSurfaceProps } from './modal-surface.js'
import './drawer.css'

export interface DrawerProps extends ModalSurfaceProps {
  swipeToClose?: boolean
}
export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  swipeToClose = true,
  ...props
}: DrawerProps): ReactElement {
  const [visible, setVisible] = useControllable(open, defaultOpen, onOpenChange)
  const start = useRef<{ y: number; pointer: number } | null>(null)
  function drag(event: PointerEvent<HTMLDivElement>, end = false) {
    if (!start.current || event.pointerId !== start.current.pointer) return
    const dialog = event.currentTarget.closest('dialog')
    if (!dialog) return
    const distance = Math.max(0, event.clientY - start.current.y)
    if (end) {
      start.current = null
      dialog.style.removeProperty('--al-drag')
      if (distance > Math.min(96, dialog.clientHeight / 3)) setVisible(false)
    } else dialog.style.setProperty('--al-drag', distance + 'px')
  }
  return (
    <ModalSurface
      {...props}
      kind="drawer"
      open={visible}
      onOpenChange={setVisible}
      handle={
        swipeToClose ? (
          <div
            aria-hidden="true"
            className="al-drawer-grip"
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0) return
              start.current = { y: e.clientY, pointer: e.pointerId }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => drag(e)}
            onPointerUp={(e) => drag(e, true)}
            onLostPointerCapture={(e) => {
              start.current = null
              e.currentTarget.closest('dialog')?.style.removeProperty('--al-drag')
            }}
          />
        ) : undefined
      }
    />
  )
}
