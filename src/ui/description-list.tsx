import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './description-list.css'

export interface DescriptionListProps extends Omit<ComponentPropsWithoutRef<'dl'>, 'children'> {
  layout?: 'rows' | 'columns'
  /** Each term identifies a distinct value in the summary. */
  items: readonly { term: string; detail: ReactNode }[]
}

export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { items, layout = 'rows', className = '', ...props },
  ref,
) {
  return (
    <dl ref={ref} {...props} data-layout={layout} className={('al-description-list ' + className).trim()}>
      {items.map(({ term, detail }) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  )
})
