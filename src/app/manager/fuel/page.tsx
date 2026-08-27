'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Fuel, Gauge, TrendingDown, CheckCircle2, Inbox } from 'lucide-react';

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
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const avgEconomy =
    lorries.length > 0
      ? (lorries.reduce((s, l) => s + (l.fuel_efficiency_km_per_l || 0), 0) / lorries.length).toFixed(1)
      : '0.0';

  const totalFuelLiters = routes.reduce((s, r) => s + (r.fuel_consumption_liters || 0), 0);
  const carbonOffsetKg = (totalFuelLiters * 2.68).toFixed(1); // 2.68 kg CO2 per liter of diesel

  return (
    <>
      <PortalHeader
        title="Diesel Fuel Consumption & Benchmarks"
        subtitle="Diesel burn telemetry, vehicle class benchmarks, carbon emissions & eco-routing efficiency"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Commercial Diesel Price</span>
            <div className="text-2xl font-black text-blue-700">₹{settings.fuel_price_per_liter} / L</div>
            <p className="text-xs text-slate-500 font-medium">Authoritative system rate</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Fleet Economy</span>
            <div className="text-2xl font-black text-emerald-700">{avgEconomy} km / L</div>
            <p className="text-xs text-slate-500 font-medium">Across {lorries.length} registered carriers</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Carbon Emissions</span>
            <div className="text-2xl font-black text-indigo-700">{carbonOffsetKg} kg CO₂e</div>
            <p className="text-xs text-slate-500 font-medium">Based on {totalFuelLiters.toFixed(1)} L active diesel burn</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Vehicle Efficiency Rankings
          </h3>

          {lorries.length > 0 ? (
            <div className="space-y-2">
              {lorries.map((l) => (
                <div key={l.id} className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100/70 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">{l.lorry_code} ({l.model})</span>
                      <p className="text-[10px] text-slate-500">{l.registration_number}</p>
                    </div>
                  </div>
                  <span className="font-black text-blue-700 text-sm">{l.fuel_efficiency_km_per_l} km / L</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-slate-600">No Vehicles to Benchmark</p>
              <p className="max-w-xs text-[11px] text-slate-400">
                Add vehicles in the Dispatcher Fleet portal to view live fuel rankings.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
