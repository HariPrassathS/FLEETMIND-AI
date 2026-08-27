'use client';

import React from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Award, User, Truck, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ManagerPerformancePage() {
  const drivers = fleetMindStore.getDrivers();
  const sortedDrivers = [...drivers].sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));

  return (
    <>
      <PortalHeader
        title="Driver & Vehicle Performance Rankings"
        subtitle="Driver safety scores, on-time completion rates, delivery volume, and efficiency indices"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fleet Pilot Leaderboard
            </h3>
            <p className="text-xs text-slate-500">Evaluated on SLA compliance, safety, and fuel efficiency</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-6">Rank</th>
                  <th className="py-3.5 px-6">Driver Name</th>
                  <th className="py-3.5 px-6">License & Contact</th>
                  <th className="py-3.5 px-6">Assigned Vehicle</th>
                  <th className="py-3.5 px-6">Lifetime Deliveries</th>
                  <th className="py-3.5 px-6 text-emerald-700">Efficiency Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sortedDrivers.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-6 font-black text-slate-900">#{idx + 1}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      {d.name}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{d.license_number} • {d.phone}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">{d.assigned_lorry_id ? 'Assigned' : 'Standby Pool'}</td>
                    <td className="py-3.5 px-6">{d.total_deliveries || 250} trips</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                        {d.performance_score || 92} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
