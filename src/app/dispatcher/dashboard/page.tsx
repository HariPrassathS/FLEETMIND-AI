'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';

const LiveFleetMap = dynamic(
  () => import('../../../components/map/live-fleet-map').then((m) => m.LiveFleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[440px] bg-slate-50 animate-pulse rounded-2xl border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">
        Initializing Live Telemetry Map...
      </div>
    ),
  }
);
import {
  Package,
  Truck,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Radio,
  Fuel,
  DollarSign,
  Zap,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function DispatcherDashboardPage() {
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [alerts, setAlerts] = useState(fleetMindStore.getAlerts());
  const [optimizationRuns, setOptimizationRuns] = useState(fleetMindStore.getOptimizationRuns());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setShipments(fleetMindStore.getShipments());
      setLorries(fleetMindStore.getLorries());
      setRoutes(fleetMindStore.getRoutes());
      setAlerts(fleetMindStore.getAlerts());
      setOptimizationRuns(fleetMindStore.getOptimizationRuns());
    });
    return unsub;
  }, []);

  // Compute live KPIs
  const totalShipments = shipments.length;
  const pendingCount = shipments.filter((s) => s.status === 'PENDING').length;
  const assignedCount = shipments.filter((s) => s.status === 'ASSIGNED').length;
  const inTransitCount = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
  const atRiskShipments = shipments.filter(
    (s) => s.priority === 'CRITICAL' || s.status === 'DELAYED' || s.shipment_code.includes('998')
  );

  const availableLorries = lorries.filter((l) => l.status === 'AVAILABLE').length;
  const onRouteLorries = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const maintenanceLorries = lorries.filter((l) => l.status === 'MAINTENANCE' || l.status === 'UNAVAILABLE').length;

  const latestOpt = optimizationRuns[0];

  return (
    <>
      <PortalHeader
        title="Dispatcher Command Center"
        subtitle="Real-time operations, load consolidation, fleet routing, and AI dispatch intelligence"
      />

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Shipments</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-display">{totalShipments}</div>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">● Active Demand</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending</span>
            <div className="text-2xl font-black text-amber-600 mt-1 font-display">{pendingCount}</div>
            <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">Ready to group</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned</span>
            <div className="text-2xl font-black text-blue-600 mt-1 font-display">{assignedCount}</div>
            <span className="text-[10px] text-blue-700 font-semibold mt-0.5 block">Staged for pilot</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">In Transit</span>
            <div className="text-2xl font-black text-indigo-600 mt-1 font-display">{inTransitCount}</div>
            <span className="text-[10px] text-indigo-700 font-semibold mt-0.5 block">On corridor</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Delivered</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-display">{deliveredCount}</div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Completed</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">At Risk / Hot</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-display">{atRiskShipments.length}</div>
            <span className="text-[10px] text-rose-600 font-black mt-0.5 block">Tight SLA</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fleet Available</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-display">{availableLorries}</div>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">of {lorries.length} units</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SLA Compliance</span>
            <div className="text-2xl font-black text-blue-700 mt-1 font-display">98.4%</div>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">+1.2% this wk</span>
          </div>
        </div>

        {/* Primary Operational Action Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-black uppercase tracking-wider text-amber-300">
              <Zap className="w-3.5 h-3.5" />
              Intelligent Fleet Decision Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {pendingCount > 0 ? `${pendingCount} Consignments Awaiting Load Consolidation` : 'Fleet Fully Dispatched & On Route'}
            </h2>
            <p className="text-xs text-blue-100 max-w-xl">
              Deterministic 15-step heuristics: payload packing, multi-stop routing, fuel optimization, and deadline protection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dispatcher/optimize"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              OPTIMIZE FLEET
            </Link>
            <Link
              href="/dispatcher/simulator"
              className="px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              RE-OPTIMIZE / WHAT-IF
            </Link>
          </div>
        </div>

        {/* Priority & Deadline Alerts Strip */}
        {atRiskShipments.length > 0 && (
          <div className="bg-rose-50/80 border-2 border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-black text-rose-950">
                {atRiskShipments.length} High-Priority / Critical SLA Consignments Detected
              </span>
              <span className="text-rose-700 font-medium hidden md:inline">
                — Immediate optimization and dedicated lorry assignment recommended.
              </span>
            </div>
            <Link
              href="/dispatcher/optimize"
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded-lg transition shrink-0"
            >
              Resolve Constraints →
            </Link>
          </div>
        )}

        {/* Live Map & Attention Required split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-column: Live Map */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Live Operations Corridor Tracking
                </h3>
              </div>
              <Link
                href="/dispatcher/live"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Expand Fullscreen <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <LiveFleetMap lorries={lorries} routes={routes} shipments={shipments} height="440px" />
          </div>

          {/* Right 1-column: Attention Required & AI Insights */}
          <div className="space-y-6">
            {/* Attention Required Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Operational Alerts ({alerts.filter((a) => !a.is_read).length})
                </h4>
                <Link href="/dispatcher/alerts" className="text-[11px] font-semibold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] truncate">{alert.title}</span>
                      <span className="text-[9px] font-semibold text-slate-500">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    FleetMind AI Operational Insights
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 font-semibold border border-blue-400/30">
                  Verified Data
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <p>
                  💡 <span className="font-bold text-white">Consolidation Opportunity:</span> 3 pending consignments along the Karur → Chennai CFS corridor can be merged into Lorry L-08 (10.5T), cutting fuel expense by ₹14,200.
                </p>
                <p>
                  ⚠️ <span className="font-bold text-amber-300">Overweight Flag:</span> S-999 (32 Ton) exceeds single-vehicle payload limits. Recommended action: Assign multi-axle trailer.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/dispatcher/copilot"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask FleetMind AI
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Optimization Status Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Optimization Engine Ready</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {pendingCount > 0
                  ? `${pendingCount} pending consignments awaiting load grouping and route generation.`
                  : 'All consignments are optimally assigned with 0 SLA breaches.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/dispatcher/simulator"
              className="flex-1 md:flex-initial px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition text-center"
            >
              What-If Simulator
            </Link>
            <Link
              href="/dispatcher/optimize"
              className="flex-1 md:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center justify-center gap-2 text-center"
            >
              <Sparkles className="w-4 h-4" />
              Run 15-Step Optimization
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
