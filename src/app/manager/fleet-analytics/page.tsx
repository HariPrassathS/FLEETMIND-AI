'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Truck, Gauge, Fuel, CheckCircle2, Inbox } from 'lucide-react';
import { TruckCapacityVisual } from '../../../components/brand/truck-capacity-visual';

export default function FleetAnalyticsPage() {
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());

  useEffect(() => {
    const update = () => setLorries(fleetMindStore.getLorries());
    update();
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const totalCapacityTonnes = (lorries.reduce((s, l) => s + (l.max_weight_kg || 0), 0) / 1000).toFixed(1);
  const onRouteCount = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const utilizationRate = lorries.length > 0 ? Number(((onRouteCount / lorries.length) * 100).toFixed(1)) : 0;
  const avgEfficiency =
    lorries.length > 0
      ? (lorries.reduce((s, l) => s + (l.fuel_efficiency_km_per_l || 0), 0) / lorries.length).toFixed(1)
      : '0.0';

  return (
    <>
      <PortalHeader
        title="Fleet Capacity & Utilization Analytics"
        subtitle="Asset utilization rates, payload capacity, maintenance downtime & positioning efficiency"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fleet Capacity</span>
            <div className="text-2xl font-black text-slate-900">{totalCapacityTonnes} Tonnes</div>
            <p className="text-xs text-slate-500 font-medium">Aggregate payload across {lorries.length} registered vehicles</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fleet Active Utilization</span>
            <div className="text-2xl font-black text-emerald-700">{utilizationRate}%</div>
            <p className="text-xs text-slate-500 font-medium">{onRouteCount} vehicles actively on route</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Mileage Rating</span>
            <div className="text-2xl font-black text-blue-700">{avgEfficiency} km / L</div>
            <p className="text-xs text-slate-500 font-medium">Fleet-wide fuel consumption average</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Vehicle Fleet Telemetry Breakdown
          </h3>

          {lorries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lorries.map((l) => (
                <div key={l.id} className="p-4 rounded-3xl border border-slate-200 bg-white shadow-card space-y-3 hover:shadow-card-hover transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-slate-900 text-sm block">{l.lorry_code} ({l.model})</span>
                      <p className="text-[11px] text-slate-500 font-mono">{l.registration_number}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      l.status === 'ON_ROUTE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {l.status}
                    </span>
                  </div>

                  {/* Dynamic Realistic Truck SVG Visual */}
                  <TruckCapacityVisual lorry={l} mode="detailed" showMetrics={true} />

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-bold">
                    <span>Efficiency: <strong className="text-blue-600">{l.fuel_efficiency_km_per_l} km/L</strong></span>
                    <span className="truncate max-w-[140px] text-slate-400 font-medium">Depot: {l.current_address || 'Chennai Hub'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-2 bg-slate-50/50">
              <Inbox className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-slate-600">No Vehicles Registered</p>
              <p className="max-w-xs text-[11px] text-slate-400">
                Register commercial carriers in Dispatcher Fleet portal to monitor live utilization.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
