import { numberText } from './number-text.js'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './table.css'
export { TableAmount, type TableAmountProps, type AccountingValue, type AccountingNegativeStyle } from './table-amount.js'

export interface TableProps extends ComponentPropsWithoutRef<'table'> {
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
}
export interface TableHeaderProps extends ComponentPropsWithoutRef<'thead'> {}
export interface TableBodyProps extends ComponentPropsWithoutRef<'tbody'> {}
export interface TableFooterProps extends ComponentPropsWithoutRef<'tfoot'> {}
export interface TableRowProps extends ComponentPropsWithoutRef<'tr'> {
  variant?: 'subtotal' | 'total'
}
export interface TableHeadProps extends ComponentPropsWithoutRef<'th'> {
  numeric?: boolean
}
export interface TableCellProps extends ComponentPropsWithoutRef<'td'> {
  numeric?: boolean
}
export interface TableCaptionProps extends ComponentPropsWithoutRef<'caption'> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { stickyHeader, stickyFirstColumn, className = '', ...props },
  ref,
) {
  return <table ref={ref} {...props} data-sticky-header={stickyHeader || undefined} data-sticky-first={stickyFirstColumn || undefined} className={`al-table ${className}`.trim()} />
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
  { scope = 'col', numeric = false, ...props },
  ref,
) {
  return <th ref={ref} {...props} scope={scope} data-numeric={numeric || undefined} />
})
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { numeric = false, children, ...props },
  ref,
) {
  const plainValue = typeof children === 'string' || typeof children === 'number' || typeof children === 'bigint'
  return <td ref={ref} {...props} data-numeric={numeric || undefined}>
    {plainValue ? (numeric ? <span className="al-table-value">{numberText(children)}</span> : numberText(children)) : children}
  </td>
})
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(function TableCaption(
  props,
  ref,
) {
  return <caption ref={ref} {...props} />
})
