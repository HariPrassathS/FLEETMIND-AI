'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Award, User, Truck, CheckCircle2, TrendingUp, Inbox } from 'lucide-react';

export default function ManagerPerformancePage() {
  const [drivers, setDrivers] = useState(fleetMindStore.getDrivers());

  useEffect(() => {
    const update = () => setDrivers(fleetMindStore.getDrivers());
    update();
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const sortedDrivers = [...drivers].sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));

  return (
    <>
      <PortalHeader
        title="Driver & Vehicle Performance Rankings"
        subtitle="Driver safety scores, on-time completion rates, delivery volume, and efficiency indices"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fleet Pilot Leaderboard
            </h3>
            <p className="text-xs text-slate-500">Evaluated on SLA compliance, safety, and fuel efficiency</p>
          </div>

          {sortedDrivers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Driver Name</th>
                    <th className="py-3.5 px-6">License & Contact</th>
                    <th className="py-3.5 px-6">Assigned Vehicle</th>
                    <th className="py-3.5 px-6">Total Deliveries</th>
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
                      <td className="py-3.5 px-6">{d.total_deliveries || 0} trips</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                          {d.performance_score || 90} / 100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-slate-600">No Drivers Registered</p>
              <p className="max-w-xs text-[11px] text-slate-400">
                Onboard commercial pilots in the Dispatcher Drivers portal to generate performance leaderboard rankings.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
