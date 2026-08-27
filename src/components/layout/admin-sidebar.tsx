'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Truck,
  UserCheck,
  Settings,
  Sliders,
  FileText,
  Activity,
  BarChart,
  Shield,
} from 'lucide-react';
import { BrandLogo } from '../brand/brand-logo';

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/fleet', label: 'Fleet Management', icon: Truck },
  { href: '/admin/drivers', label: 'Driver Management', icon: UserCheck },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
  { href: '/admin/optimization-settings', label: 'Optimization Weights', icon: Sliders },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { href: '/admin/system-health', label: 'System Health', icon: Activity },
  { href: '/admin/reports', label: 'Operational Reports', icon: BarChart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        <div className="px-5 py-4.5 border-b border-slate-100">
          <BrandLogo
            variant="full"
            size="md"
            subtitle="System Controller Portal"
            badge="ADMIN"
            badgeColor="purple"
          />
        </div>

        <nav className="p-3 space-y-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-purple-50 border border-purple-200/70 rounded-xl p-3 text-xs space-y-1">
          <span className="text-[11px] font-bold text-purple-900">Privileged Environment</span>
          <p className="text-[10px] text-purple-700 leading-tight">
            Administrative actions are cryptographically logged to the immutable audit ledger.
          </p>
        </div>
      </div>
    </aside>
  );
}
