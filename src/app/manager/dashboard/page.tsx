'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';

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
import {
  TrendingUp,
  Fuel,
  DollarSign,
  Truck,
  CheckCircle2,
  BarChart3,
  Award,
  ArrowUpRight,
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
  Legend,
} from 'recharts';

const COST_TREND_DATA = [
  { month: 'Apr', baseline: 1450000, optimized: 1220000, savings: 230000 },
  { month: 'May', baseline: 1580000, optimized: 1310000, savings: 270000 },
  { month: 'Jun', baseline: 1690000, optimized: 1390000, savings: 300000 },
  { month: 'Jul', baseline: 1820000, optimized: 1480000, savings: 340000 },
  { month: 'Aug', baseline: 1950000, optimized: 1580000, savings: 370000 },
  { month: 'Current', baseline: 2100000, optimized: 1690000, savings: 410000 },
];

const VEHICLE_EFFICIENCY_DATA = [
  { name: 'Ace / Dost (1.5T)', eco: 13.5, benchmark: 11.0 },
  { name: 'Pro 2049 (2.7T)', eco: 10.2, benchmark: 9.0 },
  { name: '1109 / 2059 (6T)', eco: 8.8, benchmark: 7.0 },
  { name: 'Boss / 1217R (8T)', eco: 6.6, benchmark: 5.5 },
  { name: 'Multi-Axle (18T+)', eco: 4.2, benchmark: 3.5 },
];

export default function ManagerDashboardPage() {
  const shipments = fleetMindStore.getShipments();
  const lorries = fleetMindStore.getLorries();
  const routes = fleetMindStore.getRoutes();

  const totalCost = routes.reduce((s, r) => s + r.estimated_cost, 0);
  const totalFuel = routes.reduce((s, r) => s + r.fuel_consumption_liters, 0);
  const onRouteCount = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const fleetUtilization = lorries.length > 0 ? Number(((onRouteCount / lorries.length) * 100).toFixed(1)) : 0;

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
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quarterly ROI</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +18.4%
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-700 font-display">₹5,20,000</div>
            <p className="text-xs text-slate-500 font-medium">Cumulative optimization cost reduction</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SLA Compliance</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Target: 98%
              </span>
            </div>
            <div className="text-3xl font-black text-blue-700 font-display">98.2%</div>
            <p className="text-xs text-slate-500 font-medium">On-time delivery across 84 consignments</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Average Payload Density</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Target: 80%
              </span>
            </div>
            <div className="text-3xl font-black text-indigo-700 font-display">82.5%</div>
            <p className="text-xs text-slate-500 font-medium">Weight & volume capacity utilization</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Diesel Consumed</span>
              <span className="text-[10px] font-bold text-slate-400">@ ₹96.50/L</span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-display">{totalFuel.toFixed(1)} L</div>
            <p className="text-xs text-slate-500 font-medium">Active dispatch operational burn</p>
          </div>
        </div>

        {/* Recharts: Cost Comparison & Fuel Benchmarking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Monthly Spend: Baseline vs Optimized (INR ₹)
              </h3>
              <p className="text-xs text-slate-500">Continuous cost reduction via automated 2-opt routing & consolidation</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={COST_TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
                  <Area type="monotone" dataKey="baseline" stroke="#94A3B8" fill="#F1F5F9" name="Baseline (Unoptimized)" />
                  <Area type="monotone" dataKey="optimized" stroke="#2563EB" fill="#DBEAFE" strokeWidth={2} name="Optimized (FleetMind)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fuel Benchmarking Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Vehicle Category Fuel Efficiency (km/L)
              </h3>
              <p className="text-xs text-slate-500">FleetMind actual economy vs national industry benchmark</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VEHICLE_EFFICIENCY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip formatter={(v: any) => [`${v} km/L`, '']} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="benchmark" fill="#CBD5E1" name="Industry Avg (km/L)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="eco" fill="#059669" name="FleetMind Fleet (km/L)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Corridor Performance Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Primary Highway Corridor Economics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-xs">Karur → Chennai (NH81 / NH45)</span>
              <p className="text-xs text-slate-500">Volume: 32 Consignments • 84% Load Density</p>
              <div className="text-sm font-black text-emerald-700 pt-1">₹1,42,000 Net Savings</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-xs">Bengaluru → Chennai (NH48)</span>
              <p className="text-xs text-slate-500">Volume: 28 Consignments • 88% Load Density</p>
              <div className="text-sm font-black text-emerald-700 pt-1">₹1,85,000 Net Savings</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 text-xs">Coimbatore → Bengaluru (NH544)</span>
              <p className="text-xs text-slate-500">Volume: 24 Consignments • 79% Load Density</p>
              <div className="text-sm font-black text-emerald-700 pt-1">₹1,12,000 Net Savings</div>
            </div>
          </div>
        </div>

        {/* Live Operational Fleet Telemetry Map for Executive Visibility */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Fleet-Wide Live GPS Telemetry Map
              </h3>
              <p className="text-xs text-slate-500">
                Active commercial vehicle tracking across authorized logistics corridors
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black uppercase">
              ● Live Synced
            </span>
          </div>

          <div className="h-[480px]">
            <LiveFleetMap
              lorries={lorries}
              routes={routes}
              shipments={shipments}
              height="100%"
            />
          </div>
        </div>
      </main>
    </>
  );
}
