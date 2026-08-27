'use client';

import React from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Truck, Gauge, Fuel, CheckCircle2 } from 'lucide-react';

export default function FleetAnalyticsPage() {
  const lorries = fleetMindStore.getLorries();

  return (
    <>
      <PortalHeader
        title="Fleet Capacity & Utilization Analytics"
        subtitle="Asset utilization rates, tare-to-gross payload density, maintenance downtime & positioning efficiency"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fleet Capacity</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {(lorries.reduce((s, l) => s + l.max_weight_kg, 0) / 1000).toFixed(1)} Tonnes
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Aggregate payload across 24 vehicles</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Payload Density</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">82.5%</div>
            <p className="text-xs text-slate-500 mt-0.5">Achieved via multi-stop consolidation</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Positioning Deadhead</span>
            <div className="text-2xl font-black text-blue-700 mt-1">4.2%</div>
            <p className="text-xs text-slate-500 mt-0.5">Unbilled positioning distance</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Vehicle Fleet Telemetry Breakdown
          </h3>

          <div className="space-y-3">
            {lorries.slice(0, 8).map((l) => (
              <div key={l.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{l.lorry_code} ({l.model})</span>
                  <p className="text-[11px] text-slate-500">{l.registration_number} • Depot: {l.current_address}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacity</span>
                    <strong className="text-slate-800">{l.max_weight_kg.toLocaleString()} kg</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel Economy</span>
                    <strong className="text-blue-700">{l.fuel_efficiency_km_per_l} km/L</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
