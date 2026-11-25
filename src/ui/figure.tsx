import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './figure.css'

export interface FigureProps extends ComponentPropsWithoutRef<'figure'> {
  /** Describes the media. Supply an empty alt for a purely decorative image. */
  image?: Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> & { src: string; alt: string }
  caption?: ReactNode
  credit?: ReactNode
}

export const Figure = forwardRef<HTMLElement, FigureProps>(function Figure(
  { image, caption, credit, children, className = '', ...props },
  ref,
) {
  return (
    <figure ref={ref} {...props} className={('al-figure ' + className).trim()}>
      {image && <img {...image} />}
      {children}
      {(caption != null || credit != null) && (
        <figcaption>
          {caption != null && <span>{caption}</span>}
          {credit != null && <span>{credit}</span>}
        </figcaption>
      )}
    </figure>
  )
})
