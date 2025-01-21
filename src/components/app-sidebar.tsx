'use client'

import type { ComponentProps } from 'react'
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  PackageOpen,
  Percent,
  ShoppingCart,
  SquareTerminal,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'

const data = {
  user: {
    name: 'John Doe',
    email: 'johndoe@mail.com',
    avatar: '',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  nav: [
    {
      icon: SquareTerminal,
      url: '#',
      title: 'Dashboard',
    },
    {
      icon: ShoppingCart,
      url: '#',
      title: 'Purchasing',
      items: [
        {
          url: '#',
          title: 'Purchase Request',
        },
        {
          url: '#',
          title: 'Purchase Order',
        },
        {
          url: '/app/purchasing/delivery',
          title: 'Delivery',
        },
        {
          url: '#',
          title: 'Returns',
        },
      ],
    },
    {
      title: 'Sales',
      url: '#',
      icon: Percent,
      items: [
        {
          url: '#',
          title: 'Upload Sales',
        },
        {
          url: '#',
          title: 'Inventory',
        },
      ],
    },
    {
      title: 'Inventory',
      url: '#',
      icon: PackageOpen,
      items: [
        {
          url: '/app/inventory/daily-count',
          title: 'Daily Count',
        },
        {
          url: '/app/inventory/wastes',
          title: 'Wastes',
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.nav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
