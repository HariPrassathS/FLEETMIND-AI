'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { BrandLogo } from '../brand/brand-logo';
import { UserAvatar } from '../brand/user-avatar';
import { useSidebar } from './sidebar-context';

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

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
    <div className="flex flex-col h-full bg-white overflow-hidden select-none">
      {/* 1. Header */}
      <div className="shrink-0 px-4 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
        <BrandLogo
          variant="full"
          size="md"
          subtitle="System Controller Portal"
          badge="ADMIN"
          badgeColor="purple"
        />
        <button
          onClick={handleClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer */}
      <div className="shrink-0 p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <div className="flex items-center gap-2.5 px-2.5 py-2 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <UserAvatar
            src={user?.avatar_url}
            name={user?.full_name}
            email={user?.email}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 truncate leading-tight">
              {user?.full_name || 'System Admin'}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {user?.email || 'admin@fleetmind.ai'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 shadow-xs transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 h-screen sticky top-0 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
