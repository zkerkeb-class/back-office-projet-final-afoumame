import { Metadata } from 'next';
import React from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Backoffice',
  description: 'Backoffice',
  keywords: 'Backoffice',
};

export default function BackofficeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="w-full h-full ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
