'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Truck,
  Route,
  Navigation,
  Sparkles,
  Radio,
  AlertTriangle,
  Sliders,
  History,
  Bot,
  Users,
  Wrench,
  Fuel,
  Receipt,
  FileText,
  Bell,
  LogOut,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/auth-context';
import { BrandLogo } from '../brand/brand-logo';
import { UserAvatar } from '../brand/user-avatar';
import { useSidebar } from './sidebar-context';

interface NavSection {
  title?: string;
  links: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
    isAi?: boolean;
    isNew?: boolean;
  }[];
}

const DISPATCHER_SECTIONS: NavSection[] = [
  {
    title: 'OPERATIONS',
    links: [
      { href: '/dispatcher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dispatcher/shipments', label: 'Shipments', icon: Package },
      { href: '/dispatcher/create-shipment', label: 'Intake Shipment', icon: PlusCircle, isNew: true },
      { href: '/dispatcher/fleet', label: 'Fleet Vehicles', icon: Truck },
      { href: '/dispatcher/drivers', label: 'Drivers & Shifts', icon: Users },
      { href: '/dispatcher/trips', label: 'Trips & Dispatches', icon: Navigation },
      { href: '/dispatcher/live', label: 'Live Operations', icon: Radio },
    ],
  },
  {
    title: 'OPTIMIZATION',
    links: [
      { href: '/dispatcher/optimize', label: 'Run Optimizer', icon: Sparkles, highlight: true },
      { href: '/dispatcher/routes', label: 'Active Routes', icon: Route },
      { href: '/dispatcher/simulator', label: 'What-If Simulator', icon: Sliders },
      { href: '/dispatcher/history', label: 'Optimization History', icon: History },
    ],
  },
  {
    title: 'FLEET MANAGEMENT',
    links: [
      { href: '/dispatcher/maintenance', label: 'Maintenance', icon: Wrench },
      { href: '/dispatcher/fuel', label: 'Fuel Telemetry', icon: Fuel },
      { href: '/dispatcher/expenses', label: 'Operating Expenses', icon: Receipt },
      { href: '/dispatcher/documents', label: 'Compliance Docs', icon: FileText },
      { href: '/dispatcher/notifications', label: 'Notifications', icon: Bell },
      { href: '/dispatcher/copilot', label: 'FleetMind AI', icon: Bot, isAi: true },
    ],
  },
];

interface DispatcherSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DispatcherSidebar({ isOpen, onClose }: DispatcherSidebarProps) {
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
      {/* 1. Brand Header (Fixed Top) */}
      <div className="shrink-0 px-4 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
        <BrandLogo
          variant="full"
          size="md"
          subtitle="Dispatcher Command Center"
          badge="DISPATCHER"
          badgeColor="blue"
        />
        <button
          onClick={handleClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden transition"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Scrollable Navigation List (Middle Flex-1) */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {DISPATCHER_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : link.highlight
                        ? 'bg-blue-50/80 text-blue-700 hover:bg-blue-100 font-bold'
                        : link.isAi
                        ? 'bg-violet-50/80 text-violet-700 hover:bg-violet-100 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition ${
                          isActive
                            ? 'text-white'
                            : link.highlight
                            ? 'text-blue-600'
                            : link.isAi
                            ? 'text-violet-600'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span className="truncate">{link.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {link.isNew && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-black uppercase">
                          NEW
                        </span>
                      )}
                      {link.highlight && !isActive && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                      {link.isAi && !isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-violet-200 text-violet-800 font-black">
                          AI
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. User Card & Sign Out Footer (Fixed Bottom) */}
      <div className="shrink-0 p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        {/* User Card */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <UserAvatar
            src={user?.avatar_url}
            name={user?.full_name}
            email={user?.email}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-slate-900 truncate leading-tight">
              {user?.full_name || 'Dispatcher Lead'}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {user?.email || 'dispatcher@fleetmind.ai'}
            </p>
          </div>
        </div>

        {/* Dedicated Sign Out Button */}
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
      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 h-screen sticky top-0 z-30 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
