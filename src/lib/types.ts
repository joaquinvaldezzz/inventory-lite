import type { LucideIcon } from 'lucide-react'

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: string
      name: string
      email: string
      level: string
      branches: [
        {
          id: string
          branch: string
        },
      ]
    }
  }
}

export interface Branch {
  id: string | number
  branch: string
}

export interface SidebarItem {
  icon?: LucideIcon
  url: string
  title: string
  isActive?: boolean
  items?: Array<{
    url: string
    title: string
  }>
}
