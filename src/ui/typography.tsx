import { numberText } from './number-text.js'
import { createElement, forwardRef, type HTMLAttributes } from 'react'
import './typography.css'

export type TypeRole = 'inherit' | 'caption' | 'label' | 'body' | 'lead' | 'heading' | 'display' | 'title' | 'poster'
export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  variant?: TypeRole
  measure?: 'reading' | 'narrow'
  numeric?: boolean
  tone?: 'ink' | 'paper' | 'accent'
}
export const Typography = forwardRef<HTMLElement, TypographyProps>(function Typography(
  {
    as: Element = 'p',
    variant = 'body',
    measure,
    numeric = false,
    tone,
    className = '',
    ...props
  },
  ref,
) {
  return createElement(Element, {
    ...props,
    ref,
    children: numeric && (typeof props.children === 'string' || typeof props.children === 'number' || typeof props.children === 'bigint')
      ? numberText(props.children) : props.children,
    className: ('al-type ' + className).trim(),
    'data-role': variant,
    'data-tone': tone,
    'data-measure': measure,
    'data-numeric': numeric || undefined,
  })
})
