'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import {
  TrendingUp, Fuel, DollarSign, Truck, CheckCircle2, BarChart3, Award,
  ArrowUpRight, Package, Sparkles, Inbox, AlertTriangle, Zap, Gauge,
  Leaf, Clock, IndianRupee, Navigation, Target, TrendingDown, Activity,
  ArrowRight, Users,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from 'recharts';

const LiveFleetMap = dynamic(
  () => import('../../../components/map/live-fleet-map').then((m) => m.LiveFleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] bg-slate-50 animate-pulse rounded-2xl border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">
        Loading Manager Live Telemetry Fleet View...
      </div>
    ),
  }
);

const CHART_COLORS = {
  blue: '#2563EB', emerald: '#10B981', indigo: '#6366F1', amber: '#F59E0B',
  rose: '#F43F5E', teal: '#14B8A6', purple: '#8B5CF6', slate: '#94A3B8',
};

const FUEL_ECO_GRADE = (kml: number) => {
  if (kml >= 9) return { grade: 'A+', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
  if (kml >= 7.5) return { grade: 'A', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (kml >= 6) return { grade: 'B', color: 'text-amber-700 bg-amber-100 border-amber-300' };
  return { grade: 'C', color: 'text-rose-700 bg-rose-100 border-rose-300' };
};

export default function ManagerDashboardPage() {
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [drivers, setDrivers] = useState(fleetMindStore.getDrivers());
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [runs, setRuns] = useState(fleetMindStore.getOptimizationRuns());
  const [settings, setSettings] = useState(fleetMindStore.getSystemSettings());

  useEffect(() => {
    const update = () => {
      setShipments(fleetMindStore.getShipments());
      setLorries(fleetMindStore.getLorries());
      setDrivers(fleetMindStore.getDrivers());
      setRoutes(fleetMindStore.getRoutes());
      setRuns(fleetMindStore.getOptimizationRuns());
      setSettings(fleetMindStore.getSystemSettings());
    };
    update();
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  // === Core Metrics ===
  const totalCost = routes.reduce((s, r) => s + (r.estimated_cost || 0), 0);
  const totalFuelL = routes.reduce((s, r) => s + (r.fuel_consumption_liters || 0), 0);
  const totalFuelCostINR = totalFuelL * settings.fuel_price_per_liter;
  const co2Kg = Number((totalFuelL * 2.68).toFixed(1));
  const onRouteCount = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const availableCount = lorries.filter((l) => l.status === 'AVAILABLE').length;
  const maintenanceCount = lorries.filter((l) => l.status === 'MAINTENANCE').length;
  const loadingCount = lorries.filter((l) => l.status === 'LOADING').length;
  const fleetUtilPct = lorries.length > 0 ? Number(((onRouteCount / lorries.length) * 100).toFixed(1)) : 0;
  const totalSavedINR = runs.reduce((s, r) => s + (r.savings?.cost_inr || 0), 0);
  const deliveredCount = shipments.filter((s) => s.status === 'DELIVERED').length;
  const inTransitCount = shipments.filter((s) => s.status === 'IN_TRANSIT').length;
  const pendingCount = shipments.filter((s) => s.status === 'PENDING').length;
  const cancelledCount = shipments.filter((s) => s.status === 'CANCELLED').length;
  const slaRate = shipments.length > 0 ? Number((((deliveredCount + inTransitCount) / shipments.length) * 100).toFixed(1)) : 0;
  const avgKml = lorries.length > 0 ? Number((lorries.reduce((s, l) => s + (l.fuel_efficiency_km_per_l || 0), 0) / lorries.length).toFixed(2)) : 0;
  const avgCostPerKm = lorries.length > 0
    ? Number(((settings.fuel_price_per_liter / (avgKml || 7)) + 2.2 + (settings.driver_base_rate_per_km * 0.45)).toFixed(2))
    : 0;

  // === Chart Data ===
  const costTrendData = runs.length > 0
    ? runs.slice(-7).map((r, idx) => ({
        name: `Run ${idx + 1}`,
        baseline: Math.round((r.after_metrics?.total_cost_inr || 0) + (r.savings?.cost_inr || 0)),
        optimized: Math.round(r.after_metrics?.total_cost_inr || 0),
        savings: Math.round(r.savings?.cost_inr || 0),
      }))
    : Array.from({ length: 6 }, (_, i) => ({
        name: `Week ${i + 1}`,
        baseline: 42000 + i * 1800,
        optimized: 31000 + i * 900,
        savings: 11000 + i * 900,
      }));

  const vehicleEcoData = [...lorries]
    .sort((a, b) => b.fuel_efficiency_km_per_l - a.fuel_efficiency_km_per_l)
    .slice(0, 10)
    .map((l) => ({
      name: l.lorry_code,
      eco: l.fuel_efficiency_km_per_l,
      benchmark: 7.5,
      cost: Number(((settings.fuel_price_per_liter / l.fuel_efficiency_km_per_l) + 2.2 + settings.driver_base_rate_per_km * 0.45).toFixed(2)),
    }));

  const shipmentStatusData = [
    { name: 'Delivered', value: deliveredCount, color: CHART_COLORS.emerald },
    { name: 'In Transit', value: inTransitCount, color: CHART_COLORS.blue },
    { name: 'Pending', value: pendingCount, color: CHART_COLORS.amber },
    { name: 'Cancelled', value: cancelledCount, color: CHART_COLORS.rose },
  ].filter(d => d.value > 0);

  const fleetStatusData = [
    { name: 'On Route', value: onRouteCount, fill: CHART_COLORS.blue },
    { name: 'Available', value: availableCount, fill: CHART_COLORS.emerald },
    { name: 'Loading', value: loadingCount, fill: CHART_COLORS.amber },
    { name: 'Maintenance', value: maintenanceCount, fill: CHART_COLORS.rose },
  ];

  const atRiskShipments = shipments.filter((s) => {
    if (s.status === 'DELIVERED' || s.status === 'CANCELLED') return false;
    const slackMins = (new Date(s.delivery_deadline).getTime() - Date.now()) / 60000;
    return slackMins < 240;
  }).slice(0, 5);

  const fuelByVehicle = lorries.map((l) => {
    const vehicleRoutes = routes.filter((r) => r.lorry_id === l.id);
    const liters = vehicleRoutes.reduce((s, r) => s + (r.fuel_consumption_liters || 0), 0);
    const cost = Math.round(liters * settings.fuel_price_per_liter);
    const grade = FUEL_ECO_GRADE(l.fuel_efficiency_km_per_l);
    return { lorry: l, liters: Number(liters.toFixed(1)), cost, grade };
  }).filter((d) => d.liters > 0).sort((a, b) => b.liters - a.liters);

  const kpiCards = [
    { label: 'Total ROI Saved', value: `₹${totalSavedINR.toLocaleString('en-IN')}`, sub: `${runs.length} optimization runs`, color: 'emerald', icon: <TrendingDown className="w-5 h-5" /> },
    { label: 'SLA Compliance', value: `${slaRate}%`, sub: `${deliveredCount} delivered / ${shipments.length} total`, color: 'blue', icon: <Target className="w-5 h-5" /> },
    { label: 'Fleet Active Rate', value: `${fleetUtilPct}%`, sub: `${onRouteCount} of ${lorries.length} on route`, color: 'indigo', icon: <Truck className="w-5 h-5" /> },
    { label: 'Diesel Burned', value: `${totalFuelL.toFixed(1)} L`, sub: `₹${Math.round(totalFuelCostINR).toLocaleString('en-IN')} total cost`, color: 'amber', icon: <Fuel className="w-5 h-5" /> },
    { label: 'Total Op Cost', value: `₹${Math.round(totalCost).toLocaleString('en-IN')}`, sub: `@ ₹${avgCostPerKm}/km avg rate`, color: 'rose', icon: <IndianRupee className="w-5 h-5" /> },
    { label: 'CO₂ Emissions', value: `${co2Kg} kg`, sub: `${totalFuelL.toFixed(1)} L × 2.68 kg/L`, color: 'teal', icon: <Leaf className="w-5 h-5" /> },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    indigo: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    rose: 'text-rose-700 bg-rose-50 border-rose-200',
    teal: 'text-teal-700 bg-teal-50 border-teal-200',
  };
  const numColorMap: Record<string, string> = {
    emerald: 'text-emerald-700', blue: 'text-blue-700', indigo: 'text-indigo-700',
    amber: 'text-amber-700', rose: 'text-rose-700', teal: 'text-teal-700',
  };

  return (
    <>
      <PortalHeader
        title="Executive BI & Cost Intelligence"
        subtitle="Strategic overview · Diesel benchmarking · SLA compliance · Net ROI · Carbon footprint"
        category="FleetMind AI · Manager Analytics Portal"
        icon={<BarChart3 className="w-5 h-5" />}
        accent="indigo"
      />

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* === KPI STRIP === */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 space-y-2"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[kpi.color]}`}>
                {kpi.icon}
              </div>
              <div className={`text-2xl font-black font-display leading-none ${numColorMap[kpi.color]}`}>
                {kpi.value}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-[10px] text-slate-400 font-medium">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* === FUEL ANALYTICS — BIG SECTION === */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl border border-indigo-500/20 shadow-2xl overflow-hidden">
          {/* Fuel Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">Live Telemetry</p>
                <h2 className="text-base font-black text-white">Fuel Consumption & Fleet Economy Analytics</h2>
              </div>
            </div>
            <Link href="/manager/fuel" className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition">
              Full Report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Fuel KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 divide-x divide-white/10">
            {[
              { label: 'Diesel Price', value: `₹${settings.fuel_price_per_liter}`, unit: '/ Liter', color: 'text-amber-300' },
              { label: 'Avg Fleet Economy', value: `${avgKml}`, unit: 'km / L', color: 'text-emerald-300' },
              { label: 'Total Fuel Burn', value: `${totalFuelL.toFixed(1)}`, unit: 'Liters', color: 'text-blue-300' },
              { label: 'Fuel Bill', value: `₹${Math.round(totalFuelCostINR).toLocaleString('en-IN')}`, unit: 'total cost', color: 'text-rose-300' },
              { label: 'CO₂ Footprint', value: `${co2Kg}`, unit: 'kg CO₂e', color: 'text-teal-300' },
            ].map((m) => (
              <div key={m.label} className="px-5 py-4 text-center">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
                <p className="text-[9px] text-white/40 font-medium">{m.unit}</p>
              </div>
            ))}
          </div>

          {/* Fuel Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* Vehicle Fuel Economy Bar Chart */}
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-sm font-black text-white">Vehicle Fuel Economy Rankings</h3>
                <p className="text-[11px] text-white/40">Fleet km/L vs 7.5 km/L national benchmark</p>
              </div>
              {vehicleEcoData.length > 0 ? (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vehicleEcoData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <Tooltip
                        contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }}
                        formatter={(v: any, name: string) => [`${v} km/L`, name]}
                      />
                      <Bar dataKey="eco" fill={CHART_COLORS.amber} name="Mileage (km/L)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="benchmark" fill="rgba(148,163,184,0.3)" name="Benchmark 7.5 km/L" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-white/30 text-xs">No vehicle data</div>
              )}
            </div>

            {/* Per-Vehicle Fuel Table */}
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-sm font-black text-white">Fuel Burn by Vehicle</h3>
                <p className="text-[11px] text-white/40">Liters consumed · cost · eco grade</p>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {fuelByVehicle.length > 0 ? fuelByVehicle.map(({ lorry: l, liters, cost, grade }) => (
                  <div key={l.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3.5 py-2.5 hover:bg-white/10 transition">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${grade.color}`}>{grade.grade}</span>
                      <div>
                        <p className="text-xs font-black text-white">{l.lorry_code}</p>
                        <p className="text-[10px] text-white/40">{l.fuel_efficiency_km_per_l} km/L</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-amber-300">{liters} L</p>
                      <p className="text-[10px] text-white/40">₹{cost.toLocaleString()}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-white/30 text-xs py-8">No route data yet — dispatch vehicles to populate</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === CHARTS ROW: Cost Trend + Shipment Status === */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Cost Optimization Trend — wider */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Optimization Cost Savings</h3>
                <p className="text-xs text-slate-500">Baseline vs FleetMind optimized cost (₹) across runs</p>
              </div>
              <Link href="/manager/cost" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #E2E8F0' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="#CBD5E1" fill="#F8FAFC" name="Baseline (Unoptimized)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="optimized" stroke={CHART_COLORS.blue} fill="#DBEAFE" strokeWidth={2.5} name="Optimized (FleetMind)" />
                  <Area type="monotone" dataKey="savings" stroke={CHART_COLORS.emerald} fill="#D1FAE5" strokeWidth={2} name="Net Savings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shipment Status Pie */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Consignment Status</h3>
              <p className="text-xs text-slate-500">{shipments.length} total shipments in system</p>
            </div>
            {shipmentStatusData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={shipmentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {shipmentStatusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Package className="w-10 h-10 text-slate-200 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">No shipments yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === FLEET STATUS + AT-RISK SHIPMENTS === */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Fleet Status Donut */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Fleet Status Distribution</h3>
              <p className="text-xs text-slate-500">{lorries.length} registered carriers</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'On Route', count: onRouteCount, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'Available', count: availableCount, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'Loading', count: loadingCount, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'Maintenance', count: maintenanceCount, color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-3.5 space-y-1`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</span>
                  </div>
                  <p className={`text-3xl font-black ${s.text}`}>{s.count}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {lorries.length > 0 ? Math.round((s.count / lorries.length) * 100) : 0}% of fleet
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* At-Risk Shipments */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> At-Risk Shipments
                </h3>
                <p className="text-xs text-slate-500">Consignments with &lt; 4h SLA deadline remaining</p>
              </div>
              <Link href="/manager/delivery" className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {atRiskShipments.length > 0 ? (
              <div className="space-y-2">
                {atRiskShipments.map((s) => {
                  const slackMins = Math.round((new Date(s.delivery_deadline).getTime() - Date.now()) / 60000);
                  const isCritical = slackMins < 60;
                  return (
                    <div key={s.id} className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div>
                        <p className="font-black text-slate-900">{s.shipment_code}</p>
                        <p className="text-slate-500">{s.pickup_city} → {s.destination_city} · {s.weight_kg} kg</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${isCritical ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>
                          {slackMins < 0 ? `OVERDUE ${Math.abs(slackMins)}m` : `${Math.floor(slackMins / 60)}h ${slackMins % 60}m left`}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">{s.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto" />
                <p className="text-sm font-black text-emerald-700">All consignments on schedule</p>
                <p className="text-xs text-slate-400">No SLA violations detected in active shipments</p>
              </div>
            )}
          </div>
        </div>

        {/* === LIVE FLEET MAP === */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Live Geographic Telemetry</h3>
              <p className="text-xs text-slate-500">Real-time GPS positions of active carriers across highway corridors</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Sync
            </span>
          </div>
          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200">
            <LiveFleetMap lorries={lorries} routes={routes} shipments={shipments} height="100%" />
          </div>
        </div>

        {/* === QUICK LINKS === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/manager/fuel', label: 'Fuel Analytics', sub: 'Full vehicle economy report', icon: <Fuel className="w-5 h-5" />, color: 'amber' },
            { href: '/manager/cost', label: 'Cost Intelligence', sub: 'Cost breakdown & per-km rate', icon: <IndianRupee className="w-5 h-5" />, color: 'indigo' },
            { href: '/manager/fleet-analytics', label: 'Fleet Analytics', sub: 'Status, utilization, capacity', icon: <Truck className="w-5 h-5" />, color: 'blue' },
            { href: '/manager/performance', label: 'Performance', sub: 'Driver & route efficiency', icon: <Award className="w-5 h-5" />, color: 'emerald' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2 group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[l.color] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {l.icon}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">{l.label}</h4>
                <p className="text-[10px] text-slate-500">{l.sub}</p>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </>
  );
}
