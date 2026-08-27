'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { RoleGuard } from '../../lib/auth/role-guard';
import { BrandLogo } from '../../components/brand/brand-logo';
import { fleetMindStore } from '../../lib/db/store';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Clock,
  Bell,
  HeadphonesIcon,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { UserAvatar } from '../../components/brand/user-avatar';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateNotifications = () => {
      const notifs = fleetMindStore.getNotifications(user?.email || 'customer@fleetmind.ai');
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    };

    updateNotifications();
    const unsub = fleetMindStore.subscribe(() => {
      updateNotifications();
    });
    return unsub;
  }, [user]);

  const desktopNavItems = [
    { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customer/shipments', label: 'Shipments', icon: Package },
    { href: '/customer/create-shipment', label: 'New Load', icon: PlusCircle, highlight: true },
    { href: '/customer/history', label: 'History', icon: Clock },
    { href: '/customer/notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { href: '/customer/support', label: 'Support', icon: HeadphonesIcon },
  ];

  const mobileBottomNavItems = [
    { href: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customer/shipments', label: 'Shipments', icon: Package },
    { href: '/customer/create-shipment', label: 'New Load', icon: PlusCircle, highlight: true },
    { href: '/customer/history', label: 'History', icon: Clock },
    { href: '/customer/support', label: 'Support', icon: HeadphonesIcon },
  ];

  return (
    <RoleGuard allowedRoles={['CUSTOMER', 'ADMIN']}>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-16 md:pb-0 text-slate-900 selection:bg-blue-100">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLogo variant="compact" size="md" badge="SHIPPER" />
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/customer/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {Boolean(item.badge && item.badge > 0) && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-3">
            <Link
              href="/customer/create-shipment"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Consignment</span>
            </Link>

            <Link
              href="/customer/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              >
                <UserAvatar
                  src={user?.avatar_url}
                  name={user?.full_name}
                  email={user?.email}
                  size="sm"
                />

                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                    {user?.full_name || 'Shipper Customer'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[150px]">
                    {user?.email || 'customer@fleetmind.ai'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center gap-3 p-2.5 pb-3 border-b border-slate-100 bg-slate-50/70 rounded-2xl mb-2">
                    <UserAvatar
                      src={user?.avatar_url}
                      name={user?.full_name}
                      email={user?.email}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate">{user?.full_name || 'Shipper Client'}</p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{user?.email || 'customer@fleetmind.ai'}</p>
                      <span className="inline-block mt-1 text-[9px] font-black text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full uppercase">
                        CUSTOMER ACCOUNT
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/customer/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-semibold flex items-center gap-2 transition"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Shipper Profile & Address
                  </Link>
                  <Link
                    href="/customer/support"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-semibold flex items-center gap-2 transition"
                  >
                    <HeadphonesIcon className="w-3.5 h-3.5 text-slate-400" />
                    Help & Support Desk
                  </Link>
                  <button
                    onClick={async () => {
                      setIsProfileOpen(false);
                      await logout();
                      router.push('/login');
                    }}
                    className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-2 transition mt-1 border-t border-slate-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar - Clean 5 Customer Pages (Alerts removed from bottom nav) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 grid grid-cols-5 items-center shadow-lg">
          {mobileBottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/customer/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition text-center ${
                  isActive ? 'text-blue-600 font-bold bg-blue-50/80' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : ''} ${item.highlight && !isActive ? 'text-blue-600' : ''}`} />
                </div>
                <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </RoleGuard>
  );
}
