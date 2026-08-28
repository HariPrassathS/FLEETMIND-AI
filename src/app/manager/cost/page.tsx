'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { IndianRupee, TrendingDown, BarChart3, Fuel, UserCheck, Navigation, Package, Inbox } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

export default function ManagerCostPage() {
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [runs, setRuns] = useState(fleetMindStore.getOptimizationRuns());
  const [settings, setSettings] = useState(fleetMindStore.getSystemSettings());

  useEffect(() => {
    const update = () => {
      setRoutes(fleetMindStore.getRoutes());
      setLorries(fleetMindStore.getLorries());
      setRuns(fleetMindStore.getOptimizationRuns());
      setSettings(fleetMindStore.getSystemSettings());
    };
    update();
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const totalFuelL = routes.reduce((s, r) => s + (r.fuel_consumption_liters || 0), 0);
  const avgKml = lorries.length > 0
    ? lorries.reduce((s, l) => s + (l.fuel_efficiency_km_per_l || 0), 0) / lorries.length
    : 7;

  const totalDistKm = routes.reduce((s, r) => s + (r.total_distance_km || 0), 0);
  const fuelCost = Math.round(totalFuelL * settings.fuel_price_per_liter);
  const tollCost = Math.round(totalDistKm * 2.2);
  const driverCost = Math.round(totalDistKm * settings.driver_base_rate_per_km);
  const dispatchCost = routes.length * settings.fixed_dispatch_cost_per_lorry;
  const totalCost = fuelCost + tollCost + driverCost + dispatchCost;
  const totalSavings = runs.reduce((s, r) => s + (r.savings?.cost_inr || 0), 0);
  const avgCostPerKm = totalDistKm > 0 ? Number((totalCost / totalDistKm).toFixed(2)) : 0;

  const pieData = [
    { name: 'Fuel', value: fuelCost, color: '#F59E0B' },
    { name: 'Driver', value: driverCost, color: '#2563EB' },
    { name: 'Toll', value: tollCost, color: '#6366F1' },
    { name: 'Dispatch', value: dispatchCost, color: '#10B981' },
  ].filter((d) => d.value > 0);

  const pctOf = (v: number) => totalCost > 0 ? Math.round((v / totalCost) * 100) : 0;

  // Per-route cost breakdown (top 10)
  const routeRows = [...routes]
    .map((r) => {
      const km = r.total_distance_km || 0;
      const fl = r.fuel_consumption_liters || 0;
      const fuelC = Math.round(fl * settings.fuel_price_per_liter);
      const driverC = Math.round(km * settings.driver_base_rate_per_km);
      const tollC = Math.round(km * 2.2);
      const total = fuelC + driverC + tollC + settings.fixed_dispatch_cost_per_lorry;
      return { r, km, fuelC, driverC, tollC, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const savingsData = runs.slice(-8).map((r, i) => ({
    name: `Run ${i + 1}`,
    savings: Math.round(r.savings?.cost_inr || 0),
    baseline: Math.round((r.after_metrics?.total_cost_inr || 0) + (r.savings?.cost_inr || 0)),
  }));

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 sm:px-10 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase">FleetMind AI · Cost Intelligence</p>
            <h1 className="text-xl sm:text-2xl font-black text-white">Transportation Cost Analytics</h1>
          </div>
        </div>
      </div>

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* Hero Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Operational Cost', value: `₹${totalCost.toLocaleString()}`, sub: `${routes.length} active routes`, color: 'text-slate-900', bg: 'bg-slate-900 text-white' },
            { label: 'Net Savings (AI)', value: `₹${totalSavings.toLocaleString()}`, sub: `${runs.length} opt runs`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            { label: 'Avg Cost / km', value: `₹${avgCostPerKm}`, sub: `Total ${totalDistKm.toFixed(0)} km`, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
            { label: 'Total Distance', value: `${totalDistKm.toFixed(0)} km`, sub: `Across all routes`, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
          ].map((m) => (
            <div key={m.label} className={`p-5 rounded-3xl border shadow-sm space-y-1 ${m.bg}`}>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70">{m.label}</p>
              <p className="text-3xl font-black">{m.value}</p>
              <p className="text-[11px] opacity-60 font-medium">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Breakdown Pie */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Cost Breakdown by Category</h3>
              <p className="text-xs text-slate-500">Fuel · Driver · Toll · Fixed dispatch overhead</p>
            </div>
            {pieData.length > 0 ? (
              <>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, '']} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-slate-600 font-medium">{d.name}</span>
                      <span className="ml-auto font-black text-slate-900">₹{d.value.toLocaleString()} ({pctOf(d.value)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-300 text-xs flex-col gap-2">
                <Inbox className="w-8 h-8" /><p>No route cost data yet</p>
              </div>
            )}
          </div>

          {/* Savings Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">AI Optimization Savings per Run</h3>
              <p className="text-xs text-slate-500">Net cost reduction from FleetMind heuristics</p>
            </div>
            {savingsData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={savingsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, '']} />
                    <Bar dataKey="savings" fill="#10B981" radius={[4, 4, 0, 0]} name="Net Savings" />
                    <Bar dataKey="baseline" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Baseline Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-300 text-xs flex-col gap-2">
                <BarChart3 className="w-8 h-8" /><p>Run optimizer to see savings</p>
              </div>
            )}
          </div>
        </div>

        {/* Per-Route Cost Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Routes by Cost</h3>
            <p className="text-xs text-slate-500">Breakdown: fuel + driver + toll + dispatch fixed cost</p>
          </div>
          {routeRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Route ID', 'Distance', 'Fuel Cost', 'Driver Cost', 'Toll', 'Dispatch', 'Total'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-black text-slate-400 uppercase pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {routeRows.map(({ r, km, fuelC, driverC, tollC, total }) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 pr-4 font-black text-slate-900">{r.route_code || r.id.slice(0, 8)}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{km.toFixed(1)} km</td>
                      <td className="py-2.5 pr-4 text-amber-700 font-bold">₹{fuelC.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-blue-700 font-bold">₹{driverC.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-indigo-700 font-bold">₹{tollC.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-teal-700 font-bold">₹{settings.fixed_dispatch_cost_per_lorry.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 font-black text-slate-900">₹{total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-sm space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p>No route data. Dispatch vehicles to generate cost records.</p>
            </div>
          )}
        </div>

      </main>
    </>
  );
}
