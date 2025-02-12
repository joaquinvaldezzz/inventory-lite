import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      <div className="rounded-md border whitespace-nowrap">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow data-state={row.getIsSelected() && 'selected'} key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <Label className="max-sm:sr-only">Rows per page</Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                {[5, 10, 25, 50].map((pageSize) => (
                  <SelectItem value={pageSize.toString()} key={pageSize}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex grow justify-end text-sm whitespace-nowrap text-muted-foreground">
            <p className="text-sm whitespace-nowrap text-muted-foreground" aria-live="polite">
              <span className="text-foreground">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
                to{' '}
                {Math.min(
                  Math.max(
                    table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                      table.getState().pagination.pageSize,
                    0,
                  ),
                  table.getRowCount(),
                )}
              </span>{' '}
              of <span className="text-foreground">{table.getRowCount().toString()}</span>
            </p>
          </div>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                className="disabled:pointer-events-none disabled:opacity-50"
                aria-label="Go to first page"
                disabled={!table.getCanPreviousPage()}
                size="icon"
                variant="outline"
                onClick={() => {
                  table.firstPage()
                }}
              >
                <ChevronFirst aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
            </PaginationItem>

            <PaginationItem>
              <Button
                className="disabled:pointer-events-none disabled:opacity-50"
                aria-label="Go to previous page"
                disabled={!table.getCanPreviousPage()}
                size="icon"
                variant="outline"
                onClick={() => {
                  table.previousPage()
                }}
              >
                <ChevronLeft aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
            </PaginationItem>

            <PaginationItem>
              <Button
                className="disabled:pointer-events-none disabled:opacity-50"
                aria-label="Go to next page"
                disabled={!table.getCanNextPage()}
                size="icon"
                variant="outline"
                onClick={() => {
                  table.nextPage()
                }}
              >
                <ChevronRight aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
            </PaginationItem>

            <PaginationItem>
              <Button
                className="disabled:pointer-events-none disabled:opacity-50"
                aria-label="Go to last page"
                disabled={!table.getCanNextPage()}
                size="icon"
                variant="outline"
                onClick={() => {
                  table.lastPage()
                }}
              >
                <ChevronLast aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  )
}
