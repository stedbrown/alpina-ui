import { numberText } from './number-text.js'
import { Children, forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import './table.css'
export { TableAmount, type TableAmountProps, type AccountingValue, type AccountingNegativeStyle } from './table-amount.js'

export interface TableProps extends ComponentPropsWithoutRef<'table'> {
  /** Share available width evenly and wrap long values within their columns. */
  layout?: 'auto' | 'fixed'
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
}
export interface TableHeaderProps extends ComponentPropsWithoutRef<'thead'> {}
export interface TableBodyProps extends ComponentPropsWithoutRef<'tbody'> {}
export interface TableFooterProps extends ComponentPropsWithoutRef<'tfoot'> {}
export interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {
  variant?: 'subtotal' | 'total'
}
type CellAlignment = 'start' | 'end' | 'left' | 'center' | 'right'

export interface TableHeadProps extends ComponentPropsWithoutRef<'th'> {
  numeric?: boolean
  /** Override the default text alignment independently of numeric formatting. */
  textAlign?: CellAlignment
}
export interface TableCellProps extends ComponentPropsWithoutRef<'td'> {
  numeric?: boolean
  /** Override the default text alignment independently of numeric formatting. */
  textAlign?: CellAlignment
}
export interface TableCaptionProps extends ComponentPropsWithoutRef<'caption'> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { layout, stickyHeader, stickyFirstColumn, className = '', ...props },
  ref,
) {
  return <table ref={ref} {...props} data-layout={layout} data-sticky-header={stickyHeader || undefined} data-sticky-first={stickyFirstColumn || undefined} className={`al-table ${className}`.trim()} />
})
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(
  props,
  ref,
) {
  return <thead ref={ref} {...props} />
})
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  props,
  ref,
) {
  return <tbody ref={ref} {...props} />
})
export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(function TableFooter(
  props,
  ref,
) {
  return <tfoot ref={ref} {...props} />
})
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { variant, ...props },
  ref,
) {
  return <tr ref={ref} {...props} data-summary={variant} />
})
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { scope = 'col', numeric = false, textAlign, children, ...props },
  ref,
) {
  return <th ref={ref} data-unbroken={scope === 'col' && typeof children === 'string' && children.length <= 20 || undefined}
    {...props} scope={scope} data-numeric={numeric || undefined} data-text-align={textAlign}>{children}</th>
})
// A single imported identifier may be wider than its whole column.
function fitTableToken(child: ReactNode) {
  if (typeof child !== 'string' || !/^\S{32,}$/u.test(child)) return child
  return <span className="al-table-token" tabIndex={0}>{child}</span>
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { numeric = false, textAlign, children, ...props },
  ref,
) {
  const plainValue = typeof children === 'string' || typeof children === 'number' || typeof children === 'bigint'
  // A hyphen in an invoice number or ISO date is part of its identifier.
  const identifier = typeof children === 'string' && /^(?=[\w.-]*\d)[\w]+(?:[.-][\w]+)+$/u.test(children)
  const content = plainValue ? numberText(children) : children
  return <td data-unbroken={identifier || undefined} ref={ref} {...props} data-numeric={numeric || undefined} data-text-align={textAlign}>
    {plainValue && numeric ? <span className="al-table-value">{content}</span>
      : Array.isArray(content) ? Children.map(content, fitTableToken) : fitTableToken(content)}
  </td>
})
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(function TableCaption(
  props,
  ref,
) {
  return <caption ref={ref} {...props} />
})
