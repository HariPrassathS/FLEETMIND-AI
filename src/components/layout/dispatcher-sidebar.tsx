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
} from 'lucide-react';

import { BrandLogo } from '../brand/brand-logo';

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

export function DispatcherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4.5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <BrandLogo
            variant="full"
            size="md"
            subtitle="Dispatcher Command Center"
            badge="DISPATCHER"
            badgeColor="blue"
          />
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

      {/* Footer System Status Banner */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Optimization Engine</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              ONLINE
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            15-Step Multi-Objective Heuristics active. Fuel base ₹96.50/L.
          </p>
        </div>
      </div>
    </aside>
  );
}
