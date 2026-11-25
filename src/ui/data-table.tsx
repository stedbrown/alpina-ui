'use client'

import { forwardRef, useId, useMemo, useState, type CSSProperties, type ForwardedRef, type Key, type ReactElement, type ReactNode, type RefAttributes } from 'react'
import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, TableAmount, type AccountingNegativeStyle } from './table.js'
import { accountingDate, minorUnits, type AccountingValue } from './accounting-values.js'
import { defaultSwissLocale, type SwissLocale } from '../swiss/locales.js'
import { ScrollArea } from './scroll-area.js'
import './data-table.css'

export interface DataColumn<Row> {
  id: string
  header: string
  cell: (row: Row) => ReactNode
  compare?: (a: Row, b: Row) => number
  align?: 'start' | 'end'
  /** Keep the full value, including a custom link or inline markup, on one line. */
  nowrap?: boolean
}
export type AccountingColumn<Row> = {
  id: string
  header: string
  sortable?: boolean
} & ({
  format: 'chf' | 'decimal'
  value: (row: Row) => AccountingValue | null | undefined
  fractionDigits?: number
  aggregate?: 'sum'
} | {
  format: 'swiss-date'
  value: (row: Row) => string | null | undefined
})

export type DataTableColumn<Row> = DataColumn<Row> | AccountingColumn<Row>
type Prepared<Row> = { row: Row; values: Map<string, string | bigint> }

export interface DataSort {
  column: string
  direction: 'ascending' | 'descending'
}
export interface DataTableProps<Row> {
  rows: readonly Row[]
  columns: readonly DataTableColumn<Row>[]
  rowKey: (row: Row) => Key
  caption: string
  empty: ReactNode
  sort?: DataSort | null
  defaultSort?: DataSort
  onSortChange?: (sort: DataSort) => void
  /** Instructions announced with the scroll region when at least one column is sortable. */
  sortHint?: string
  className?: string
  locale?: SwissLocale
  negativeStyle?: AccountingNegativeStyle
  stickyHeader?: boolean
  stickyFirstColumn?: boolean
  maxHeight?: CSSProperties['maxBlockSize']
  /** Display a named row group before its records and sort only within each group. */
  groupBy?: (row: Row) => string
  /** Label each group's subtotal, using the group name when omitted. */
  subtotalLabel?: (group: string) => string
  /** Add a grand total for columns marked aggregate="sum". */
  totalLabel?: string
}

function sortable<Row>(col: DataTableColumn<Row>) {
  return 'format' in col ? col.sortable !== false : !!col.compare
}
function alignment<Row>(col: DataTableColumn<Row>) {
  if (!('format' in col)) return col.align
  return col.format === 'swiss-date' ? undefined : 'end'
}
function precision(col: { format: 'chf' | 'decimal'; fractionDigits?: number }) {
  return col.format === 'chf' ? 2 : col.fractionDigits ?? 2
}

