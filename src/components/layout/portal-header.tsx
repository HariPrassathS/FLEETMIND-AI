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
} from 'lucide-react';
import { fleetMindStore } from '../../lib/db/store';
import { GlobalSearchDialog } from '../search/global-search-dialog';
import { UserAvatar } from '../brand/user-avatar';

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
}

export function PortalHeader({ title, subtitle }: PortalHeaderProps) {
  const { user, role, switchRoleDemo, logout, getRoleDashboardPath } = useAuth();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const alerts = fleetMindStore.getAlerts();
  const unreadAlerts = alerts.filter((a) => !a.is_read);

  const handleRoleChange = (newRole: UserRole) => {
    switchRoleDemo(newRole);
    setIsRoleMenuOpen(false);
    router.push(getRoleDashboardPath(newRole));
  };

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
        {/* Left: Title & Subtitle */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>}
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
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <div className="py-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Evaluator Role:
                  </div>

                  <button
                    onClick={() => handleRoleChange('DISPATCHER')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition ${
                      role === 'DISPATCHER' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5" /> Dispatcher Command
                    </span>
                    {role === 'DISPATCHER' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('DRIVER')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition ${
                      role === 'DRIVER' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5" /> Driver PWA Mobile
                    </span>
                    {role === 'DRIVER' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('MANAGER')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition ${
                      role === 'MANAGER' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5" /> Manager BI Analytics
                    </span>
                    {role === 'MANAGER' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleChange('ADMIN')}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition ${
                      role === 'ADMIN' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> Administrator Portal
                    </span>
                    {role === 'ADMIN' && <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      await logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
