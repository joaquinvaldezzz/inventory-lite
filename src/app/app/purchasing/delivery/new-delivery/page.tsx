import type { Metadata } from 'next'

import { BackButton } from '@/components/ui/back-button'

import { NewDeliveryForm } from './new-delivery-form'

export const metadata: Metadata = {
  title: 'New Delivery',
}

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-2xl font-semibold">New Delivery</h1>
      </div>
      <NewDeliveryForm />
    </div>
  )
}
