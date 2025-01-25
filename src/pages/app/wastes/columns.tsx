import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header'

interface Delivery {
  id: string
  branch_id: string
  branch: string | null
  date_request: string
  date_order: string
  date_delivered: string
  date_received: string | null
  grand_total: string
  remarks: string
  status: string
  count: string
  total_amount: string
}

export const columns: Array<ColumnDef<Delivery>> = [
  {
    accessorKey: 'id',
    header: 'DR no.',
  },
  {
    // accessorKey: 'id',
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
    // accessorKey: 'branch',
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

      return PHP.format(Number(cell.row.original.total_amount))
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
  {
    // accessorKey: 'status',
    header: 'Ingredients',
  },
]
