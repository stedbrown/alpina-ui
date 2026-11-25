import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Label, Select } from 'alpina-ui'

export function Preview({ visible, children }: { visible: boolean; children: ReactNode }) {
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
      if (dialogs.length)
        element
          .closest('article')
          ?.querySelector<HTMLButtonElement>('.view-toggle [aria-pressed="true"]')
          ?.focus()
      return
    }
    setVisited(true)
    const measure = () => setMeasured(Math.round(element.getBoundingClientRect().width))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [visible])
  return (
    <section className="sample" aria-labelledby={id + '-title'} hidden={!visible}>
      <div className="sample-toolbar">
        <h2 id={id + '-title'}>Interactive preview</h2>
        <div className="sample-size">
          <Label htmlFor={id + '-width'}>Width</Label>
          <Select id={id + '-width'} value={width} onChange={(e) => setWidth(e.target.value)}>
            <option value="">Fit</option>
            <option value="320">320 px</option>
            <option value="480">480 px</option>
            <option value="768">768 px</option>
          </Select>
          <span aria-label={measured ? 'Actual width ' + measured + ' pixels' : undefined}>{measured ? measured + ' px' : ''}</span>
        </div>
      </div>
      <div className="preview-stage">
        <div
          ref={ref}
          className="preview-object"
          style={width ? { width: 'min(100%, ' + width + 'px)' } : undefined}
        >
          {(visible || visited) && children}
        </div>
      </div>
    </section>
  )
}
