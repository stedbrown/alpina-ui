import { createElement, forwardRef, type ComponentPropsWithoutRef } from 'react'
import './card.css'

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  as?: 'div' | 'section' | 'article'
}
export interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {}
export interface CardTitleProps extends ComponentPropsWithoutRef<'h2'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
export interface CardDescriptionProps extends ComponentPropsWithoutRef<'p'> {}
export interface CardContentProps extends ComponentPropsWithoutRef<'div'> {}
export interface CardFooterProps extends ComponentPropsWithoutRef<'div'> {}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as: Container = 'div', className = '', ...props },
  ref,
) {
  return createElement(Container, { ...props, ref, className: `al-card ${className}`.trim() })
})
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className = '', ...props },
  ref,
) {
  return <div ref={ref} {...props} className={`al-card-header ${className}`.trim()} />
})
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  {
    as: Heading = 'h2',
    className = '',
    ...props
  },
  ref,
) {
  return <Heading ref={ref} {...props} className={`al-card-title ${className}`.trim()} />
})
export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(function CardDescription(
  { className = '', ...props },
  ref,
) {
  return <p ref={ref} {...props} className={`al-card-description ${className}`.trim()} />
})
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { className = '', ...props },
  ref,
) {
  return <div ref={ref} {...props} className={`al-card-content ${className}`.trim()} />
})
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className = '', ...props },
  ref,
) {
  return <div ref={ref} {...props} className={`al-card-footer ${className}`.trim()} />
})
