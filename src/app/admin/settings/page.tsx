'use client';

import React, { useState } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Settings, CheckCircle2, DollarSign, Fuel, Truck } from 'lucide-react';

export default function AdminSettingsPage() {
  const currentSettings = fleetMindStore.getSystemSettings();
  const [form, setForm] = useState({
    fuel_price_per_liter: currentSettings.fuel_price_per_liter,
    driver_base_rate_per_km: currentSettings.driver_base_rate_per_km,
    fixed_dispatch_cost_per_lorry: currentSettings.fixed_dispatch_cost_per_lorry,
    average_speed_km_per_h: currentSettings.average_speed_km_per_h,
    loading_time_minutes: currentSettings.loading_time_minutes,
    service_time_per_stop_mins: currentSettings.service_time_per_stop_mins,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.updateSystemSettings({
      fuel_price_per_liter: Number(form.fuel_price_per_liter),
      driver_base_rate_per_km: Number(form.driver_base_rate_per_km),
      fixed_dispatch_cost_per_lorry: Number(form.fixed_dispatch_cost_per_lorry),
      average_speed_km_per_h: Number(form.average_speed_km_per_h),
      loading_time_minutes: Number(form.loading_time_minutes),
      service_time_per_stop_mins: Number(form.service_time_per_stop_mins),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <PortalHeader
        title="System Operational Settings"
        subtitle="Configure commercial fuel price benchmarks, driver compensation rates & transit formulas"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {saved && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Operational settings saved and applied to the TypeScript Optimization Engine!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Financial Tariffs & Rates
            </h3>
            <p className="text-xs text-slate-500">Variables feed directly into dynamic trip costing calculations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Diesel Price (₹ / Liter)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.fuel_price_per_liter}
                onChange={(e) => setForm({ ...form, fuel_price_per_liter: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Driver Base Rate (₹ / km)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.driver_base_rate_per_km}
                onChange={(e) => setForm({ ...form, driver_base_rate_per_km: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Fixed Dispatch Overhead (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.fixed_dispatch_cost_per_lorry}
                onChange={(e) => setForm({ ...form, fixed_dispatch_cost_per_lorry: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="border-b border-slate-100 pb-3 pt-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Transit & Service Time Assumptions
            </h3>
            <p className="text-xs text-slate-500">Parameters used by ETA calculation and deadline feasibility models</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Average Speed (km / h)
              </label>
              <input
                type="number"
                required
                value={form.average_speed_km_per_h}
                onChange={(e) => setForm({ ...form, average_speed_km_per_h: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Loading Buffer (Mins)
              </label>
              <input
                type="number"
                required
                value={form.loading_time_minutes}
                onChange={(e) => setForm({ ...form, loading_time_minutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1.5">
                Service Time Per Stop (Mins)
              </label>
              <input
                type="number"
                required
                value={form.service_time_per_stop_mins}
                onChange={(e) => setForm({ ...form, service_time_per_stop_mins: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Save Operational Parameters
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
