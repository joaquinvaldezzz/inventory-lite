import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'

import type { DeliveryItem } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header'

export const columns: Array<ColumnDef<DeliveryItem>> = [
  {
    accessorKey: 'dr_no',
    header: 'DR no.',
  },
  {
    accessorKey: 'po_no',
    header: 'PO no.',
  },
  {
    accessorKey: 'date_delivered',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date delivered" />,
    cell: (cell) => formatDate(new Date(cell.row.original.date_delivered), 'MMMM d, yyyy'),
  },
  {
    accessorKey: 'branch',
    header: 'Branch',
  },
  {
    accessorKey: 'supplier_name',
    header: 'Supplier',
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total amount" />,
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
    header: 'Status',
    cell: (cell) => {
      const status = cell.row.original.status

      return (
        <Badge variant={status === '2' ? 'outline' : 'destructive'}>
          {status === '2' ? 'Delivered' : 'Pending'}
        </Badge>
      )
    },
  },
]