function DataTableView<Row>({
  rows, columns, rowKey, caption, empty, sort, defaultSort, onSortChange,
  sortHint = 'Use the buttons in the column headings to sort the rows.', className = '',
  locale = defaultSwissLocale, negativeStyle, stickyHeader, stickyFirstColumn, maxHeight,
  groupBy, subtotalLabel, totalLabel,
}: DataTableProps<Row>, ref: ForwardedRef<HTMLDivElement>): ReactElement {
  const hintId = useId()
  const hasSortHint = Boolean(sortHint) && columns.some(sortable)
  const [internal, setInternal] = useState<DataSort | null>(defaultSort ?? null)
  const current = sort === undefined ? internal : sort
  const active = columns.find(col => col.id === current?.column && sortable(col))
  const groups = useMemo(() => {
    const groups = new Map<string, Prepared<Row>[]>()
    const accounting = columns.filter(col => 'format' in col)
    const emptyValues = new Map<string, string | bigint>()
    for (const row of rows) {
      const group = groupBy?.(row) ?? ''
      const values = accounting.length ? new Map<string, string | bigint>() : emptyValues
      for (const col of accounting) {
        if (col.format === 'swiss-date') {
          const date = col.value(row)
          if (date != null) values.set(col.id, accountingDate(date))
        } else {
          const value = col.value(row)
          if (value != null) values.set(col.id, minorUnits(value, precision(col)))
        }
      }
      const records = groups.get(group)
      const entry = { row, values }
      if (records) records.push(entry)
      else groups.set(group, [entry])
    }
    return groups
  }, [rows, columns, groupBy])
  const ordered = useMemo(() => {
    const direction = current?.direction === 'descending' ? -1 : 1
    return Array.from(groups, ([name, records]) => {
      if (!active) return { name, records }
      return { name, records: [...records].sort((a, b) => {
        if (!('format' in active)) return direction * active.compare!(a.row, b.row)
        const left = a.values.get(active.id), right = b.values.get(active.id)
        if (left === undefined || right === undefined) return Number(left === undefined) - Number(right === undefined)
        return direction * (left < right ? -1 : left > right ? 1 : 0)
      }) }
    })
  }, [groups, current, active])
  function change(column: string) {
    const next: DataSort = { column, direction: current?.column === column && current.direction === 'ascending' ? 'descending' : 'ascending' }
    if (sort === undefined) setInternal(next)
    onSortChange?.(next)
  }
  function figure(col: AccountingColumn<Row> & { format: 'chf' | 'decimal' }, value: bigint) {
    return <TableAmount minorUnits={value} format={col.format} fractionDigits={precision(col)} locale={locale} negativeStyle={negativeStyle} />
  }
  function content(col: DataTableColumn<Row>, entry: Prepared<Row>) {
    if (!('format' in col)) return col.cell(entry.row)
    const value = entry.values.get(col.id)
    if (value == null) return '—'
    if (col.format === 'swiss-date') {
      const iso = String(value)
      return <time dateTime={iso} className="al-table-date">{iso.slice(8) + '.' + iso.slice(5, 7) + '.' + iso.slice(0, 4)}</time>
    }
    return figure(col, value as bigint)
  }
  // A colspan can cover only adjacent columns; keep every numeric result on its own axis.
  const numericColumn = (col: DataTableColumn<Row>) => alignment(col) === 'end'
  const firstLabelColumn = columns.findIndex(col => !numericColumn(col))
  const labelIndex = Math.max(0, firstLabelColumn)
  const nextNumber = columns.findIndex((col, i) => i > labelIndex && numericColumn(col))
  const labelSpan = firstLabelColumn === -1 ? 1 : (nextNumber < 0 ? columns.length : nextNumber) - labelIndex
  function summary(label: string, records: readonly Prepared<Row>[], variant: 'subtotal' | 'total') {
    return <TableRow variant={variant}>{columns.map((col, index) => {
      if (index > labelIndex && index < labelIndex + labelSpan) return null
      let amount: ReactNode
      if ('aggregate' in col && col.aggregate === 'sum') {
        let sum: bigint | undefined
        for (const entry of records) {
          const value = entry.values.get(col.id)
          if (typeof value === 'bigint') sum = (sum ?? 0n) + value
        }
        amount = sum === undefined ? '—' : figure(col, sum)
      }
      if (index === labelIndex) return <TableHead scope="row" colSpan={labelSpan} key={col.id} numeric={alignment(col) === 'end'}>{label}{amount != null && <><br />{amount}</>}</TableHead>
      return <TableCell key={col.id} numeric={alignment(col) === 'end'}>{amount}</TableCell>
    })}</TableRow>
  }
  return (
    <ScrollArea ref={ref} className={('al-data-table ' + className).trim()} maxHeight={maxHeight}
      label={caption} aria-describedby={hasSortHint ? hintId : undefined}>
      {hasSortHint && <span hidden id={hintId}>{sortHint}</span>}
      <Table stickyHeader={stickyHeader} stickyFirstColumn={stickyFirstColumn}>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          <TableRow>{columns.map(col => {
            const sorted = active === col
            const title = col.header + ('format' in col && col.format === 'chf' && !/\bCHF\b/i.test(col.header) ? ' (CHF)' : '')
            return <TableHead key={col.id} data-align={alignment(col)} data-unbroken={title.length <= 20 || undefined} numeric={alignment(col) === 'end'} aria-sort={sorted ? current?.direction : undefined}>
              {sortable(col) ? <>
                <button type="button" onClick={() => change(col.id)}>{title}
                  <span aria-hidden="true">{sorted ? (current?.direction === 'ascending' ? '↑' : '↓') : '↕'}</span>
                </button>
                <span className="al-table-print-label">{title}</span>
              </> : title}
            </TableHead>
          })}</TableRow>
        </TableHeader>
        {ordered.map(({ name, records }, index) => <TableBody key={name}
          aria-labelledby={groupBy && name ? hintId + '-group-' + index : undefined}>
          {groupBy && name && <TableRow data-group-heading="">
            <TableHead id={hintId + '-group-' + index} scope="rowgroup" colSpan={columns.length}>{name}</TableHead>
          </TableRow>}
          {records.map(entry => <TableRow key={rowKey(entry.row)}>{columns.map(col =>
            <TableCell key={col.id} data-align={alignment(col)} {...(!('format' in col) && col.nowrap && { 'data-unbroken': true })}
              numeric={alignment(col) === 'end'}>{content(col, entry)}</TableCell>
          )}</TableRow>)}
          {groupBy && summary(subtotalLabel?.(name) ?? name, records, 'subtotal')}
        </TableBody>)}
        {!ordered.length && <TableBody><TableRow><TableCell colSpan={Math.max(1, columns.length)}>{empty}</TableCell></TableRow></TableBody>}
        {totalLabel && rows.length > 0 && <TableFooter>{summary(totalLabel, ordered.flatMap(group => group.records), 'total')}</TableFooter>}
      </Table>
    </ScrollArea>
  )
}

export const DataTable = forwardRef(DataTableView) as <Row>(
  props: DataTableProps<Row> & RefAttributes<HTMLDivElement>,
) => ReactElement
