import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react'
import './description-list.css'

export interface DescriptionListProps extends Omit<ComponentPropsWithoutRef<'dl'>, 'children'> {
  /** Each term identifies a distinct value in the summary. */
  items: readonly { term: string; detail: ReactNode }[]
}

export function DescriptionList({ items, className = '', ...props }: DescriptionListProps): ReactElement {
  return (
    <dl {...props} className={('al-description-list ' + className).trim()}>
      {items.map(({ term, detail }) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  )
}
