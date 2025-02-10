import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(int: number) {
  const PHP = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  })

  return PHP.format(int)
}
