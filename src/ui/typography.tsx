import { numberText } from './number-text.js'
import { createElement, forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import './typography.css'

export type TypeRole = 'inherit' | 'caption' | 'label' | 'body' | 'lead' | 'heading' | 'display' | 'title' | 'poster' | 'masthead' | 'folio' | 'specimen'
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'output' | 'address'
  /** IDs of the controls contributing to a calculated output. */
  htmlFor?: string
  variant?: TypeRole
  measure?: 'reading' | 'narrow'
  /** Adjust display type to the active 4/8/12-column grid. */
  responsive?: boolean
  /** Natural font spacing or the calibrated tracking for the selected display role. */
  tracking?: 'normal' | 'optical' | number
  /** Font size in CSS pixels for the specimen role. Numeric tracking is measured in em. */
  specimenSize?: number
  numeric?: boolean
  tone?: 'ink' | 'paper' | 'accent'
}
export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  {
    as: Element = 'p',
    variant = 'body',
    measure,
    numeric = false,
    responsive = false,
    tracking,
    specimenSize,
    style,
    tone,
    className = '',
    ...props
  },
  ref,
) {
  if (specimenSize !== undefined && !(Number.isFinite(specimenSize) && specimenSize > 0)) throw new RangeError('Specimen size must be positive.')
  if (typeof tracking === 'number' && !Number.isFinite(tracking)) throw new RangeError('Tracking must be finite.')
  return createElement(Element, {
    style: (specimenSize !== undefined || typeof tracking === 'number') ? {
      '--al-specimen-size': specimenSize === undefined ? undefined : specimenSize + 'px',
      '--al-type-tracking': typeof tracking === 'number' ? tracking + 'em' : undefined,
      ...style,
    } as CSSProperties : style,
    ...props,
    ref,
    children: numeric && (typeof props.children === 'string' || typeof props.children === 'number' || typeof props.children === 'bigint')
      ? numberText(props.children) : props.children,
    className: ('al-type ' + className).trim(),
    'data-role': variant,
    'data-tone': tone,
    'data-tracking': typeof tracking === 'number' ? 'custom' : tracking,
    'data-measure': measure,
    'data-responsive': responsive || undefined,
    'data-numeric': numeric || undefined,
  })
})

export interface InlineCodeProps extends HTMLAttributes<HTMLElement> {
  /** Keep short identifiers together, including at punctuation. */
  unbroken?: boolean
}
export const InlineCode = forwardRef<HTMLElement, InlineCodeProps>(function InlineCode(
  { className = '', unbroken, ...props }, ref,
) {
  return <code {...props} ref={ref} data-unbroken={unbroken || undefined} className={('al-inline-code ' + className).trim()} />
})
