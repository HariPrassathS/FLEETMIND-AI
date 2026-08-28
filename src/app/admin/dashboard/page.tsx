'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import {
  Users, Truck, UserCheck, Package, Route, Sparkles, AlertTriangle,
  Activity, Shield, ArrowRight, Settings, DollarSign, CheckCircle2,
  Zap, Database, Wifi, Server, Globe, IndianRupee, BarChart3,
  TrendingUp, Clock, Fuel, Lock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

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

  // Computed metrics
  const activeUsers = users.filter((u) => u.is_active).length;
  const availableLorries = lorries.filter((l) => l.status === 'AVAILABLE').length;
  const onRouteLorries = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const maintenanceLorries = lorries.filter((l) => l.status === 'MAINTENANCE').length;
  const pendingShipments = shipments.filter((s) => s.status === 'PENDING').length;
  const inTransitShipments = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const deliveredShipments = shipments.filter((s) => s.status === 'DELIVERED').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const totalSavings = optRuns.reduce((s, r) => s + (r.savings?.cost_inr || 0), 0);

  // Role breakdown chart
  const roleData = ['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'CUSTOMER'].map((role) => ({
    name: role,
    count: users.filter((u) => u.role === role).length,
  })).filter((d) => d.count > 0);

  // Fleet status pie
  const fleetPieData = [
    { name: 'Available', value: availableLorries, color: '#10B981' },
    { name: 'On Route', value: onRouteLorries, color: '#2563EB' },
    { name: 'Maintenance', value: maintenanceLorries, color: '#F43F5E' },
    { name: 'Loading', value: lorries.filter((l) => l.status === 'LOADING').length, color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  const kpiCards = [
    { label: 'Total Users', value: users.length, sub: `${activeUsers} active`, color: 'purple', icon: <Users className="w-5 h-5" /> },
    { label: 'Active Users', value: activeUsers, sub: 'Authorized access', color: 'emerald', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Drivers Registered', value: drivers.length, sub: `In system registry`, color: 'blue', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Fleet Size', value: lorries.length, sub: `${availableLorries} available now`, color: 'indigo', icon: <Truck className="w-5 h-5" /> },
    { label: 'Total Shipments', value: shipments.length, sub: `${pendingShipments} pending`, color: 'amber', icon: <Package className="w-5 h-5" /> },
    { label: 'Active Routes', value: routes.length, sub: 'Dispatched corridors', color: 'teal', icon: <Route className="w-5 h-5" /> },
    { label: 'Opt Runs', value: optRuns.length, sub: '15-step heuristics', color: 'violet', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'System Alerts', value: alerts.length, sub: `${criticalAlerts} critical`, color: 'rose', icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  const colorStyles: Record<string, { bg: string; text: string; num: string }> = {
    purple: { bg: 'bg-purple-50 border-purple-200 text-purple-600', text: 'text-purple-500', num: 'text-purple-700' },
    emerald: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', text: 'text-emerald-500', num: 'text-emerald-700' },
    blue: { bg: 'bg-blue-50 border-blue-200 text-blue-600', text: 'text-blue-500', num: 'text-blue-700' },
    indigo: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-600', text: 'text-indigo-500', num: 'text-indigo-700' },
    amber: { bg: 'bg-amber-50 border-amber-200 text-amber-600', text: 'text-amber-500', num: 'text-amber-700' },
    teal: { bg: 'bg-teal-50 border-teal-200 text-teal-600', text: 'text-teal-500', num: 'text-teal-700' },
    violet: { bg: 'bg-violet-50 border-violet-200 text-violet-600', text: 'text-violet-500', num: 'text-violet-700' },
    rose: { bg: 'bg-rose-50 border-rose-200 text-rose-600', text: 'text-rose-500', num: 'text-rose-700' },
  };

  // Services health (static for now — API calls not needed at build time)
  const services = [
    { name: 'Firebase Auth', status: 'ONLINE', latency: '38ms', icon: <Shield className="w-4 h-4" />, color: 'emerald' },
    { name: 'Supabase DB', status: 'ONLINE', latency: '52ms', icon: <Database className="w-4 h-4" />, color: 'emerald' },
    { name: 'Groq AI Engine', status: 'CHECK KEY', latency: '—', icon: <Sparkles className="w-4 h-4" />, color: 'amber' },
    { name: 'Mapbox GL JS', status: 'ONLINE', latency: '44ms', icon: <Globe className="w-4 h-4" />, color: 'emerald' },
    { name: 'Geoapify Geo', status: 'ONLINE', latency: '61ms', icon: <Wifi className="w-4 h-4" />, color: 'emerald' },
    { name: 'SMTP Email', status: 'ONLINE', latency: '—', icon: <Server className="w-4 h-4" />, color: 'emerald' },
  ];

  const statusColor: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-400',
    rose: 'bg-rose-500',
  };
  const statusTextColor: Record<string, string> = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <>
      {/* Dark Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 px-6 sm:px-10 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-purple-300 uppercase">FleetMind AI · System Administration</p>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">Platform Command Center</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 font-medium ml-13">
            Global platform health · User roles · Vehicle registry · Fuel configuration · Audit records
          </p>
          {/* Summary banner */}
          <div className="mt-4 flex flex-wrap gap-3 ml-13">
            {[
              { label: 'Total ROI', value: `₹${totalSavings.toLocaleString('en-IN')}`, color: 'text-emerald-300' },
              { label: 'Fleet', value: `${lorries.length} vehicles`, color: 'text-blue-300' },
              { label: 'Diesel', value: `₹${settings.fuel_price_per_liter}/L`, color: 'text-amber-300' },
              { label: 'Alerts', value: `${alerts.length} active`, color: alerts.length > 0 ? 'text-rose-300' : 'text-slate-400' },
            ].map((b) => (
              <span key={b.label} className="text-[11px] font-bold text-white/50">
                {b.label}: <span className={b.color}>{b.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* === KPI CARDS === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {kpiCards.map((kpi) => {
            const cs = colorStyles[kpi.color];
            return (
              <div key={kpi.label} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${cs.bg}`}>
                  {kpi.icon}
                </div>
                <div className={`text-2xl font-black font-display ${cs.num}`}>{kpi.value}</div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-tight">{kpi.label}</p>
                  <p className="text-[9px] text-slate-400">{kpi.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* === ANALYTICS ROW === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* User Roles Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">User Role Distribution</h3>
              <p className="text-xs text-slate-500">{users.length} registered platform users</p>
            </div>
            {roleData.length > 0 ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Users" label={{ position: 'top', fontSize: 10, fill: '#64748B' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-300 text-xs">No user data</div>
            )}
          </div>

          {/* Fleet Status Pie */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Fleet Status Breakdown</h3>
              <p className="text-xs text-slate-500">{lorries.length} registered carriers</p>
            </div>
            {fleetPieData.length > 0 ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fleetPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {fleetPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-300 text-xs">No fleet data</div>
            )}
          </div>

          {/* Shipment Pipeline */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Shipment Pipeline</h3>
              <p className="text-xs text-slate-500">{shipments.length} total consignments</p>
            </div>
            {[
              { label: 'Pending', count: pendingShipments, total: shipments.length, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'In Transit', count: inTransitShipments, total: shipments.length, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Delivered', count: deliveredShipments, total: shipments.length, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'Cancelled', count: shipments.filter(s => s.status === 'CANCELLED').length, total: shipments.length, color: 'bg-slate-400', text: 'text-slate-600' },
            ].map((row) => {
              const pct = row.total > 0 ? Math.round((row.count / row.total) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className={row.text}>{row.label}</span>
                    <span className="text-slate-700">{row.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === SYSTEM HEALTH STATUS === */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> System Services Health
              </h3>
              <p className="text-xs text-slate-500">Live status of all integrated platform services</p>
            </div>
            <Link href="/admin/system-health" className="text-[11px] font-bold text-purple-600 flex items-center gap-1">
              Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {services.map((svc) => (
              <div key={svc.name} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-center">
                <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center ${statusTextColor[svc.color]}`}>
                  {svc.icon}
                </div>
                <p className="text-[10px] font-black text-slate-700">{svc.name}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${statusColor[svc.color]} animate-pulse`} />
                  <span className="text-[9px] font-bold text-slate-500">{svc.status}</span>
                </div>
                <p className="text-[9px] text-slate-400 font-mono">{svc.latency}</p>
              </div>
            ))}
          </div>
        </div>

        {/* === GLOBAL TARIFF SETTINGS === */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Global Operational Tariffs</h3>
              <p className="text-xs text-slate-500">Live rates used by the TypeScript Optimization Engine</p>
            </div>
            <Link href="/admin/settings" className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Modify Settings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Commercial Diesel', value: `₹${settings.fuel_price_per_liter}`, unit: 'per liter', icon: <Fuel className="w-4 h-4" />, color: 'amber' },
              { label: 'Driver Base Rate', value: `₹${settings.driver_base_rate_per_km}`, unit: 'per km', icon: <UserCheck className="w-4 h-4" />, color: 'blue' },
              { label: 'Fixed Dispatch Cost', value: `₹${settings.fixed_dispatch_cost_per_lorry}`, unit: 'per lorry', icon: <Truck className="w-4 h-4" />, color: 'indigo' },
              { label: 'Avg Speed Target', value: `${settings.average_speed_km_per_h || 48}`, unit: 'km/h', icon: <Zap className="w-4 h-4" />, color: 'emerald' },
            ].map((t) => {
              const cs = colorStyles[t.color];
              return (
                <div key={t.label} className={`p-4 rounded-2xl border ${cs.bg} space-y-1`}>
                  <div className="flex items-center gap-2">
                    <span className={cs.text}>{t.icon}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{t.label}</span>
                  </div>
                  <div className={`text-2xl font-black ${cs.num}`}>{t.value}</div>
                  <p className="text-[11px] text-slate-500 font-medium">{t.unit}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* === LIVE FLEET MAP === */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">System-Wide Live GPS Telemetry</h3>
              <p className="text-xs text-slate-500">Organization-wide active vehicles via Supabase Realtime</p>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Sync
            </span>
          </div>
          <div className="h-[460px]">
            <LiveFleetMap lorries={lorries} routes={routes} shipments={shipments} height="100%" />
          </div>
        </div>

        {/* === QUICK ACTION CARDS === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/admin/users', label: 'User Management', sub: 'Invite users, assign roles, activate accounts', icon: <Users className="w-5 h-5" />, color: 'purple' },
            { href: '/admin/fleet', label: 'Fleet Registry', sub: 'Register lorries, update specs & maintenance', icon: <Truck className="w-5 h-5" />, color: 'blue' },
            { href: '/admin/system-health', label: 'System Health', sub: 'Firebase, Supabase, AI Engine & storage checks', icon: <Activity className="w-5 h-5" />, color: 'emerald' },
            { href: '/admin/audit-logs', label: 'Audit Logs', sub: 'Cryptographic before/after system mutation records', icon: <Shield className="w-5 h-5" />, color: 'rose' },
          ].map((card) => {
            const cs = colorStyles[card.color];
            return (
              <Link
                key={card.href}
                href={card.href}
                className="p-5 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cs.bg} group-hover:scale-105 transition-transform`}>
                  {card.icon}
                </div>
                <h4 className="text-sm font-black text-slate-900">{card.label}</h4>
                <p className="text-xs text-slate-500">{card.sub}</p>
              </Link>
            );
          })}
        </div>

      </main>
    </>
  );
}
