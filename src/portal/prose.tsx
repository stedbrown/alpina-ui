import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './prose.css'

export interface ProseProps extends ComponentPropsWithoutRef<'article'> {}
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  { className = '', ...props },
  ref,
) {
  return <article ref={ref} {...props} className={'al-prose ' + className} />
})
