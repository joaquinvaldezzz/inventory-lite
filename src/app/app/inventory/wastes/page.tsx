import type { Metadata } from 'next'

import { DataTable } from '@/components/ui/data-table'

import deliveries from '../../purchasing/delivery/deliveries.json'
import { columns } from './columns'

export const metadata: Metadata = {
  title: 'Daily Count',
}

export default function Page() {
  const data = deliveries.data

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Wastes</h1>
      <DataTable columns={columns} data={data} withSearch withPagination />
    </div>
  )
}
