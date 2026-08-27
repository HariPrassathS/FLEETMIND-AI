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
  LogOut,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { BrandLogo } from '../brand/brand-logo';
import { UserAvatar } from '../brand/user-avatar';
import { useSidebar } from './sidebar-context';

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

interface ManagerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ManagerSidebar({ isOpen, onClose }: ManagerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const sidebar = useSidebar();

  const isDrawerOpen = isOpen !== undefined ? isOpen : sidebar.isMobileOpen;
  const handleClose = onClose || sidebar.closeMobile;

  const handleLogout = async () => {
    handleClose();
    await logout();
    router.push('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 flex items-center justify-between">
          <BrandLogo
            variant="full"
            size="md"
            subtitle="Executive Intelligence"
            badge="BI"
            badgeColor="amber"
          />
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {MANAGER_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm font-bold'
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

      <div className="p-3 border-t border-slate-100 space-y-2.5 bg-white">
        {/* User Profile Card */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <UserAvatar
            src={user?.avatar_url}
            name={user?.full_name}
            email={user?.email}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name || 'Manager'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'manager@fleetmind.ai'}</p>
          </div>
        </div>

        {/* Dedicated Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200/80 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
