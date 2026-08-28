'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Lorry, LorryStatus } from '../../../lib/optimization/types';
import { Truck, Plus, X, Fuel, Gauge, CheckCircle2, Trash2, Camera } from 'lucide-react';
import { VehicleAvatar, VEHICLE_PRESET_IMAGES } from '../../../components/brand/vehicle-avatar';

export default function AdminFleetPage() {
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    lorry_code: '',
    registration_number: '',
    model: 'Eicher Pro 2059 (6 Ton)',
    image_url: VEHICLE_PRESET_IMAGES[0].url,
    max_weight_kg: 6000,
    max_volume_m3: 24,
    fuel_efficiency_km_per_l: 9.5,
    current_address: 'Chennai Central Logistics Park',
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setLorries(fleetMindStore.getLorries());
    });
    return unsub;
  }, []);

  const handleCreateLorry = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createLorry({
      lorry_code: form.lorry_code,
      registration_number: form.registration_number,
      model: form.model,
      image_url: form.image_url || undefined,
      max_weight_kg: Number(form.max_weight_kg),
      max_volume_m3: Number(form.max_volume_m3),
      fuel_efficiency_km_per_l: Number(form.fuel_efficiency_km_per_l),
      current_address: form.current_address,
      status: 'AVAILABLE',
    });
    setIsAddModalOpen(false);
  };

  const availableCount = lorries.filter((l) => l.status === 'AVAILABLE').length;
  const onRouteCount = lorries.filter((l) => l.status === 'ON_ROUTE').length;
  const maintenanceCount = lorries.filter((l) => l.status === 'MAINTENANCE').length;
  const avgEco = lorries.length > 0 ? (lorries.reduce((s, l) => s + l.fuel_efficiency_km_per_l, 0) / lorries.length).toFixed(1) : '0';

  return (
    <>
      <PortalHeader
        title="Fleet Vehicle Registry"
        subtitle="Commercial vehicle specifications, tare weight limits, fuel efficiency baselines & maintenance logs"
        category="FleetMind AI · Fleet Administration"
        icon={<Truck className="w-5 h-5" />}
        accent="blue"
        rightElement={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register New Vehicle
          </button>
        }
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Fleet KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Fleet', value: lorries.length, sub: 'Registered carriers', color: 'text-slate-900', bg: 'bg-white' },
            { label: 'Available', value: availableCount, sub: 'Ready for dispatch', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'On Route', value: onRouteCount, sub: 'Currently dispatched', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Avg Fuel Economy', value: `${avgEco} km/L`, sub: 'Fleet average mileage', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          ].map((m) => (
            <div key={m.label} className={`${m.bg} rounded-3xl border border-slate-200 shadow-sm p-5 space-y-1 hover:-translate-y-0.5 transition-all`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{m.label}</p>
              <p className={`text-3xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-xs text-slate-500 font-medium">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Fleet Units ({lorries.length})
            </h3>
            <p className="text-xs text-slate-500">Commercial vehicles registered for dispatch assignment</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register New Vehicle
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-6">Vehicle Unit</th>
                  <th className="py-3.5 px-6">Registration</th>
                  <th className="py-3.5 px-6">Model & Make</th>
                  <th className="py-3.5 px-6">Max Payload</th>
                  <th className="py-3.5 px-6">Max Volume</th>
                  <th className="py-3.5 px-6">Fuel Economy</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {lorries.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <VehicleAvatar
                          src={l.image_url}
                          lorryCode={l.lorry_code}
                          model={l.model}
                          size="sm"
                        />
                        <span className="font-black text-slate-900 text-sm">{l.lorry_code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-700 font-mono">{l.registration_number}</td>
                    <td className="py-3.5 px-6 text-slate-600">{l.model}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{l.max_weight_kg.toLocaleString()} kg</td>
                    <td className="py-3.5 px-6">{l.max_volume_m3} m³</td>
                    <td className="py-3.5 px-6 font-bold text-blue-700">{l.fuel_efficiency_km_per_l} km / L</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                          l.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : l.status === 'ON_ROUTE'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : l.status === 'LOADING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete vehicle ${l.lorry_code} (${l.registration_number})?`)) {
                            fleetMindStore.deleteLorry(l.id);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Register Vehicle Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in my-auto">
              <div className="bg-purple-600 p-5 text-white flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Register Vehicle & Set DP
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLorry} className="p-6 space-y-4 text-xs">
                {/* Vehicle DP Section */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 uppercase text-[10px] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      Vehicle Profile DP / Photo
                    </span>
                    <span className="text-[10px] text-slate-400">Presets Available</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <VehicleAvatar
                      src={form.image_url}
                      lorryCode={form.lorry_code || 'L-XX'}
                      model={form.model}
                      size="lg"
                    />

                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        placeholder="Paste vehicle image URL..."
                        value={form.image_url || ''}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                      <div className="flex flex-wrap gap-1">
                        {VEHICLE_PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setForm({ ...form, image_url: preset.url })}
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border transition ${
                              form.image_url === preset.url
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {preset.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Lorry Code</label>
                    <input
                      type="text"
                      required
                      value={form.lorry_code}
                      onChange={(e) => setForm({ ...form, lorry_code: e.target.value })}
                      placeholder="e.g. L-28"
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Registration #</label>
                    <input
                      type="text"
                      required
                      value={form.registration_number}
                      onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                      placeholder="TN-01-XY-9999"
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Model & Chassis</label>
                  <input
                    type="text"
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Max Weight (kg)</label>
                    <input
                      type="number"
                      required
                      value={form.max_weight_kg}
                      onChange={(e) => setForm({ ...form, max_weight_kg: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Volume (m³)</label>
                    <input
                      type="number"
                      required
                      value={form.max_volume_m3}
                      onChange={(e) => setForm({ ...form, max_volume_m3: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Economy (km/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={form.fuel_efficiency_km_per_l}
                      onChange={(e) => setForm({ ...form, fuel_efficiency_km_per_l: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm"
                  >
                    Register Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
