'use client'

import type { ColumnDef } from '@tanstack/react-table'

interface Ingredients {
  id: string
  quantity: string
  unit: string
  unit_price: string
  total_price: string
}

export const columns: Array<ColumnDef<Ingredients>> = [
  {
    accessorKey: 'quantity',
    header: 'Quantity',
  },

  {
    accessorKey: 'unit',
    header: 'Unit',
  },
  {
    accessorKey: 'unit_price',
    header: 'Unit Price',
  },
  {
    accessorKey: 'total_price',
    header: 'Total Price',
  },
]
