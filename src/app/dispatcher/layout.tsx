'use client';

import React from 'react';
import { RoleGuard } from '../../lib/auth/role-guard';
import { DispatcherSidebar } from '../../components/layout/dispatcher-sidebar';

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['DISPATCHER', 'ADMIN']}>
      <div className="min-h-screen bg-[#F8FAFC] flex">
        <DispatcherSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </RoleGuard>
  );
}
