'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { UserRole } from '../../lib/optimization/types';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Truck,
  Package,
  BarChart3,
  UserCheck,
  Flame,
  Zap,
  Menu,
} from 'lucide-react';
import { fleetMindStore } from '../../lib/db/store';
import { GlobalSearchDialog } from '../search/global-search-dialog';
import { UserAvatar } from '../brand/user-avatar';
import { useSidebar } from './sidebar-context';

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export function PortalHeader({ title, subtitle, onMenuToggle }: PortalHeaderProps) {
  const { user, role, switchRoleDemo, logout, getRoleDashboardPath } = useAuth();
  const router = useRouter();
  const sidebar = useSidebar();

  const handleMenuClick = onMenuToggle || sidebar.toggleMobile;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const alerts = fleetMindStore.getAlerts();
  const unreadAlerts = alerts.filter((a) => !a.is_read);

  const getRoleBadgeStyle = (r?: UserRole | null) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DISPATCHER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DRIVER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MANAGER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Left: Mobile Menu Trigger + Title & Subtitle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleMenuClick}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 md:hidden transition flex items-center justify-center"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Quick Search</span>
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-bold text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900">System Notifications</span>
                  <span className="text-[10px] text-slate-500">{alerts.length} total</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] truncate">{alert.title}</span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-tight">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <UserAvatar
                src={user?.avatar_url}
                name={user?.full_name}
                email={user?.email}
                size="sm"
                roundedClassName="rounded-full"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user?.full_name || 'Fleet Operator'}</p>
                <span className={`inline-block text-[9px] font-black px-1.5 py-0.2 rounded uppercase border mt-0.5 ${getRoleBadgeStyle(role)}`}>
                  {role || 'DISPATCHER'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                      Authenticated: {role || 'USER'}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={async () => {
                      setIsRoleMenuOpen(false);
                      await logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search */}
      <GlobalSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
