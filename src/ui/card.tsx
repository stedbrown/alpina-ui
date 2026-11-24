import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './card.css'

export interface CardProps extends ComponentPropsWithoutRef<'div'> {
  as?: 'div' | 'section' | 'article'
}
export type CardHeaderProps = ComponentPropsWithoutRef<'div'>
export interface CardTitleProps extends ComponentPropsWithoutRef<'h2'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}
export type CardDescriptionProps = ComponentPropsWithoutRef<'p'>
export type CardContentProps = ComponentPropsWithoutRef<'div'>
export type CardFooterProps = ComponentPropsWithoutRef<'div'>

export function Card({ as: Container = 'div', className = '', ...props }: CardProps): ReactElement {
  return <Container {...props} className={`al-card ${className}`.trim()} />
}
export function CardHeader({ className = '', ...props }: CardHeaderProps): ReactElement {
  return <div {...props} className={`al-card-header ${className}`.trim()} />
}
export function CardTitle({
  as: Heading = 'h2',
  className = '',
  ...props
}: CardTitleProps): ReactElement {
  return <Heading {...props} className={`al-card-title ${className}`.trim()} />
}
export function CardDescription({ className = '', ...props }: CardDescriptionProps): ReactElement {
  return <p {...props} className={`al-card-description ${className}`.trim()} />
}
export function CardContent({ className = '', ...props }: CardContentProps): ReactElement {
  return <div {...props} className={`al-card-content ${className}`.trim()} />
}
export function CardFooter({ className = '', ...props }: CardFooterProps): ReactElement {
  return <div {...props} className={`al-card-footer ${className}`.trim()} />
}
