'use client'

import { forwardRef, useId, useMemo, useState, type ForwardedRef, type Key, type ReactElement, type ReactNode, type RefAttributes } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from './table.js'
import { ScrollArea } from './scroll-area.js'
import './data-table.css'

export interface DataColumn<Row> {
  id: string
  header: string
  cell: (row: Row) => ReactNode
  compare?: (a: Row, b: Row) => number
  align?: 'start' | 'end'
}
export interface DataSort {
  column: string
  direction: 'ascending' | 'descending'
}
export interface DataTableProps<Row> {
  rows: readonly Row[]
  columns: readonly DataColumn<Row>[]
  rowKey: (row: Row) => Key
  caption: string
  empty: ReactNode
  sort?: DataSort | null
  defaultSort?: DataSort
  onSortChange?: (sort: DataSort) => void
  /** Instructions announced with the scroll region when at least one column is sortable. */
  sortHint?: string
  className?: string
}
function DataTableView<Row>({
  rows,
  columns,
  rowKey,
  caption,
  empty,
  sort,
  defaultSort,
  onSortChange,
  sortHint = 'Use the buttons in the column headings to sort the rows.',
  className = '',
}: DataTableProps<Row>, ref: ForwardedRef<HTMLDivElement>): ReactElement {
  const hintId = useId()
  const hasSortHint = Boolean(sortHint) && columns.some((column) => column.compare)
  const [internal, setInternal] = useState<DataSort | null>(defaultSort ?? null)
  const current = sort === undefined ? internal : sort
  const comparator = columns.find((col) => col.id === current?.column)?.compare
  const ordered = useMemo(() => {
    if (!current || !comparator) return rows
    const sign = current.direction === 'ascending' ? 1 : -1
    return [...rows].sort((a, b) => sign * comparator(a, b))
  }, [rows, current, comparator])
  function change(column: string) {
    const next: DataSort = {
      column,
      direction:
        current?.column === column && current.direction === 'ascending' ? 'descending' : 'ascending',
    }
    if (sort === undefined) setInternal(next)
    onSortChange?.(next)
  }
  return (
    <ScrollArea ref={ref} className={('al-data-table ' + className).trim()} label={caption} aria-describedby={hasSortHint ? hintId : undefined}>
      {hasSortHint && <span hidden id={hintId}>{sortHint}</span>}
      <Table>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((col) => {
              const active = current?.column === col.id && !!col.compare
              return (
                <TableHead
                  key={col.id}
                  data-align={col.align}
                  numeric={col.align === 'end'}
                  aria-sort={active ? current.direction : undefined}
                >
                  {col.compare ? (
                    <button type="button" onClick={() => change(col.id)}>
                      {col.header}
                      <span aria-hidden="true">
                        {active ? (current.direction === 'ascending' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordered.length ? (
            ordered.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((col) => (
                  <TableCell key={col.id} data-align={col.align} numeric={col.align === 'end'}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={Math.max(1, columns.length)}>{empty}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

export const DataTable = forwardRef(DataTableView) as <Row>(
  props: DataTableProps<Row> & RefAttributes<HTMLDivElement>,
) => ReactElement
