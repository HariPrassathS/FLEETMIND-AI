'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { NotificationItem, NotificationSeverity } from '../../../lib/optimization/types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Truck,
  Package,
  Wrench,
  Clock,
  Sparkles,
  Filter,
  Check,
} from 'lucide-react';

export default function DispatcherNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(fleetMindStore.getNotifications());
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setNotifications(fleetMindStore.getNotifications());
    });
    return unsub;
  }, []);

  const handleMarkRead = (id: string) => {
    fleetMindStore.markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.is_read) fleetMindStore.markNotificationRead(n.id);
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSeverity = severityFilter === 'ALL' || n.severity === severityFilter;
    const matchesUnread = !unreadOnly || !n.is_read;
    return matchesSeverity && matchesUnread;
  });

  const getSeverityIcon = (n: NotificationItem) => {
    switch (n.severity) {
      case 'CRITICAL':
        return <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5" /></div>;
      case 'HIGH':
        return <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><AlertCircle className="w-5 h-5" /></div>;
      case 'MEDIUM':
        return <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"><Clock className="w-5 h-5" /></div>;
      case 'LOW':
        return <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>;
    }
  };

  const getSeverityBadge = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">INFO</span>;
    }
  };

  return (
    <>
      <PortalHeader
        title="Command Center Notifications & Operational Alerts"
        subtitle="Live event stream of vehicle disruptions, deadline breach alerts, maintenance triggers, and optimization milestones"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Controls & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">INFO / LOW</option>
            </select>

            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition ${
                unreadOnly ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Unread Only ({notifications.filter((n) => !n.is_read).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400">All fleet operations are running smoothly within SLA tolerances.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-3xl border transition flex items-start justify-between gap-4 shadow-card ${
                  !n.is_read ? 'bg-white border-blue-200 ring-2 ring-blue-500/10' : 'bg-slate-50/70 border-slate-200/80 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {getSeverityIcon(n)}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 leading-tight">{n.title}</h4>
                      {getSeverityBadge(n.severity)}
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                      {new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
