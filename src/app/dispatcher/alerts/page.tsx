'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { SystemAlert } from '../../../types/database';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Truck, Package, Check } from 'lucide-react';

export default function DispatcherAlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>(fleetMindStore.getAlerts());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setAlerts(fleetMindStore.getAlerts());
    });
    return unsub;
  }, []);

  const handleMarkRead = (id: string) => {
    fleetMindStore.markAlertRead(id);
  };

  return (
    <>
      <PortalHeader
        title="Operations Alert Center"
        subtitle="Real-time SLA deadline risks, vehicle breakdowns, delay reports, and capacity exceptions"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Active Operational Alerts ({alerts.filter((a) => !a.is_read).length} Unread)
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl border p-5 shadow-card transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !alert.is_read ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700'
                      : alert.severity === 'HIGH'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {alert.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{alert.message}</p>

                  <div className="text-[10px] text-slate-400 font-medium pt-1">
                    Logged at {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {!alert.is_read && (
                <button
                  onClick={() => handleMarkRead(alert.id)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
