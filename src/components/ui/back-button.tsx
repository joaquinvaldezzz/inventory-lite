'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function BackButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        router.back()
      }}
    >
      <span className="sr-only">Go back</span>
      <ArrowLeft />
    </Button>
  )
}
