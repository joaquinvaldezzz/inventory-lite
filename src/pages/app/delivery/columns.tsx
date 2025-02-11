import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { formatDate } from 'date-fns'

import type { DeliveryItem } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header'

const multiColumnFilterFn: FilterFn<DeliveryItem> = (row, _columnId, filterValue: string) => {
  const searchableRowContent = `${row.original.dr_no} ${row.original.po_no}`.toLowerCase()
  const searchTerm = filterValue.toLowerCase()
  return searchableRowContent.includes(searchTerm)
}

export const columns: Array<ColumnDef<DeliveryItem>> = [
  {
    accessorKey: 'dr_no',
    header: ({ column }) => <DataTableColumnHeader title="DR no." column={column} />,
    filterFn: multiColumnFilterFn,
  },
  {
    accessorKey: 'po_no',
    header: ({ column }) => <DataTableColumnHeader title="PO no." column={column} />,
  },
  {
    accessorKey: 'date_delivered',
    header: ({ column }) => <DataTableColumnHeader title="Date delivered" column={column} />,
    cell: (cell) =>
      cell.row.original.date_delivered !== '0000-00-00'
        ? formatDate(cell.row.original.date_delivered, 'MMMM d, yyyy')
        : '',
  },
  {
    accessorKey: 'branch',
    header: ({ column }) => <DataTableColumnHeader title="Branch" column={column} />,
  },
  {
    accessorKey: 'supplier_name',
    header: ({ column }) => <DataTableColumnHeader title="Supplier" column={column} />,
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader title="Total amount" column={column} />,
    cell: (cell) => {
      const PHP = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      })

      return <div className="text-right">{PHP.format(Number(cell.row.original.total_amount))}</div>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader title="Status" column={column} />,
    cell: (cell) => {
      const status = cell.row.original.status
      return <Badge variant="outline">{status}</Badge>
    },
  },
]
