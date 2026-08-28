'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Fuel, Gauge, TrendingDown, CheckCircle2, Inbox, Leaf, IndianRupee, AlertTriangle, Zap, BarChart3, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend, AreaChart, Area,
} from 'recharts';

const ECO_GRADE = (kml: number) => {
  if (kml >= 9) return { grade: 'A+', label: 'Excellent', colorClass: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
  if (kml >= 7.5) return { grade: 'A', label: 'Good', colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (kml >= 6) return { grade: 'B', label: 'Average', colorClass: 'text-amber-700 bg-amber-100 border-amber-300' };
  return { grade: 'C', label: 'Below Average', colorClass: 'text-rose-700 bg-rose-100 border-rose-300' };
};

export default function ManagerFuelPage() {
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [settings, setSettings] = useState(fleetMindStore.getSystemSettings());
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());

  useEffect(() => {
    const update = () => {
      setLorries(fleetMindStore.getLorries());
      setSettings(fleetMindStore.getSystemSettings());
      setRoutes(fleetMindStore.getRoutes());
    };
    update();
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const totalFuelL = routes.reduce((s, r) => s + (r.fuel_consumption_liters || 0), 0);
  const totalFuelCostINR = Math.round(totalFuelL * settings.fuel_price_per_liter);
  const co2Kg = Number((totalFuelL * 2.68).toFixed(1));

  const avgKml = lorries.length > 0
    ? Number((lorries.reduce((s, l) => s + (l.fuel_efficiency_km_per_l || 0), 0) / lorries.length).toFixed(2))
    : 0;

  const avgCostPerKm = avgKml > 0
    ? Number((settings.fuel_price_per_liter / avgKml).toFixed(2))
    : 0;

  const fullCostPerKm = Number((avgCostPerKm + 2.2 + settings.driver_base_rate_per_km * 0.45).toFixed(2));

  // Monthly projection (30-day estimate based on current burn rate — assume data spans ~7 days)
  const projectedMonthlyFuelCost = Math.round(totalFuelCostINR * (30 / 7));

  // Per-vehicle fuel data
  const vehicleFuelData = lorries.map((l) => {
    const vehicleRoutes = routes.filter((r) => r.lorry_id === l.id);
    const liters = Number(vehicleRoutes.reduce((s, r) => s + (r.fuel_consumption_liters || 0), 0).toFixed(1));
    const distKm = Number(vehicleRoutes.reduce((s, r) => s + (r.total_distance_km || 0), 0).toFixed(1));
    const fuelCostINR = Math.round(liters * settings.fuel_price_per_liter);
    const fuelRatePerKm = l.fuel_efficiency_km_per_l > 0
      ? Number((settings.fuel_price_per_liter / l.fuel_efficiency_km_per_l).toFixed(2))
      : 0;
    const grade = ECO_GRADE(l.fuel_efficiency_km_per_l);
    const co2 = Number((liters * 2.68).toFixed(1));
    return { l, liters, distKm, fuelCostINR, fuelRatePerKm, grade, co2 };
  }).sort((a, b) => b.l.fuel_efficiency_km_per_l - a.l.fuel_efficiency_km_per_l);

  // Chart data — sorted best to worst eco
  const barData = vehicleFuelData.map(({ l, fuelRatePerKm }) => ({
    name: l.lorry_code,
    mileage: l.fuel_efficiency_km_per_l,
    benchmark: 7.5,
    costPerKm: fuelRatePerKm,
  }));

  // Grade distribution
  const gradeCounts = vehicleFuelData.reduce((acc, { grade }) => {
    acc[grade.grade] = (acc[grade.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Dark Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 px-6 sm:px-10 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">FleetMind AI · Fuel Intelligence Module</p>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">Diesel Fuel Consumption & Fleet Economy</h1>
            </div>
          </div>
          <p className="text-sm text-slate-400 font-medium ml-13">
            Vehicle efficiency rankings · Carbon emissions · Cost per km · Eco-grade benchmarking
          </p>
        </div>
      </div>

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* === HERO FUEL METRICS === */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: 'Diesel Price', value: `₹${settings.fuel_price_per_liter}`, unit: 'per liter', icon: <IndianRupee className="w-5 h-5" />, color: 'amber', num: 'text-amber-700', bg: 'bg-amber-50 border-amber-200 text-amber-600' },
            { label: 'Avg Fleet Economy', value: `${avgKml}`, unit: 'km / liter', icon: <Gauge className="w-5 h-5" />, color: 'emerald', num: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
            { label: 'Total Fuel Burned', value: `${totalFuelL.toFixed(1)}`, unit: 'liters diesel', icon: <Fuel className="w-5 h-5" />, color: 'blue', num: 'text-blue-700', bg: 'bg-blue-50 border-blue-200 text-blue-600' },
            { label: 'Total Fuel Cost', value: `₹${totalFuelCostINR.toLocaleString()}`, unit: 'operational spend', icon: <BarChart3 className="w-5 h-5" />, color: 'rose', num: 'text-rose-700', bg: 'bg-rose-50 border-rose-200 text-rose-600' },
            { label: 'Fuel Cost / km', value: `₹${avgCostPerKm}`, unit: 'diesel only rate', icon: <Activity className="w-5 h-5" />, color: 'indigo', num: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
            { label: 'CO₂ Footprint', value: `${co2Kg}`, unit: 'kg CO₂ equiv', icon: <Leaf className="w-5 h-5" />, color: 'teal', num: 'text-teal-700', bg: 'bg-teal-50 border-teal-200 text-teal-600' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 space-y-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${m.bg}`}>
                {m.icon}
              </div>
              <div className={`text-2xl font-black font-display leading-none ${m.num}`}>{m.value}</div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{m.label}</p>
                <p className="text-[10px] text-slate-400">{m.unit}</p>
              </div>
            </div>
          ))}
        </div>

        {/* === LARGE BAR CHART: Vehicle Economy Rankings === */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Vehicle Fuel Economy Rankings</h2>
              <p className="text-xs text-slate-500">Fleet km/L ratings vs 7.5 km/L national benchmark — sorted best to worst</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              {Object.entries(gradeCounts).map(([grade, count]) => {
                const g = ECO_GRADE(grade === 'A+' ? 9.5 : grade === 'A' ? 8 : grade === 'B' ? 6.5 : 5);
                return (
                  <span key={grade} className={`px-2.5 py-0.5 rounded-full border font-black ${g.colorClass}`}>
                    {grade}: {count} vehicles
                  </span>
                );
              })}
            </div>
          </div>

          {barData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} label={{ value: 'km/L', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#94A3B8' } }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #E2E8F0' }}
                    formatter={(v: any, name: string) => [`${v} km/L`, name === 'mileage' ? 'Vehicle Mileage' : 'Benchmark']}
                  />
                  <ReferenceLine y={7.5} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: 'Benchmark 7.5 km/L', fill: '#D97706', fontSize: 10, position: 'right' }} />
                  <Bar dataKey="mileage" name="Mileage (km/L)" radius={[6, 6, 0, 0]}
                    fill="#2563EB"
                    label={{ position: 'top', fontSize: 10, fill: '#475569', formatter: (v: number) => `${v}` }}
                  />
                  <Bar dataKey="benchmark" name="Benchmark (7.5 km/L)" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-200" />
              <p className="text-sm font-semibold text-slate-500">No vehicles registered yet</p>
              <p className="text-xs text-slate-400">Add vehicles in the Dispatcher Fleet portal</p>
            </div>
          )}
        </div>

        {/* === DETAILED VEHICLE FUEL TABLE === */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Detailed Vehicle Fuel Report</h2>
              <p className="text-xs text-slate-500">Per-vehicle breakdown: liters consumed, fuel cost, efficiency, eco grade, CO₂</p>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <p className="font-bold text-slate-700">Projected Monthly Fuel Cost</p>
              <p className="text-lg font-black text-rose-700">₹{projectedMonthlyFuelCost.toLocaleString()}</p>
            </div>
          </div>

          {vehicleFuelData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Rank', 'Vehicle', 'Model', 'Mileage', 'Eco Grade', 'Fuel Rate/km', 'Liters Burned', 'Fuel Cost', 'CO₂ (kg)', 'Distance'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicleFuelData.map(({ l, liters, distKm, fuelCostINR, fuelRatePerKm, grade, co2 }, idx) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 pr-4">
                        <span className={`font-black text-sm ${idx === 0 ? 'text-amber-600' : idx === 1 ? 'text-slate-500' : 'text-slate-400'}`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-black text-slate-900">{l.lorry_code}</td>
                      <td className="py-3 pr-4 text-slate-500 font-medium">{l.model}</td>
                      <td className="py-3 pr-4">
                        <span className="font-black text-blue-700">{l.fuel_efficiency_km_per_l} km/L</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${grade.colorClass}`}>
                          {grade.grade} — {grade.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-black text-indigo-700">₹{fuelRatePerKm}/km</td>
                      <td className="py-3 pr-4">
                        <div>
                          <span className="font-black text-amber-700">{liters} L</span>
                          {liters === 0 && <span className="text-[10px] text-slate-400 ml-1">(no routes)</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-black text-rose-700">₹{fuelCostINR.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <span className="font-bold text-teal-700">{co2} kg</span>
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{distKm} km</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                    <td colSpan={2} className="py-3 pr-4 font-black text-slate-900 text-xs">TOTAL / FLEET AVG</td>
                    <td className="py-3 pr-4" />
                    <td className="py-3 pr-4 font-black text-blue-700 text-xs">{avgKml} km/L avg</td>
                    <td className="py-3 pr-4" />
                    <td className="py-3 pr-4 font-black text-indigo-700 text-xs">₹{avgCostPerKm}/km avg</td>
                    <td className="py-3 pr-4 font-black text-amber-700 text-xs">{totalFuelL.toFixed(1)} L</td>
                    <td className="py-3 pr-4 font-black text-rose-700 text-xs">₹{totalFuelCostINR.toLocaleString()}</td>
                    <td className="py-3 pr-4 font-bold text-teal-700 text-xs">{co2Kg} kg</td>
                    <td className="py-3 pr-4" />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="py-16 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2 bg-slate-50/50">
              <Inbox className="w-10 h-10 text-slate-200" />
              <p className="font-semibold text-slate-500">No vehicle data available</p>
              <p className="text-xs text-slate-400 max-w-xs text-center">
                Register vehicles and dispatch routes in the Dispatcher portal to view live fuel analytics.
              </p>
            </div>
          )}
        </div>

        {/* === FUEL COST vs RUNNING RATE ANALYSIS === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel cost per km by vehicle */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Fuel Cost Per km by Vehicle</h3>
              <p className="text-xs text-slate-500">₹ diesel-only per km (lower = better)</p>
            </div>
            {barData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData.map(d => ({ ...d, costPerKm: d.costPerKm }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`₹${v}/km`, 'Fuel Cost/km']} />
                    <Bar dataKey="costPerKm" fill="#6366F1" radius={[4, 4, 0, 0]} name="₹/km" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-300 text-xs">No data</div>
            )}
          </div>

          {/* Eco Grade Summary Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Fleet Eco Grade Summary</h3>
              <p className="text-xs text-slate-500">Vehicles classified by fuel efficiency performance</p>
            </div>
            <div className="space-y-3">
              {[
                { grade: 'A+', label: 'Excellent (≥ 9 km/L)', color: 'emerald' },
                { grade: 'A', label: 'Good (7.5–9 km/L)', color: 'green' },
                { grade: 'B', label: 'Average (6–7.5 km/L)', color: 'amber' },
                { grade: 'C', label: 'Below Average (< 6 km/L)', color: 'rose' },
              ].map(({ grade, label, color }) => {
                const count = gradeCounts[grade] || 0;
                const pct = lorries.length > 0 ? Math.round((count / lorries.length) * 100) : 0;
                const barColors: Record<string, string> = { emerald: 'bg-emerald-500', green: 'bg-green-500', amber: 'bg-amber-500', rose: 'bg-rose-500' };
                const textColors: Record<string, string> = { emerald: 'text-emerald-700', green: 'text-green-700', amber: 'text-amber-700', rose: 'text-rose-700' };
                return (
                  <div key={grade} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm w-8 ${textColors[color]}`}>{grade}</span>
                        <span className="text-slate-500 font-medium">{label}</span>
                      </div>
                      <span className={`font-black ${textColors[color]}`}>{count} vehicles ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColors[color]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 rounded-2xl p-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Fleet Avg Mileage</p>
                <p className="text-xl font-black text-blue-700">{avgKml} <span className="text-sm font-medium text-slate-500">km/L</span></p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Full Running Rate</p>
                <p className="text-xl font-black text-indigo-700">₹{fullCostPerKm} <span className="text-sm font-medium text-slate-500">/km</span></p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
