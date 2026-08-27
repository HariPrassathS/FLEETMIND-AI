'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Lorry, LorryStatus } from '../../../lib/optimization/types';
import { Truck, Plus, X, Fuel, Gauge, CheckCircle2, Trash2 } from 'lucide-react';

export default function AdminFleetPage() {
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    lorry_code: '',
    registration_number: '',
    model: 'Eicher Pro 2059 (6 Ton)',
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
      max_weight_kg: Number(form.max_weight_kg),
      max_volume_m3: Number(form.max_volume_m3),
      fuel_efficiency_km_per_l: Number(form.fuel_efficiency_km_per_l),
      current_address: form.current_address,
      status: 'AVAILABLE',
    });
    setIsAddModalOpen(false);
  };

  return (
    <>
      <PortalHeader
        title="Fleet Vehicle Registry"
        subtitle="Commercial vehicle specifications, tare weight limits, fuel efficiency baselines & maintenance logs"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fleet Units ({lorries.length})
            </h3>
            <p className="text-xs text-slate-500">Commercial vehicles registered for dispatch assignment</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2"
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
                  <th className="py-3.5 px-6">Code</th>
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
                    <td className="py-3.5 px-6 font-black text-slate-900">{l.lorry_code}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-700">{l.registration_number}</td>
                    <td className="py-3.5 px-6 text-slate-600">{l.model}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{l.max_weight_kg.toLocaleString()} kg</td>
                    <td className="py-3.5 px-6">{l.max_volume_m3} m³</td>
                    <td className="py-3.5 px-6 font-bold text-blue-700">{l.fuel_efficiency_km_per_l} km / L</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          l.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'ON_ROUTE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
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

        {/* Add Lorry Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-purple-600 p-5 text-white flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Register Vehicle
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLorry} className="p-6 space-y-4 text-xs">
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
