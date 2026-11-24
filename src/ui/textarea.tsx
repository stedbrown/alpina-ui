import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './textarea.css'

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  autoGrow?: boolean
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { rows = 3, autoGrow = false, className = '', ...props },
  ref,
) {
  return (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      data-grow={autoGrow || undefined}
      className={`al-textarea ${className}`.trim()}
    />
  )
})
