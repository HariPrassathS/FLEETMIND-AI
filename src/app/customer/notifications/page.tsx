'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/auth-context';
import { fleetMindStore } from '../../../lib/db/store';
import {
  Bell,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function CustomerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    const load = () => {
      const email = user?.email || 'customer@fleetmind.ai';
      setNotifications(fleetMindStore.getNotifications(email));
    };

    load();
    const unsub = fleetMindStore.subscribe(() => {
      load();
    });
    return unsub;
  }, [user]);

  const handleMarkAsRead = (id: string) => {
    fleetMindStore.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    fleetMindStore.markAllNotificationsAsRead(user?.email || 'customer@fleetmind.ai');
  };

  const filtered = notifications.filter((n) => filter === 'ALL' || !n.is_read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY_COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'SHIPMENT_IN_TRANSIT':
      case 'SHIPMENT_ASSIGNED':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'DELIVERY_OTP_SENT':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'DELIVERY_DELAY':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Package className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Delivery Notifications</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Real-time delivery milestone alerts, OTP dispatches, and ETA updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter(filter === 'ALL' ? 'UNREAD' : 'ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              filter === 'UNREAD'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {filter === 'UNREAD' ? 'Showing Unread' : 'Filter Unread'}
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No notifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are all caught up with consignment milestones and corridor updates.
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                n.is_read
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-200/50'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.action_url && (
                  <Link
                    href={n.action_url}
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
