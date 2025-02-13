import type { HTMLAttributes } from 'react'
import type { Column } from '@tanstack/react-table'
import { ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DataTableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      className={cn('-mx-3', className)}
      variant="ghost"
      onClick={() => {
        column.toggleSorting(column.getIsSorted() === 'asc')
      }}
    >
      {title}
      <ChevronsUpDown className="size-4" />
    </Button>
  )
}
