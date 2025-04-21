import { useId, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData extends { PurchaseID: string | number }, TValue> {
  searchPlaceholder: string;
  idToSearch: keyof TData;
  linkPath: string;
  columns: Array<ColumnDef<TData, TValue>>;
  data: TData[];
}

/**
 * A generic DataTable component that supports sorting, filtering, pagination, and search
 * functionality.
 *
 * @template TData The type of data being displayed in the table. Must include an `id` property.
 * @template TValue The type of value being used in the table.
 * @param props The properties for the DataTable component.
 * @param props.searchPlaceholder The placeholder text for the search input.
 * @param props.idToSearch The ID of the data to search.
 * @param props.linkPath The path to link to when a row is clicked.
 * @param props.columns The column definitions for the table.
 * @param props.data The data to be displayed in the table.
 * @returns The rendered DataTable component.
 */
export function DataTable<TData extends { PurchaseID: string | number }, TValue>({
  searchPlaceholder,
  idToSearch,
  linkPath,
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      sorting,
    },
  });
  const idSearch = useId();

  return (
    <div className="space-y-4">
      <div className="relative w-full shrink-0">
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search strokeWidth={2} size={16} />
        </div>
        <label className="sr-only" htmlFor={`search-${idSearch}`}>
          {searchPlaceholder}
        </label>
        <Input
          className="peer ps-9"
          id={`search-${idSearch}`}
          type="search"
          placeholder={searchPlaceholder}
          value={table.getColumn(idToSearch.toString())?.getFilterValue()?.toString() ?? ""}
          onChange={(event) =>
            table.getColumn(idToSearch.toString())?.setFilterValue(event.target.value)
          }
        />
      </div>

      <div className="-mx-4 border-y whitespace-nowrap">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="first:pl-4 last:pr-4" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="first:pl-4 last:pr-4" key={cell.id}>
                      <Link
                        className="absolute inset-0 size-full"
                        to={`${linkPath}/${cell.row.original.PurchaseID}`}
                      />
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
            <Label htmlFor="rows-per-page">Rows per page</Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-fit whitespace-nowrap" id="rows-per-page">
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
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
                to{" "}
                {Math.min(
                  Math.max(
                    table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                      table.getState().pagination.pageSize,
                    0,
                  ),
                  table.getRowCount(),
                )}
              </span>{" "}
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
                  table.firstPage();
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
                  table.previousPage();
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
                  table.nextPage();
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
                  table.lastPage();
                }}
              >
                <ChevronLast aria-hidden="true" strokeWidth={2} size={16} />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
