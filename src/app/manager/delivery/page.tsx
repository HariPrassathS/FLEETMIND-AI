'use client';

import React from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ManagerDeliveryPage() {
  const shipments = fleetMindStore.getShipments();

  return (
    <>
      <PortalHeader
        title="Delivery Performance & SLA Analytics"
        subtitle="On-time delivery benchmarks, delay root-cause analysis, turnaround duration & client satisfaction"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">On-Time SLA Delivery</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">98.2%</div>
            <p className="text-xs text-slate-500 mt-0.5">82 of 84 consignments on schedule</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Turnaround Time</span>
            <div className="text-2xl font-black text-blue-700 mt-1">5.4 Hours</div>
            <p className="text-xs text-slate-500 mt-0.5">From hub pickup to recipient sign-off</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Delay Buffer</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">+48 Mins</div>
            <p className="text-xs text-slate-500 mt-0.5">Safety margin built into dynamic ETAs</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Recent Consignment SLA Status
          </h3>

          <div className="space-y-2 text-xs">
            {shipments.slice(0, 8).map((s) => (
              <div key={s.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{s.shipment_code}</span>
                  <p className="text-[11px] text-slate-500">{s.pickup_city} → {s.destination_city} • {s.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  ON TIME
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
