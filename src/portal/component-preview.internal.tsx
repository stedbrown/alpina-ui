'use client'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Label } from '../ui/label.js'
import { Select } from '../ui/select.js'
import './component-preview.internal.css'

export interface ComponentPreviewProps {
  visible?: boolean
  children: ReactNode
  title?: string
  widthLabel?: string
  fitLabel?: string
  widths?: readonly number[]
  onDialogDismiss?: () => void
}
export function ComponentPreview({
  visible = true, children, title = 'Interactive preview', widthLabel = 'Width', fitLabel = 'Fit',
  widths = [320, 480, 768], onDialogDismiss,
}: ComponentPreviewProps) {
  const [visited, setVisited] = useState(visible)
  const [width, setWidth] = useState('')
  const [measured, setMeasured] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!visible) {
      const dialogs = element.querySelectorAll<HTMLDialogElement>('dialog[open]')
      for (const dialog of dialogs) dialog.close()
      if (dialogs.length) onDialogDismiss?.()
      return
    }
    setVisited(true)
    const measure = () => setMeasured(Math.round(element.getBoundingClientRect().width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [visible, onDialogDismiss])
  return (
    <section className="al-preview" aria-labelledby={id + '-title'} hidden={!visible}>
      <div className="al-preview-toolbar">
        <h2 id={id + '-title'}>{title}</h2>
        <div className="al-preview-sizing">
          <Label htmlFor={id + '-width'}>{widthLabel}</Label>
          <Select id={id + '-width'} value={width} onChange={(e) => setWidth(e.target.value)}>
            <option value="">{fitLabel}</option>
            {widths.map(size => <option key={size} value={size}>{size} px</option>)}
          </Select>
          <span aria-label={measured ? 'Actual width ' + measured + ' pixels' : undefined}>{measured ? measured + ' px' : ''}</span>
        </div>
      </div>
      <div className="al-preview-stage">
        <div
          ref={ref}
          className="al-preview-content"
          style={width ? { width: 'min(100%, ' + width + 'px)' } : undefined}
        >
          {(visible || visited) && children}
        </div>
      </div>
    </section>
  )
}
