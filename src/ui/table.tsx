import type { ComponentPropsWithoutRef, ReactElement } from 'react'
import './table.css'

export type TableProps = ComponentPropsWithoutRef<'table'>
export type TableHeaderProps = ComponentPropsWithoutRef<'thead'>
export type TableBodyProps = ComponentPropsWithoutRef<'tbody'>
export type TableFooterProps = ComponentPropsWithoutRef<'tfoot'>
export type TableRowProps = ComponentPropsWithoutRef<'tr'>
export interface TableHeadProps extends ComponentPropsWithoutRef<'th'> {
  numeric?: boolean
}
export interface TableCellProps extends ComponentPropsWithoutRef<'td'> {
  numeric?: boolean
}
export type TableCaptionProps = ComponentPropsWithoutRef<'caption'>

export function Table({ className = '', ...props }: TableProps): ReactElement {
  return <table {...props} className={`al-table ${className}`.trim()} />
}
export function TableHeader(props: TableHeaderProps): ReactElement {
  return <thead {...props} />
}
export function TableBody(props: TableBodyProps): ReactElement {
  return <tbody {...props} />
}
export function TableFooter(props: TableFooterProps): ReactElement {
  return <tfoot {...props} />
}
export function TableRow(props: TableRowProps): ReactElement {
  return <tr {...props} />
}
export function TableHead({ scope = 'col', numeric = false, ...props }: TableHeadProps): ReactElement {
  return <th {...props} scope={scope} data-numeric={numeric || undefined} />
}
export function TableCell({ numeric = false, children, ...props }: TableCellProps): ReactElement {
  const plainValue = typeof children === 'string' || typeof children === 'number' || typeof children === 'bigint'
  return <td {...props} data-numeric={numeric || undefined}>
    {numeric && plainValue ? <span className="al-table-value">{children}</span> : children}
  </td>
}
export function TableCaption(props: TableCaptionProps): ReactElement {
  return <caption {...props} />
}
