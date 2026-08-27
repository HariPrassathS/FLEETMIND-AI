'use client';

import React from 'react';
import { RoleGuard } from '../../lib/auth/role-guard';
import { AdminSidebar } from '../../components/layout/admin-sidebar';
import { SidebarProvider } from '../../components/layout/sidebar-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <SidebarProvider>
        <div className="min-h-screen bg-[#F8FAFC] flex">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </RoleGuard>
  );
}
