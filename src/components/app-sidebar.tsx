'use client';

import * as React from 'react';
import Image from 'next/image';

import { NavUser } from '@/components/nav-user';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

import { CircleGauge, BookHeadphones, Settings } from 'lucide-react';
import Link from 'next/link';

// This is sample data.
const data = {
  user: {
    name: 'John Doe',
    email: 'exemple@exemple.fr',
    avatar: '/avatar.jpg',
  },
  menu: [
    {
      title: 'Dashboard',
      icon: CircleGauge,
      href: '/dashboard',
    },
    {
      title: 'Albums',
      icon: BookHeadphones,
      href: '/albums',
    },
    {
      title: 'Artists',
      icon: BookHeadphones,
      href: '/artists',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Image src="/logo.svg" alt="Logo" width={30} height={30} />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-lg font-semibold">Backoffice</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            {data.menu.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton>
                  <Link className="flex items-center gap-2" href={item.href}>
                    <item.icon className="size-5" />
                    <span className="truncate text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
