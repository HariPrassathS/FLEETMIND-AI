'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Truck, BarChart3, Gauge, Scale, Package, Inbox, Activity } from 'lucide-react';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

export default function ManagerFleetAnalyticsPage() {
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());

  useEffect(() => {
    const update = () => {
      setLorries(fleetMindStore.getLorries());
      setRoutes(fleetMindStore.getRoutes());
    };
    update();
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const statusCounts = {
    AVAILABLE: lorries.filter((l) => l.status === 'AVAILABLE').length,
    ON_ROUTE: lorries.filter((l) => l.status === 'ON_ROUTE').length,
    LOADING: lorries.filter((l) => l.status === 'LOADING').length,
    MAINTENANCE: lorries.filter((l) => l.status === 'MAINTENANCE').length,
  };

  const statusPieData = [
    { name: 'Available', value: statusCounts.AVAILABLE, color: '#10B981' },
    { name: 'On Route', value: statusCounts.ON_ROUTE, color: '#2563EB' },
    { name: 'Loading', value: statusCounts.LOADING, color: '#F59E0B' },
    { name: 'Maintenance', value: statusCounts.MAINTENANCE, color: '#F43F5E' },
  ].filter((d) => d.value > 0);

  // Top vehicles by distance
  const vehicleDistData = lorries.map((l) => {
    const distKm = routes
      .filter((r) => r.lorry_id === l.id)
      .reduce((s, r) => s + (r.total_distance_km || 0), 0);
    const loadCount = routes.filter((r) => r.lorry_id === l.id).length;
    return { name: l.lorry_code, model: l.model, distKm: Number(distKm.toFixed(1)), loadCount, status: l.status, maxWeight: l.max_weight_kg, maxVol: l.max_volume_m3, eco: l.fuel_efficiency_km_per_l };
  }).sort((a, b) => b.distKm - a.distKm);

  // Payload utilization
  const payloadData = lorries.map((l) => ({
    name: l.lorry_code,
    capacity: l.max_weight_kg,
    volume: Math.round(l.max_volume_m3 * 100),
  }));

  const statusColor: Record<string, string> = {
    AVAILABLE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    ON_ROUTE: 'text-blue-700 bg-blue-50 border-blue-200',
    LOADING: 'text-amber-700 bg-amber-50 border-amber-200',
    MAINTENANCE: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 sm:px-10 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-blue-300 uppercase">FleetMind AI · Fleet Intelligence</p>
            <h1 className="text-xl sm:text-2xl font-black text-white">Fleet Analytics & Utilization</h1>
          </div>
        </div>
      </div>

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* Summary KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Fleet', value: lorries.length, sub: 'Registered carriers', color: 'text-slate-900' },
            { label: 'Active (On Route)', value: statusCounts.ON_ROUTE, sub: `${lorries.length > 0 ? Math.round((statusCounts.ON_ROUTE / lorries.length) * 100) : 0}% utilization`, color: 'text-blue-700' },
            { label: 'Available', value: statusCounts.AVAILABLE, sub: 'Ready for dispatch', color: 'text-emerald-700' },
            { label: 'Maintenance', value: statusCounts.MAINTENANCE, sub: 'Temporarily offline', color: 'text-rose-700' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-1 hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{m.label}</p>
              <p className={`text-3xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-xs text-slate-500 font-medium">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fleet Status Pie */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Fleet Status Distribution</h3>
              <p className="text-xs text-slate-500">{lorries.length} registered carriers by operational status</p>
            </div>
            {statusPieData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={90} innerRadius={60} paddingAngle={3} dataKey="value">
                      {statusPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-300 text-xs flex-col gap-2"><Truck className="w-8 h-8" /><p>No fleet data</p></div>
            )}
          </div>

          {/* Payload Capacity Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Payload Capacity by Vehicle</h3>
              <p className="text-xs text-slate-500">Max weight capacity (kg) per registered carrier</p>
            </div>
            {payloadData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payloadData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}T`} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`${Number(v).toLocaleString()} kg`, 'Max Payload']} />
                    <Bar dataKey="capacity" fill="#2563EB" radius={[4, 4, 0, 0]} name="Max Payload (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-300 text-xs flex-col gap-2"><Scale className="w-8 h-8" /><p>No fleet data</p></div>
            )}
          </div>
        </div>

        {/* Vehicle Ranking Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Vehicle Performance Rankings</h3>
            <p className="text-xs text-slate-500">Sorted by distance covered — top active carriers</p>
          </div>
          {vehicleDistData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Rank', 'Vehicle', 'Model', 'Status', 'Distance Covered', 'Shipments', 'Max Payload', 'Max Volume', 'Mileage'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-black text-slate-400 uppercase pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehicleDistData.map(({ name, model, distKm, loadCount, status, maxWeight, maxVol, eco }, idx) => (
                    <tr key={name} className="hover:bg-slate-50/70">
                      <td className="py-3 pr-4">
                        <span className={`font-black text-sm ${idx === 0 ? 'text-amber-600' : idx === 1 ? 'text-slate-500' : 'text-slate-400'}`}>#{idx + 1}</span>
                      </td>
                      <td className="py-3 pr-4 font-black text-slate-900">{name}</td>
                      <td className="py-3 pr-4 text-slate-500">{model}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${statusColor[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>{status}</span>
                      </td>
                      <td className="py-3 pr-4 font-black text-indigo-700">{distKm} km</td>
                      <td className="py-3 pr-4 font-bold text-slate-700">{loadCount}</td>
                      <td className="py-3 pr-4 font-bold text-slate-700">{maxWeight.toLocaleString()} kg</td>
                      <td className="py-3 pr-4 font-bold text-slate-700">{maxVol} m³</td>
                      <td className="py-3 pr-4 font-black text-blue-700">{eco} km/L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold">No vehicles registered. Add carriers in Dispatcher Fleet portal.</p>
            </div>
          )}
        </div>

      </main>
    </>
  );
}
