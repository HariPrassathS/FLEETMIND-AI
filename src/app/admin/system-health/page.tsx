'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { HealthCheckStatus } from '../../../types/database';
import { Activity, CheckCircle2, ShieldCheck, RefreshCw, Server, Zap, Cpu } from 'lucide-react';

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<HealthCheckStatus[]>(fleetMindStore.getSystemHealth());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setHealth(fleetMindStore.getSystemHealth());
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <>
      <PortalHeader
        title="System Infrastructure Health"
        subtitle="Real-time status probes for Firebase Auth, Supabase PostgreSQL, Realtime WebSockets & FleetMind AI Neural Engine"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              All 6 Platform Services Operational
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Run Probe Diagnostics
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-600" />
                    {item.service}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.details}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Latency: <strong className="text-slate-800">{item.latency_ms} ms</strong></span>
                <span>Probed just now</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
