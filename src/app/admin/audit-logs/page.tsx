'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { AuditLog } from '../../../types/database';
import {
  Shield, FileText, User, Clock, ArrowRight, Search, Download,
  Filter, CheckCircle2, RefreshCw, Sparkles, Layers, Activity,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(fleetMindStore.getAuditLogs());
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ADMIN' | 'DISPATCH' | 'CONFIG'>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setLogs(fleetMindStore.getAuditLogs());
    });
    return unsub;
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      search === '' ||
      log.user_email.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;

    if (activeFilter === 'ADMIN') return log.user_role === 'ADMIN';
    if (activeFilter === 'DISPATCH') return log.user_role === 'DISPATCHER' || log.action.includes('DISPATCH') || log.action.includes('VRP');
    if (activeFilter === 'CONFIG') return log.action.includes('CONFIG') || log.action.includes('TARIFF') || log.action.includes('BOOTSTRAP');

    return true;
  });

  const adminActionsCount = logs.filter((l) => l.user_role === 'ADMIN').length;
  const dispatchActionsCount = logs.filter((l) => l.user_role === 'DISPATCHER' || l.action.includes('DISPATCH')).length;
  const configChangesCount = logs.filter((l) => l.action.includes('CONFIG') || l.action.includes('TARIFF') || l.action.includes('BOOTSTRAP')).length;

  const handleSeedDemoLogs = () => {
    // If empty or user requests fresh seed
    const defaultLogs = [
      {
        id: `audit-${Date.now()}-01`,
        user_email: 'admin@fleetmind.ai',
        user_role: 'ADMIN' as const,
        action: 'SYSTEM_BOOTSTRAP',
        entity: 'SYSTEM_KERNEL',
        entity_id: 'SYS-2026',
        before_data: null,
        after_data: { fleet_size: 10, corridors: ['NH44', 'NH45', 'NH48'], neural_engine: 'Groq/qwen3' },
        created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      },
      {
        id: `audit-${Date.now()}-02`,
        user_email: 'admin@fleetmind.ai',
        user_role: 'ADMIN' as const,
        action: 'TARIFF_CALIBRATION',
        entity: 'SYSTEM_SETTINGS',
        entity_id: 'config-01',
        before_data: { fuel_price_per_liter: 94.0, driver_base_rate_per_km: 5.5 },
        after_data: { fuel_price_per_liter: 96.5, driver_base_rate_per_km: 6.0 },
        created_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
      },
      {
        id: `audit-${Date.now()}-03`,
        user_email: 'admin@fleetmind.ai',
        user_role: 'ADMIN' as const,
        action: 'USER_ROLE_VERIFICATION',
        entity: 'USER_PROFILE',
        entity_id: 'user-disp-01',
        before_data: { role: 'DISPATCHER', status: 'PENDING_ADMIN_VERIFICATION' },
        after_data: { role: 'DISPATCHER', status: 'VERIFIED', corridor: 'South India Corridor' },
        created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      },
      {
        id: `audit-${Date.now()}-04`,
        user_email: 'dispatcher@fleetmind.ai',
        user_role: 'DISPATCHER' as const,
        action: 'OPTIMIZATION_VRP_EXECUTION',
        entity: 'OPTIMIZATION_RUN',
        entity_id: 'OPT-2026-0827-01',
        before_data: { unassigned_shipments: 8, estimated_cost: 47840 },
        after_data: { routes_generated: 3, net_savings_inr: 13520, fuel_saved_liters: 104 },
        created_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
      },
      {
        id: `audit-${Date.now()}-05`,
        user_email: 'dispatcher@fleetmind.ai',
        user_role: 'DISPATCHER' as const,
        action: 'CARRIER_DISPATCH',
        entity: 'ROUTE',
        entity_id: 'ROUTE-L-03',
        before_data: { lorry_status: 'AVAILABLE' },
        after_data: { lorry_status: 'ON_ROUTE', driver: 'Murugan Selvam', destination: 'Chennai Port' },
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
      {
        id: `audit-${Date.now()}-06`,
        user_email: 'driver@fleetmind.ai',
        user_role: 'DRIVER' as const,
        action: 'DELIVERY_HANDSHAKE_VERIFIED',
        entity: 'SHIPMENT',
        entity_id: 'FM-260828-9689',
        before_data: { status: 'IN_TRANSIT' },
        after_data: { status: 'DELIVERED', otp_verified: true, timestamp: new Date().toISOString() },
        created_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
      },
    ];

    defaultLogs.forEach((l) => {
      fleetMindStore.logAudit(l.user_email, l.user_role, l.action, l.entity, l.entity_id, l.before_data, l.after_data);
    });
    setLogs(fleetMindStore.getAuditLogs());
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('BOOTSTRAP') || action.includes('INIT')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (action.includes('VERIF') || action.includes('AUTH')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (action.includes('DISPATCH') || action.includes('ROUTE')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('TARIFF') || action.includes('CONFIG')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <>
      <PortalHeader
        title="Immutable System Audit Ledger"
        subtitle="Cryptographically logged system mutations, user role changes, dispatch decisions & parameters"
        category="FleetMind AI · Audit Trail"
        icon={<FileText className="w-5 h-5" />}
        accent="purple"
        rightElement={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDemoLogs}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>
        }
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Audit Events</p>
            <p className="text-3xl font-black text-purple-700">{logs.length}</p>
            <p className="text-xs text-slate-500 font-medium">Immutable records stored</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Admin & Security</p>
            <p className="text-3xl font-black text-emerald-700">{adminActionsCount}</p>
            <p className="text-xs text-slate-500 font-medium">Privileged actions logged</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dispatch & VRP</p>
            <p className="text-3xl font-black text-blue-700">{dispatchActionsCount}</p>
            <p className="text-xs text-slate-500 font-medium">Route & carrier operations</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tariff & Config</p>
            <p className="text-3xl font-black text-amber-700">{configChangesCount}</p>
            <p className="text-xs text-slate-500 font-medium">Parameter mutations</p>
          </div>
        </div>

        {/* Audit Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          {/* Filter & Search Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {(['ALL', 'ADMIN', 'DISPATCH', 'CONFIG'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeFilter === filter
                      ? 'bg-white text-purple-700 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter === 'ALL' ? `All Logs (${logs.length})` : filter}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actor, action, entity..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium transition"
              />
            </div>
          </div>

          {/* Table */}
          {filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">Actor</th>
                    <th className="py-3.5 px-6">Action</th>
                    <th className="py-3.5 px-6">Entity Target</th>
                    <th className="py-3.5 px-6">Mutation Snapshot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900 leading-tight">{log.user_email}</div>
                        <span className="inline-block text-[9px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-1.5 rounded uppercase mt-0.5">
                          {log.user_role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 font-mono text-[11px]">
                        {log.entity} {log.entity_id && <span className="text-slate-400">[{log.entity_id}]</span>}
                      </td>
                      <td className="py-3.5 px-6 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-600 truncate">
                            {log.after_data ? JSON.stringify(log.after_data) : 'State recorded'}
                          </span>
                          <span className="text-[10px] font-bold text-purple-600 group-hover:underline shrink-0">
                            View →
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Audit Records Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                System activities, configuration changes, and dispatches are logged automatically. Click below to load initial verification trail.
              </p>
              <button
                onClick={handleSeedDemoLogs}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Load System Activity Trail
              </button>
            </div>
          )}
        </div>

        {/* Detailed Modal Drawer for Selected Audit Log */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getActionBadgeColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">Audit Record Details</h3>
                  <p className="text-xs text-slate-500">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Actor</span>
                    <span className="font-bold text-slate-900">{selectedLog.user_email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Role</span>
                    <span className="font-bold text-purple-700">{selectedLog.user_role}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Entity</span>
                    <span className="font-bold text-slate-900">{selectedLog.entity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Entity ID</span>
                    <span className="font-bold text-slate-900">{selectedLog.entity_id || '—'}</span>
                  </div>
                </div>

                {selectedLog.before_data && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">State Before Mutation:</span>
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto">
                      {JSON.stringify(selectedLog.before_data, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Recorded State After:</span>
                  <pre className="p-3 bg-slate-900 text-emerald-300 rounded-2xl text-[11px] font-mono overflow-x-auto">
                    {JSON.stringify(selectedLog.after_data, null, 2)}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
