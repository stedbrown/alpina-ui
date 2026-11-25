import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react'
import { Typography, InlineCode } from '../ui/typography.js'
import './prose.css'

export interface ProseProps extends ComponentPropsWithoutRef<'article'> {}
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose(
  { className = '', ...props },
  ref,
) {
  return <article ref={ref} {...props} className={'al-prose ' + className} />
})

/** An article with a heading, summary, optional identifier and a toolbar. */
export interface ReferenceArticleProps extends Omit<ComponentPropsWithoutRef<'article'>, 'title'> {
  title: ReactNode
  headingId: string
  summary: ReactNode
  identifier?: ReactNode
  toolbar?: ReactNode
}
export const ReferenceArticle = forwardRef<HTMLElement, ReferenceArticleProps>(function ReferenceArticle(
  { title, headingId, summary, identifier, toolbar, children, className = '', ...props }, ref,
) {
  return <article ref={ref} {...props} aria-labelledby={headingId} className={('al-reference-article ' + className).trim()}>
    <header className="al-reference-heading">
      <Typography variant="display" as="h1" id={headingId}>{title}</Typography>
      <Typography>{summary}</Typography>
      {identifier && <InlineCode>{identifier}</InlineCode>}
    </header>
    {toolbar}
    {children}
  </article>
})

export interface CodeSampleProps extends Omit<ComponentPropsWithoutRef<'pre'>, 'children'> {
  code: string
  language?: string
}
/** Selectable, keyboard-scrollable source for static articles. */
export const CodeSample = forwardRef<HTMLPreElement, CodeSampleProps>(function CodeSample(
  { code, language, className = '', ...props }, ref,
) {
  return <pre ref={ref} tabIndex={0} {...props} className={('al-code-sample ' + className).trim()}><code className={language ? 'language-' + language : undefined}>{code}</code></pre>
})
