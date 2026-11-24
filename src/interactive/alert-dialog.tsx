'use client'
import { useRef, type ReactElement, type ReactNode } from 'react'
import { Button } from '../ui/button.js'
import { useControllable } from './controllable.js'
import { ModalSurface, type ModalSurfaceProps } from './modal-surface.js'
import './alert-dialog.css'
export interface AlertDialogProps extends Omit<
  ModalSurfaceProps,
  'closeLabel' | 'initialFocusRef' | 'footer' | 'description'
> {
  description: ReactNode
  cancelLabel: string
  confirmLabel: string
  onConfirm: () => void
}
export function AlertDialog({
  cancelLabel,
  confirmLabel,
  onConfirm,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: AlertDialogProps): ReactElement {
  const cancel = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useControllable(open, defaultOpen, onOpenChange)
  return (
    <ModalSurface
      kind="alert"
      {...props}
      closeLabel={cancelLabel}
      open={visible}
      onOpenChange={setVisible}
      initialFocusRef={cancel}
      footer={
        <>
          <Button ref={cancel} variant="outline" onClick={() => setVisible(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm()
              setVisible(false)
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
