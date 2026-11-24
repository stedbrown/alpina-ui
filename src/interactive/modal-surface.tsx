'use client'
import { useId, useRef, type ReactNode, type ReactElement, type RefObject } from 'react'
import { useControllable } from './controllable.js'
import { useBrowserLayoutEffect } from './floating.js'
import './modal-surface.css'

export interface ModalSurfaceProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  trigger?: ReactNode
  triggerLabel?: string
  closeLabel: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  /** Receives initial focus if the target is mounted inside the dialog. */
  initialFocusRef?: RefObject<HTMLElement | null>
  footer?: ReactNode
}
interface SurfaceProps extends ModalSurfaceProps {
  kind: 'dialog' | 'sheet' | 'alert' | 'drawer'
  side?: 'start' | 'end'
  size?: 'compact' | 'regular' | 'wide'
  handle?: ReactNode
}
function outside(element: HTMLDialogElement, x: number, y: number) {
  const rect = element.getBoundingClientRect()
  return x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom
}
export function ModalSurface({
  kind,
  side,
  size,
  handle,
  title,
  description,
  children,
  trigger,
  triggerLabel,
  closeLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  initialFocusRef,
  footer,
}: SurfaceProps): ReactElement {
  const [visible, setVisible] = useControllable(open, defaultOpen, onOpenChange)
  const surface = useRef<HTMLDialogElement>(null)
  const pointer = useRef<number | null>(null)
  const id = useId()
  useBrowserLayoutEffect(() => {
    const node = surface.current
    if (!visible || !node) return
    const prior = node.ownerDocument.activeElement
    if (!node.open) node.showModal()
    if (initialFocusRef?.current && node.contains(initialFocusRef.current))
      initialFocusRef.current.focus({ preventScroll: true })
    return () => {
      if (node.open) node.close()
      if (
        prior instanceof HTMLElement &&
        prior.isConnected &&
        node.ownerDocument.activeElement === node.ownerDocument.body
      )
        prior.focus({ preventScroll: true })
    }
  }, [visible, initialFocusRef])
  return (
    <>
      {trigger != null && (
        <button
          type="button"
          className="al-overlay-trigger"
          aria-label={triggerLabel}
          aria-haspopup="dialog"
          aria-expanded={visible}
          aria-controls={id}
          onClick={() => setVisible(true)}
        >
          {trigger}
        </button>
      )}
      <dialog
        id={id}
        ref={surface}
        role={kind === 'alert' ? 'alertdialog' : undefined}
        className={['al-modal', kind === 'alert' ? 'al-alert-dialog' : 'al-' + kind, className]
          .filter(Boolean)
          .join(' ')}
        data-side={side}
        data-size={size}
        aria-labelledby={id + '-title'}
        aria-describedby={description != null ? id + '-description' : undefined}
        onCancel={(event) => {
          event.preventDefault()
          setVisible(false)
        }}
        onClose={(event) => {
          if (!event.currentTarget.open && visible) setVisible(false)
        }}
        onPointerDown={(event) => {
          pointer.current =
            kind !== 'alert' &&
            event.target === event.currentTarget &&
            outside(event.currentTarget, event.clientX, event.clientY)
              ? event.pointerId
              : null
        }}
        onPointerCancel={() => {
          pointer.current = null
        }}
        onPointerUp={(event) => {
          const started = pointer.current === event.pointerId
          pointer.current = null
          if (
            started &&
            event.target === event.currentTarget &&
            outside(event.currentTarget, event.clientX, event.clientY)
          )
            setVisible(false)
        }}
      >
        {handle}
        <div className="al-modal-header">
          <h2 className="al-modal-title" id={id + '-title'}>
            {title}
          </h2>
          {kind !== 'alert' && (
            <button
              type="button"
              className="al-modal-dismiss"
              aria-label={closeLabel}
              onClick={() => setVisible(false)}
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
        {description != null && (
          <p className="al-modal-description" id={id + '-description'}>
            {description}
          </p>
        )}
        {children != null && <div className="al-modal-content">{children}</div>}
        {footer != null && <div className="al-modal-footer">{footer}</div>}
      </dialog>
    </>
  )
}
