'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Award,
  Truck,
  DollarSign,
  Fuel,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  LineChart,
  BarChart3,
} from 'lucide-react';
import { BrandLogo } from '../brand/brand-logo';

const MANAGER_LINKS = [
  { href: '/manager/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { href: '/manager/performance', label: 'Performance Metrics', icon: Award },
  { href: '/manager/fleet-analytics', label: 'Fleet Utilization', icon: Truck },
  { href: '/manager/cost', label: 'Cost Analysis', icon: DollarSign },
  { href: '/manager/fuel', label: 'Fuel Benchmarking', icon: Fuel },
  { href: '/manager/delivery', label: 'SLA & Delivery', icon: CheckCircle2 },
  { href: '/manager/savings', label: 'Optimization Savings', icon: TrendingUp },
  { href: '/manager/reports', label: 'Financial Reports', icon: FileSpreadsheet },
  { href: '/manager/trends', label: 'Forecasts & Trends', icon: LineChart },
];

export function ManagerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        <div className="px-5 py-4.5 border-b border-slate-100">
          <BrandLogo
            variant="full"
            size="md"
            subtitle="Executive Intelligence"
            badge="BI"
            badgeColor="amber"
          />
        </div>

        <nav className="p-3 space-y-1">
          {MANAGER_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
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
        <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 text-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-900">Total Optimization ROI</span>
          <p className="text-[10px] text-amber-700 leading-tight">
            Consistently delivering 18.4% reduction in fuel and ₹520k cumulative savings this quarter.
          </p>
        </div>
      </div>
    </aside>
  );
}
