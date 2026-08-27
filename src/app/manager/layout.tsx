'use client';

import React from 'react';
import { RoleGuard } from '../../lib/auth/role-guard';
import { ManagerSidebar } from '../../components/layout/manager-sidebar';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['MANAGER', 'ADMIN']}>
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <ManagerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
