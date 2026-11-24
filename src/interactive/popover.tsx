'use client'
import { useId, useRef, type ReactNode, type ReactElement } from 'react'
import { Button } from '../ui/button.js'
import { useControllable } from './controllable.js'
import { useFloating, useBrowserLayoutEffect } from './floating.js'
import { useOutside } from './dismiss.js'
import './popover.css'

export interface PopoverProps {
  title: string
  trigger: ReactNode
  triggerLabel?: string
  children: ReactNode
  closeLabel: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}
export function Popover({
  title,
  trigger,
  triggerLabel,
  children,
  closeLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: PopoverProps): ReactElement {
  const [visible, setVisible] = useControllable(open, defaultOpen, onOpenChange)
  const root = useRef<HTMLDivElement>(null),
    anchor = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLDivElement>(null)
  const id = useId()
  useFloating(visible, anchor, panel, 'menu')
  useOutside(visible, root, () => setVisible(false))
  useBrowserLayoutEffect(() => {
    if (visible) panel.current?.focus({ preventScroll: true })
  }, [visible])
  function close() {
    anchor.current?.focus({ preventScroll: true })
    setVisible(false)
  }
  return (
    <div
      className={['al-popover', className].filter(Boolean).join(' ')}
      ref={root}
      onKeyDown={(e) => {
        if (visible && e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          close()
        }
      }}
    >
      <Button
        ref={anchor}
        variant="outline"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-controls={visible ? id : undefined}
        aria-expanded={visible}
        onClick={() => setVisible(!visible)}
      >
        {trigger}
      </Button>
      {visible && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          tabIndex={-1}
          aria-labelledby={id + '-title'}
          className="al-popover-panel"
        >
          <div className="al-popover-head">
            <h3 id={id + '-title'}>{title}</h3>
            <Button variant="ghost" size="sm" aria-label={closeLabel} onClick={close}>
              <span aria-hidden="true">×</span>
            </Button>
          </div>
          {children}
        </div>
      )}
    </div>
  )
}
