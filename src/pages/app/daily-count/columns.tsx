import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import type { DailyCountData } from '@/lib/types'

export const columns: Array<ColumnDef<DailyCountData>> = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: (cell) =>
      cell.row.original.date !== '0000-00-00' ? format(cell.row.original.date, 'MMMM d, yyyy') : '',
  },
  {
    accessorKey: 'branch',
    header: 'Branch name',
  },
  {
    accessorKey: 'raw_material_type',
    header: 'Category',
  },
  {
    accessorKey: 'timestamp',
    header: 'Date and time encoded',
    cell: (cell) =>
      cell.row.original.timestamp !== '0000-00-00'
        ? format(cell.row.original.timestamp, 'MMMM d, yyyy')
        : '',
  },
]
