'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Flame,
  Zap,
  Users,
  Wrench,
  Fuel,
  Receipt,
  FileText,
  Bell,
  LogOut,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { BrandLogo } from '../brand/brand-logo';
import { UserAvatar } from '../brand/user-avatar';
import { useSidebar } from './sidebar-context';

interface NavSection {
  title?: string;
  links: {
    href: string;
    label: string;
    icon: any;
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
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 flex items-center justify-between">
          <BrandLogo
            variant="full"
            size="md"
            subtitle="Dispatcher Command Center"
            badge="DISPATCHER"
            badgeColor="blue"
          />
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links with Group Headers */}
        <nav className="p-3 space-y-4">
          {DISPATCHER_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => onClose?.()}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : link.highlight
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 font-bold'
                        : link.isAi
                        ? 'bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.highlight && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                    {link.isAi && !isActive && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-violet-200 text-violet-800 font-black">
                        AI
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status Banner & Sign Out Button */}
      <div className="p-3 border-t border-slate-100 space-y-2.5 bg-white">
        {/* User Card */}
        <div className="flex items-center gap-2.5 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <UserAvatar
            src={user?.avatar_url}
            name={user?.full_name}
            email={user?.email}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name || 'Dispatcher'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'dispatcher@fleetmind.ai'}</p>
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
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
