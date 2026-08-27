'use client';

import React from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Fuel, Gauge, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function ManagerFuelPage() {
  const lorries = fleetMindStore.getLorries();
  const settings = fleetMindStore.getSystemSettings();

  return (
    <>
      <PortalHeader
        title="Diesel Fuel Consumption & Benchmarks"
        subtitle="Diesel burn telemetry, vehicle class benchmarks, carbon offset & eco-routing efficiency"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Commercial Diesel Price</span>
            <div className="text-2xl font-black text-blue-700 mt-1">₹{settings.fuel_price_per_liter} / L</div>
            <p className="text-xs text-slate-500 mt-0.5">Authoritative system rate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Fleet Economy</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {(lorries.reduce((s, l) => s + l.fuel_efficiency_km_per_l, 0) / lorries.length).toFixed(1)} km / L
            </div>
            <p className="text-xs text-slate-500 mt-0.5">+2.4 km/L vs national commercial average</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Carbon Offset via Optimization</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">1,420 kg CO₂e</div>
            <p className="text-xs text-slate-500 mt-0.5">Saved by eliminating empty return deadhead</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Vehicle Efficiency Rankings
          </h3>

          <div className="space-y-2">
            {lorries.map((l) => (
              <div key={l.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{l.lorry_code} ({l.model})</span>
                <span className="font-bold text-blue-600">{l.fuel_efficiency_km_per_l} km / L</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
