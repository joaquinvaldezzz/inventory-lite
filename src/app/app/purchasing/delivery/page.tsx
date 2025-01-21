import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'

import { columns } from './columns'
import deliveries from './deliveries.json'

export const metadata: Metadata = {
  title: 'Delivery',
}

export default function Page() {
  const data = deliveries.data

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Delivery</h1>
        <Button size="sm" asChild>
          <Link href="/app/purchasing/delivery/new-delivery">
            <Plus />
            <span>Add new</span>
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={data} withSearch withPagination />
    </div>
  )
}
