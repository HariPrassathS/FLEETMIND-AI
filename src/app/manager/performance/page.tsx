'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Award, Users, Clock, CheckCircle2, TrendingUp, Inbox, Star } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function ManagerPerformancePage() {
  const [drivers, setDrivers] = useState(fleetMindStore.getDrivers());
  const [routes, setRoutes] = useState(fleetMindStore.getRoutes());
  const [shipments, setShipments] = useState(fleetMindStore.getShipments());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());

  useEffect(() => {
    const update = () => {
      setDrivers(fleetMindStore.getDrivers());
      setRoutes(fleetMindStore.getRoutes());
      setShipments(fleetMindStore.getShipments());
      setLorries(fleetMindStore.getLorries());
    };
    update();
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const totalDelivered = shipments.filter((s) => s.status === 'DELIVERED').length;
  const totalShipments = shipments.length;
  const slaRate = totalShipments > 0 ? Number(((totalDelivered / totalShipments) * 100).toFixed(1)) : 0;
  const avgRouteDistKm = routes.length > 0
    ? Number((routes.reduce((s, r) => s + (r.total_distance_km || 0), 0) / routes.length).toFixed(1))
    : 0;
  const avgRouteDurationH = routes.length > 0
    ? Number((routes.reduce((s, r) => s + ((r.estimated_duration_minutes || 0) / 60), 0) / routes.length).toFixed(1))
    : 0;

  // Driver performance rows
  const driverRows = drivers.map((d) => {
    const driverRoutes = routes.filter((r) => r.driver_id === d.id);
    const tripsCompleted = driverRoutes.filter((r) => r.status === 'COMPLETED').length;
    const totalDist = driverRoutes.reduce((s, r) => s + (r.total_distance_km || 0), 0);
    const avgSpeed = driverRoutes.length > 0
      ? (driverRoutes.reduce((s, r) => (r.total_distance_km && r.estimated_duration_minutes ? s + r.total_distance_km / (r.estimated_duration_minutes / 60) : s), 0) / driverRoutes.length).toFixed(1)
      : '—';
    const onTimeCount = driverRoutes.filter((r) => r.status === 'COMPLETED').length;
    const onTimePct = driverRoutes.length > 0 ? Math.round((onTimeCount / driverRoutes.length) * 100) : 0;
    const perfScore = Math.min(100, Math.round((tripsCompleted * 10) + (onTimePct * 0.5)));
    return { d, tripsCompleted, totalDist: Number(totalDist.toFixed(1)), avgSpeed, onTimePct, perfScore, routeCount: driverRoutes.length };
  }).sort((a, b) => b.perfScore - a.perfScore);

  const chartData = driverRows.slice(0, 10).map((r) => ({
    name: r.d.name.split(' ')[0],
    trips: r.tripsCompleted,
    score: r.perfScore,
  }));

  // Route efficiency rankings
  const routeRows = [...routes]
    .map((r) => ({
      r,
      efficiency: r.total_distance_km && r.estimated_duration_minutes
        ? Number((r.total_distance_km / (r.estimated_duration_minutes / 60)).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 8);

  const perfColor = (score: number) => {
    if (score >= 70) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 sm:px-10 py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase">FleetMind AI · Performance Intelligence</p>
            <h1 className="text-xl sm:text-2xl font-black text-white">Driver & Route Performance</h1>
          </div>
        </div>
      </div>

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* Hero KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Drivers', value: drivers.length, sub: 'In registry', color: 'text-slate-900' },
            { label: 'SLA Compliance', value: `${slaRate}%`, sub: `${totalDelivered} delivered`, color: 'text-emerald-700' },
            { label: 'Avg Route Distance', value: `${avgRouteDistKm} km`, sub: `Over ${routes.length} routes`, color: 'text-blue-700' },
            { label: 'Avg Route Duration', value: `${avgRouteDurationH} h`, sub: 'Estimated drive time', color: 'text-indigo-700' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-1 hover:-translate-y-0.5 transition-all">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{m.label}</p>
              <p className={`text-3xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-xs text-slate-500 font-medium">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Driver Perf Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Driver Performance Scores</h3>
            <p className="text-xs text-slate-500">Top 10 drivers ranked by trips completed and on-time rate</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} name="Performance Score" />
                  <Bar dataKey="trips" fill="#DBEAFE" radius={[4, 4, 0, 0]} name="Trips Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-300 text-xs flex-col gap-2"><Users className="w-8 h-8" /><p>No driver data yet</p></div>
          )}
        </div>

        {/* Driver Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Driver Performance Leaderboard</h3>
            <p className="text-xs text-slate-500">Ranked by performance score (trips × on-time rate)</p>
          </div>
          {driverRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Rank', 'Driver', 'Phone', 'Routes', 'Trips Done', 'Total Distance', 'Avg Speed', 'On-Time %', 'Score'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-black text-slate-400 uppercase pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {driverRows.map(({ d, tripsCompleted, totalDist, avgSpeed, onTimePct, perfScore, routeCount }, idx) => (
                    <tr key={d.id} className="hover:bg-slate-50/70">
                      <td className="py-3 pr-4">
                        <span className={`font-black text-sm flex items-center gap-1 ${idx === 0 ? 'text-amber-600' : idx === 1 ? 'text-slate-500' : 'text-slate-400'}`}>
                          {idx === 0 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />} #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-black text-slate-900">{d.name}</td>
                      <td className="py-3 pr-4 text-slate-500 font-mono">{d.phone}</td>
                      <td className="py-3 pr-4 text-slate-700 font-bold">{routeCount}</td>
                      <td className="py-3 pr-4 font-black text-indigo-700">{tripsCompleted}</td>
                      <td className="py-3 pr-4 font-bold text-blue-700">{totalDist} km</td>
                      <td className="py-3 pr-4 font-bold text-slate-700">{avgSpeed} km/h</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${onTimePct}%` }} />
                          </div>
                          <span className="font-black text-emerald-700">{onTimePct}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${perfColor(perfScore)}`}>{perfScore}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold">No drivers found. Add drivers in the Fleet Management portal.</p>
            </div>
          )}
        </div>

        {/* Route Efficiency */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Top Route Efficiency Rankings</h3>
            <p className="text-xs text-slate-500">Sorted by km/h — best throughput routes first</p>
          </div>
          {routeRows.length > 0 ? (
            <div className="space-y-2">
              {routeRows.map(({ r, efficiency }, idx) => (
                <div key={r.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl text-xs hover:bg-slate-100/70 transition">
                  <span className="font-black text-slate-400 w-6">#{idx + 1}</span>
                  <div className="flex-1">
                    <p className="font-black text-slate-900">{r.route_code || r.id.slice(0, 10)}</p>
                    <p className="text-slate-500">{r.total_distance_km?.toFixed(1)} km · {r.estimated_duration_minutes ? (r.estimated_duration_minutes / 60).toFixed(1) : '—'} h</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-700">{efficiency} km/h</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">No route data available yet.</div>
          )}
        </div>

      </main>
    </>
  );
}
