'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { FuelRecord } from '../../../lib/optimization/types';
import {
  Fuel,
  TrendingUp,
  IndianRupee,
  Gauge,
  Plus,
  Truck,
  User,
  Calendar,
  X,
  Search,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

export default function DispatcherFuelPage() {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>(fleetMindStore.getFuelRecords());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLorry, setSelectedLorry] = useState<string>('ALL');

  const [form, setForm] = useState({
    lorry_id: 'lorry-01',
    fuel_quantity_liters: 65.0,
    fuel_price_per_liter: 96.5,
    odometer_km: 69200,
    distance_km: 330,
    fuel_station: 'Indian Oil Highway Hub, Sriperumbudur',
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setFuelRecords(fleetMindStore.getFuelRecords());
    });
    return unsub;
  }, []);

  const lorries = fleetMindStore.getLorries();
  const summary = fleetMindStore.getFuelSummary();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createFuelRecord({
      lorry_id: form.lorry_id,
      fuel_quantity_liters: Number(form.fuel_quantity_liters),
      fuel_price_per_liter: Number(form.fuel_price_per_liter),
      odometer_km: Number(form.odometer_km),
      distance_km: Number(form.distance_km),
      fuel_station: form.fuel_station,
      date: new Date(form.date).toISOString(),
    });
    setIsAddModalOpen(false);
  };

  const filteredRecords = fuelRecords.filter((r) => {
    if (selectedLorry === 'ALL') return true;
    return r.lorry_id === selectedLorry || r.lorry_code === selectedLorry;
  });

  return (
    <>
      <PortalHeader
        title="Fleet Fuel Telemetry & Consumption Hub"
        subtitle="Track diesel logging, efficiency metrics (km/L), station receipts, and corridor fuel expenses"
        category="FleetMind AI · Fuel Telemetry"
        icon={<Fuel className="w-5 h-5" />}
        accent="amber"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Fuel KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Fuel Ingested</span>
            <div className="text-2xl font-black text-slate-900">{summary.totalLiters.toLocaleString()} L</div>
            <span className="text-[11px] font-semibold text-slate-500">Across commercial fleet</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Average Fleet Efficiency</span>
            <div className="text-2xl font-black text-emerald-700">{summary.avgEfficiencyKmPerL} km/L</div>
            <span className="text-[11px] font-semibold text-emerald-600/80">Tata & Ashok Leyland heavy fleet</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 block tracking-wider">Total Fuel Spend</span>
            <div className="text-2xl font-black text-slate-900">₹{summary.totalCostInr.toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-slate-500">@ ₹96.50/L state baseline</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">Effective Cost Per KM</span>
            <div className="text-2xl font-black text-blue-700">₹{summary.avgCostPerKm} / km</div>
            <span className="text-[11px] font-semibold text-blue-600/80">Direct diesel operational rate</span>
          </div>
        </div>

        {/* Action Header & Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedLorry}
              onChange={(e) => setSelectedLorry(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Lorries</option>
              {lorries.map((l) => (
                <option key={l.id} value={l.id}>{l.lorry_code} ({l.registration_number})</option>
              ))}
            </select>

            <span className="text-xs text-slate-500 font-semibold">
              Showing {filteredRecords.length} Fuel Logs
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Fuel Log
          </button>
        </div>

        {/* Fuel Logs Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Vehicle & Driver</th>
                  <th className="py-3.5 px-4">Quantity & Rate</th>
                  <th className="py-3.5 px-4">Total Cost</th>
                  <th className="py-3.5 px-4">Odometer & Distance</th>
                  <th className="py-3.5 px-4">Efficiency</th>
                  <th className="py-3.5 px-4">Station / Hub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">
                            {new Date(f.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(f.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            {f.lorry_code}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {f.driver_name || 'Assigned Driver'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">{f.fuel_quantity_liters} Liters</span>
                          <span className="text-[10px] text-slate-400 block">@ ₹{f.fuel_price_per_liter}/L</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-slate-900 text-sm">
                          ₹{f.total_cost_inr.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-slate-900">{f.odometer_km.toLocaleString()} km</span>
                          <span className="text-[10px] text-slate-400 block">+{f.distance_km} km trip</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          f.efficiency_km_per_l >= 5.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <Gauge className="w-3 h-3" />
                          {f.efficiency_km_per_l} km/L
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {f.fuel_station || 'Highway Petroleum Hub'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Fuel className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">No Fuel Logs Recorded</p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                            Diesel purchase logs, fuel efficiency metrics, and station invoices will appear here.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          + Log Fuel Purchase
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Fuel Log */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Ingest Fuel Top-Up Log</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Target Vehicle</label>
                    <select
                      value={form.lorry_id}
                      onChange={(e) => setForm({ ...form, lorry_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {lorries.map((l) => (
                        <option key={l.id} value={l.id}>{l.lorry_code} ({l.registration_number})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Fuel Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Quantity (Liters)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={form.fuel_quantity_liters}
                      onChange={(e) => setForm({ ...form, fuel_quantity_liters: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Price Per Liter (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.fuel_price_per_liter}
                      onChange={(e) => setForm({ ...form, fuel_price_per_liter: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Current Odometer (km)</label>
                    <input
                      type="number"
                      required
                      value={form.odometer_km}
                      onChange={(e) => setForm({ ...form, odometer_km: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Distance Driven (km)</label>
                    <input
                      type="number"
                      required
                      value={form.distance_km}
                      onChange={(e) => setForm({ ...form, distance_km: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Fuel Station & Location</label>
                  <input
                    type="text"
                    required
                    value={form.fuel_station}
                    onChange={(e) => setForm({ ...form, fuel_station: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 font-bold">Estimated Cost:</span>{' '}
                    <strong className="text-slate-900">
                      ₹{Math.round(form.fuel_quantity_liters * form.fuel_price_per_liter).toLocaleString()}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
                    >
                      Save Fuel Record
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
