import type { ReactNode } from 'react'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky inset-x-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background transition-[width,height] ease-linear top-safe group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="px-4 pb-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
