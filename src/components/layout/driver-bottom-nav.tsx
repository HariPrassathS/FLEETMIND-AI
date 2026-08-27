'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Navigation, Package, Clock, User } from 'lucide-react';

const DRIVER_NAV_ITEMS = [
  { href: '/driver/dashboard', label: 'Home', icon: Home },
  { href: '/driver/route', label: 'Route', icon: Navigation },
  { href: '/driver/shipments', label: 'Cargo', icon: Package },
  { href: '/driver/history', label: 'History', icon: Clock },
  { href: '/driver/profile', label: 'Profile', icon: User },
];

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl py-2 px-3 flex items-center justify-around sm:max-w-md sm:mx-auto sm:rounded-t-2xl">
      {DRIVER_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[56px] min-h-[48px] ${
              isActive
                ? 'text-blue-600 font-bold bg-blue-50'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
