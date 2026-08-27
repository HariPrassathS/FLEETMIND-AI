'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import {
  TrendingUp,
  Fuel,
  DollarSign,
  Truck,
  CheckCircle2,
  BarChart3,
  Award,
  ArrowUpRight,
  Package,
  Sparkles,
  Inbox,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const LiveFleetMap = dynamic(
  () => import('../../../components/map/live-fleet-map').then((m) => m.LiveFleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] bg-slate-50 animate-pulse rounded-2xl border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">
        Loading Manager Live Telemetry Fleet View...
      </div>
    ),
  }
);

export default function ManagerDashboardPage() {
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [runs, setRuns] = useState(fleetMindStore.getOptimizationRuns());
  const [settings, setSettings] = useState(fleetMindStore.getSystemSettings());

  useEffect(() => {
    const updateData = () => {
      setShipments(fleetMindStore.getShipments());
      setLorries(fleetMindStore.getLorries());
      setRoutes(fleetMindStore.getRoutes());
      setRuns(fleetMindStore.getOptimizationRuns());
      setSettings(fleetMindStore.getSystemSettings());
    };

    updateData();
    const unsub = fleetMindStore.subscribe(updateData);
    return unsub;
  }, []);

  // Live Metric Calculations
  const totalCost = routes.reduce((s, r) => s + (r.estimated_cost || 0), 0);
  const totalFuel = routes.reduce((s, r) => s + (r.fuel_consumption_liters || 0), 0);
  const onRouteCount = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const fleetUtilization = lorries.length > 0 ? Number(((onRouteCount / lorries.length) * 100).toFixed(1)) : 0;

  const totalSavedINR = runs.reduce((s, r) => s + (r.savings?.cost_inr || 0), 0);
  const deliveredShipments = shipments.filter((s) => s.status === 'DELIVERED').length;
  const onTimeShipments = shipments.filter((s) => s.status === 'DELIVERED' || s.status === 'IN_TRANSIT').length;
  const slaPercentage = shipments.length > 0 ? Number(((onTimeShipments / shipments.length) * 100).toFixed(1)) : 0;

  // Real Run History for Chart
  const costTrendData =
    runs.length > 0
      ? runs.slice(-6).map((r, idx) => ({
          name: `Run #${idx + 1}`,
          baseline: (r.after_metrics?.total_cost_inr || 0) + (r.savings?.cost_inr || 0),
          optimized: r.after_metrics?.total_cost_inr || 0,
          savings: r.savings?.cost_inr || 0,
        }))
      : [];

  const vehicleEfficiencyData = lorries.map((l) => ({
    name: `${l.lorry_code} (${l.model.split(' ')[0]})`,
    eco: l.fuel_efficiency_km_per_l,
    benchmark: 7.5,
  }));

  return (
    <>
      <PortalHeader
        title="Executive BI & Cost Intelligence"
        subtitle="Strategic overview of transportation expenditures, diesel benchmarking, SLA compliance & net ROI"
      />

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Executive Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Realized ROI</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Live
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-700 font-display">
              ₹{totalSavedINR.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 font-medium">Cumulative heuristic cost reduction</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SLA Delivery Rate</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Target: 98%
              </span>
            </div>
            <div className="text-3xl font-black text-blue-700 font-display">{slaPercentage}%</div>
            <p className="text-xs text-slate-500 font-medium">
              {deliveredShipments} delivered / {shipments.length} total consignments
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fleet Active Rate</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {onRouteCount} Active
              </span>
            </div>
            <div className="text-3xl font-black text-indigo-700 font-display">{fleetUtilization}%</div>
            <p className="text-xs text-slate-500 font-medium">
              {onRouteCount} of {lorries.length} vehicles currently on route
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Diesel Consumed</span>
              <span className="text-[10px] font-bold text-slate-400">@ ₹{settings.fuel_price_per_liter}/L</span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{totalFuel.toFixed(1)} L</div>
            <p className="text-xs text-slate-500 font-medium">Active dispatch operational burn</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Trend Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Optimization Spend Comparison (INR ₹)
              </h3>
              <p className="text-xs text-slate-500">Live before vs after cost delta across optimization batches</p>
            </div>

            {costTrendData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
                    <Area type="monotone" dataKey="baseline" stroke="#94A3B8" fill="#F1F5F9" name="Baseline (Unoptimized)" />
                    <Area type="monotone" dataKey="optimized" stroke="#2563EB" fill="#DBEAFE" strokeWidth={2} name="Optimized (FleetMind)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50">
                <Inbox className="w-8 h-8 text-slate-300" />
                <p className="font-semibold text-slate-600">No Optimization Runs Recorded Yet</p>
                <p className="max-w-xs text-[11px] text-slate-400">
                  Run the 15-step load consolidation optimizer in Dispatcher Portal to populate live cost savings graphs.
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Efficiency Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fleet Vehicle Fuel Economy (KM / L)
              </h3>
              <p className="text-xs text-slate-500">Telemetry fuel efficiency ratings vs standard national benchmark (7.5 km/L)</p>
            </div>

            {vehicleEfficiencyData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vehicleEfficiencyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip formatter={(v: any) => [`${v} km/L`, '']} />
                    <Bar dataKey="eco" fill="#2563EB" name="Vehicle Rating (km/L)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="benchmark" fill="#CBD5E1" name="Benchmark (7.5 km/L)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50">
                <Truck className="w-8 h-8 text-slate-300" />
                <p className="font-semibold text-slate-600">No Vehicles Registered</p>
                <p className="max-w-xs text-[11px] text-slate-400">
                  Register commercial carriers in Dispatcher Fleet portal to monitor live fuel benchmarks.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Operational Fleet Telemetry Map */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Geographic Telemetry Overview
              </h3>
              <p className="text-xs text-slate-500">Real-time GPS positions of active commercial carriers across highway corridors</p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {lorries.length} Registered Carriers
            </span>
          </div>

          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200">
            <LiveFleetMap lorries={lorries} height="100%" />
          </div>
        </div>
      </main>
    </>
  );
}
