import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from 'react'
import './textarea.css'

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  autoGrow?: boolean
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { rows = 3, autoGrow = false, className = '', style, ...props },
  ref,
) {
  return (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      style={autoGrow ? { '--al-textarea-rows': rows > 0 ? rows : 3, ...style } as CSSProperties : style}
      data-grow={autoGrow || undefined}
      className={`al-textarea ${className}`.trim()}
    />
  )
})
