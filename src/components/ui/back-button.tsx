'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function BackButton() {
  const router = useRouter()
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => {
        router.back()
      }}
    >
      <span className="sr-only">Go back</span>
      <ArrowLeft />
    </Button>
  )
}
