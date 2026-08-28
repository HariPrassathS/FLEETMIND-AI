'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { UserRole } from '../../lib/optimization/types';
import {
  Search, Bell, LogOut, ChevronDown, Menu, Sparkles,
} from 'lucide-react';
import { fleetMindStore } from '../../lib/db/store';
import { GlobalSearchDialog } from '../search/global-search-dialog';
import { UserAvatar } from '../brand/user-avatar';
import { useSidebar } from './sidebar-context';

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onMenuToggle?: () => void;
  /** Accent color for the header gradient: 'blue' | 'purple' | 'amber' | 'emerald' | 'indigo' */
  accent?: 'blue' | 'purple' | 'amber' | 'emerald' | 'indigo';
}

const ACCENT_CLASSES = {
  blue:    'from-slate-900 via-blue-950 to-slate-900',
  purple:  'from-slate-900 via-purple-950 to-slate-900',
  amber:   'from-slate-900 via-amber-950 to-slate-900',
  emerald: 'from-slate-900 via-emerald-950 to-slate-900',
  indigo:  'from-slate-900 via-indigo-950 to-slate-900',
};

const ACCENT_ICON_CLASSES = {
  blue:    'from-blue-500 to-indigo-600',
  purple:  'from-purple-500 to-violet-600',
  amber:   'from-amber-500 to-orange-600',
  emerald: 'from-emerald-500 to-teal-600',
  indigo:  'from-indigo-500 to-blue-600',
};

const ACCENT_TEXT = {
  blue:    'text-blue-300',
  purple:  'text-purple-300',
  amber:   'text-amber-300',
  emerald: 'text-emerald-300',
  indigo:  'text-indigo-300',
};

const getRoleBadgeStyle = (r?: UserRole | null) => {
  switch (r) {
    case 'ADMIN':       return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DISPATCHER':  return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DRIVER':      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'MANAGER':     return 'bg-amber-100 text-amber-800 border-amber-200';
    default:            return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export function PortalHeader({
  title,
  subtitle,
  category,
  icon,
  rightElement,
  onMenuToggle,
  accent = 'blue',
}: PortalHeaderProps) {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const sidebar = useSidebar();

  const handleMenuClick = onMenuToggle || sidebar.toggleMobile;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const alerts = fleetMindStore.getAlerts();
  const unreadAlerts = alerts.filter((a) => !a.is_read);

  const gradientClass = ACCENT_CLASSES[accent];
  const iconGradient  = ACCENT_ICON_CLASSES[accent];
  const textAccent    = ACCENT_TEXT[accent];
  const categoryLabel = category || `FleetMind AI · ${role || 'Portal'}`;

  return (
    <>
      {/* ============================================================
          TOP NAVIGATION BAR — Separate simple top nav on ALL screen sizes
          Clean white bar: hamburger | quick search | notifications | user
      ============================================================ */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs">
        {/* Left: mobile hamburger button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMenuClick}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 md:hidden transition flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Mobile title snippet in top bar */}
          <div className="md:hidden">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[150px] block">
              {title}
            </span>
          </div>
        </div>

        {/* Desktop left spacer / breadcrumb indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">{categoryLabel}</span>
        </div>

        {/* Right actions: Search, Bell, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Quick Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200/80 transition"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline text-slate-600">Quick Search</span>
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-bold text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900">System Notifications</span>
                  <span className="text-[10px] text-slate-400">{alerts.length} total</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No active notifications</p>
                  )}
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate">{alert.title}</span>
                        <span className="text-[9px] text-slate-400 shrink-0 ml-2">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-500 leading-tight">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Role & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
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
                <span className={`inline-block text-[9px] font-black px-1.5 rounded uppercase border mt-0.5 ${getRoleBadgeStyle(role)}`}>
                  {role || 'USER'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.full_name || 'Fleet Operator'}</p>
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

      {/* ============================================================
          PAGE HEADER SECTION
          DESKTOP (md+): Full-width dark gradient strip
          MOBILE (<md): Rendered as an in-page rounded card with margins!
      ============================================================ */}

      {/* DESKTOP HEADER STRIP */}
      <div className={`hidden md:block bg-gradient-to-r ${gradientClass} px-6 sm:px-10 py-7 border-b border-white/10 shadow-inner`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {icon && (
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg text-white shrink-0`}>
                {icon}
              </div>
            )}
            <div>
              <p className={`text-[10px] font-mono tracking-widest uppercase ${textAccent}`}>
                {categoryLabel}
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {rightElement && (
            <div className="shrink-0">
              {rightElement}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE IN-PAGE HEADER CARD (shows as a card in the page, not a top nav) */}
      <div className="md:hidden px-4 pt-4">
        <div className={`rounded-2xl bg-gradient-to-r ${gradientClass} border border-white/10 p-5 shadow-lg text-white space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-md text-white shrink-0`}>
                  {icon}
                </div>
              )}
              <div>
                <p className={`text-[9px] font-mono tracking-widest uppercase ${textAccent}`}>
                  {categoryLabel}
                </p>
                <h1 className="text-base font-black text-white leading-tight">{title}</h1>
              </div>
            </div>
          </div>
          {subtitle && (
            <p className="text-[11px] text-white/60 leading-relaxed pt-1 border-t border-white/10">
              {subtitle}
            </p>
          )}
          {rightElement && (
            <div className="pt-2">
              {rightElement}
            </div>
          )}
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
