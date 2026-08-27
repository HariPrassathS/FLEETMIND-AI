'use client';

import React from 'react';
import { RoleGuard } from '../../lib/auth/role-guard';
import { DriverBottomNav } from '../../components/layout/driver-bottom-nav';
import { BrandLogo } from '../../components/brand/brand-logo';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['DRIVER', 'ADMIN']}>
      <div className="min-h-screen bg-[#F8FAFC] pb-24 max-w-lg mx-auto sm:border-x sm:border-slate-200 sm:shadow-xl sm:bg-white flex flex-col justify-between">
        {/* Mobile Header with BrandLogo */}
        <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
          <BrandLogo variant="full" size="sm" badge="DRIVER" badgeColor="emerald" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live GPS</span>
          </div>
        </div>

        <div className="flex-1 w-full overflow-x-hidden">
          {children}
        </div>
        <DriverBottomNav />
      </div>
    </RoleGuard>
  );
}
