'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';

const LiveFleetMap = dynamic(
  () => import('../../../components/map/live-fleet-map').then((m) => m.LiveFleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] bg-slate-50 animate-pulse rounded-2xl border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">
        Loading Global Admin Telemetry Vector Map...
      </div>
    ),
  }
);
import {
  Users,
  Truck,
  UserCheck,
  Package,
  Route,
  Sparkles,
  AlertTriangle,
  Activity,
  Shield,
  ArrowRight,
  Settings,
  DollarSign,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState(fleetMindStore.getUsers());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [drivers, setDrivers] = useState(fleetMindStore.getDrivers());
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [alerts, setAlerts] = useState(fleetMindStore.getAlerts());
  const [settings, setSettings] = useState(fleetMindStore.getSystemSettings());
  const [optRuns, setOptRuns] = useState(fleetMindStore.getOptimizationRuns());

  useEffect(() => {
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(() => {
      setUsers(fleetMindStore.getUsers());
      setLorries(fleetMindStore.getLorries());
      setDrivers(fleetMindStore.getDrivers());
      setShipments(fleetMindStore.getShipments());
      setRoutes(fleetMindStore.getRoutes());
      setAlerts(fleetMindStore.getAlerts());
      setSettings(fleetMindStore.getSystemSettings());
      setOptRuns(fleetMindStore.getOptimizationRuns());
    });
    return unsub;
  }, []);

  return (
    <>
      <PortalHeader
        title="System Administration & Controller Portal"
        subtitle="Global platform health, user roles, vehicle registry, fuel configuration & immutable audit records"
      />

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-display">{users.length}</div>
            <span className="text-[10px] text-purple-600 font-bold mt-0.5 block">Registered</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Users</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-display">
              {users.filter((u) => u.is_active).length}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">Authorized</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pilots / Drivers</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-display">{drivers.length}</div>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">In registry</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Lorries</span>
            <div className="text-2xl font-black text-blue-600 mt-1 font-display">{lorries.length}</div>
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
              {lorries.filter((l) => l.status === 'AVAILABLE').length} Available
            </span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Shipments</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-display">{shipments.length}</div>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">In system</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Routes</span>
            <div className="text-2xl font-black text-indigo-600 mt-1 font-display">{routes.length}</div>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Dispatched</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Opt Runs</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-display">{optRuns.length}</div>
            <span className="text-[10px] text-purple-600 font-bold mt-0.5 block">15-Step Heuristics</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">System Alerts</span>
            <div className="text-2xl font-black text-rose-600 mt-1 font-display">{alerts.length}</div>
            <span className="text-[10px] text-rose-600 font-black mt-0.5 block">Monitored</span>
          </div>
        </div>

        {/* Global Operational Settings Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                System Global Settings & Tariffs
              </h3>
              <p className="text-xs text-slate-500">Live operational prices used by the TypeScript Optimization Engine</p>
            </div>
            <Link
              href="/admin/settings"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Modify Settings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Commercial Diesel Price</span>
              <div className="text-xl font-black text-slate-900">₹{settings.fuel_price_per_liter} / Liter</div>
              <p className="text-[11px] text-slate-500">Base variable fuel computation parameter</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Driver Base Rate</span>
              <div className="text-xl font-black text-slate-900">₹{settings.driver_base_rate_per_km} / km</div>
              <p className="text-[11px] text-slate-500">Driver trip compensation rate</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fixed Dispatch Cost</span>
              <div className="text-xl font-black text-slate-900">₹{settings.fixed_dispatch_cost_per_lorry}</div>
              <p className="text-[11px] text-slate-500">Overhead fixed per vehicle dispatch</p>
            </div>
          </div>
        </div>

        {/* Global Live Operational Fleet Telemetry Map */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                System-Wide Live GPS Telemetry Map
              </h3>
              <p className="text-xs text-slate-500">
                Organization-wide active operational vehicles synchronized via Supabase Realtime
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase">
              ● Live Sync
            </span>
          </div>

          <div className="h-[460px]">
            <LiveFleetMap
              lorries={lorries}
              routes={routes}
              shipments={shipments}
              height="100%"
            />
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-5 bg-white border border-slate-200 hover:border-purple-300 rounded-2xl shadow-card transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">User Management</h4>
            <p className="text-xs text-slate-500">Invite users, activate/deactivate accounts & assign roles.</p>
          </Link>

          <Link
            href="/admin/fleet"
            className="p-5 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-card transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Fleet Management</h4>
            <p className="text-xs text-slate-500">Register new lorries, update payload specs & log maintenance.</p>
          </Link>

          <Link
            href="/admin/system-health"
            className="p-5 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-card transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">System Health</h4>
            <p className="text-xs text-slate-500">Live checks for Firebase, Supabase, FleetMind AI Engine & storage.</p>
          </Link>

          <Link
            href="/admin/audit-logs"
            className="p-5 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl shadow-card transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Audit Logs</h4>
            <p className="text-xs text-slate-500">Cryptographically verifiable before/after system mutations.</p>
          </Link>
        </div>
      </main>
    </>
  );
}
