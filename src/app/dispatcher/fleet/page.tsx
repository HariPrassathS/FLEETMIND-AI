'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Lorry, LorryStatus, ReoptimizationDelta } from '../../../lib/optimization/types';
import { handleDisruption } from '../../../lib/optimization/reoptimizer';
import { Truck, Fuel, Gauge, Shield, AlertCircle, Wrench, CheckCircle2, Search, AlertTriangle, Sparkles, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DispatcherFleetPage() {
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBreakdownLorry, setSelectedBreakdownLorry] = useState<Lorry | null>(null);
  const [reoptDelta, setReoptDelta] = useState<ReoptimizationDelta | null>(null);
  const [isApplyingRecovery, setIsApplyingRecovery] = useState(false);

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setLorries(fleetMindStore.getLorries());
    });
    return unsub;
  }, []);

  const handleStatusChange = (lorryId: string, newStatus: LorryStatus) => {
    fleetMindStore.updateLorryStatus(lorryId, newStatus);
  };

  const handleTriggerBreakdown = (lorry: Lorry) => {
    setSelectedBreakdownLorry(lorry);
    const routes = fleetMindStore.getRoutes();
    const shipments = fleetMindStore.getShipments();
    const drivers = fleetMindStore.getDrivers();
    const settings = fleetMindStore.getSystemSettings();

    const delta = handleDisruption(
      {
        id: `event-${Date.now()}`,
        type: 'LORRY_BREAKDOWN',
        severity: 'CRITICAL',
        entity_id: lorry.id,
        title: `Vehicle Breakdown: ${lorry.lorry_code}`,
        description: `Mechanical failure reported on ${lorry.lorry_code}. Cargo requires dynamic re-dispatch.`,
        timestamp: new Date().toISOString(),
        affected_route_ids: [],
        affected_shipment_ids: [],
        status: 'PENDING_REOPTIMIZATION',
      },
      routes,
      shipments,
      lorries,
      drivers,
      settings
    );

    setReoptDelta(delta);
  };

  const handleApplyRecoveryPlan = () => {
    if (!reoptDelta || !selectedBreakdownLorry) return;
    setIsApplyingRecovery(true);

    const replacementAssignment = reoptDelta.new_assignments[0];
    const affectedShipmentIds = reoptDelta.disruption.affected_shipment_ids.length > 0
      ? reoptDelta.disruption.affected_shipment_ids
      : fleetMindStore.getShipments().filter((s) => s.assigned_lorry_id === selectedBreakdownLorry.id).map((s) => s.id);

    // Record formal cargo transfer
    if (replacementAssignment) {
      fleetMindStore.createCargoTransfer({
        breakdown_id: reoptDelta.disruption.id,
        old_lorry_id: selectedBreakdownLorry.id,
        new_lorry_id: replacementAssignment.lorry_id,
        driver_id: replacementAssignment.driver_id,
        shipment_ids: affectedShipmentIds,
        transfer_location_address: selectedBreakdownLorry.current_address || 'NH-48 Breakdown Corridor Bay',
        transfer_lat: selectedBreakdownLorry.current_lat,
        transfer_lng: selectedBreakdownLorry.current_lng,
      });
    }

    // Mark lorry as UNAVAILABLE in store
    fleetMindStore.updateLorryStatus(selectedBreakdownLorry.id, 'UNAVAILABLE');

    setTimeout(() => {
      setIsApplyingRecovery(false);
      setSelectedBreakdownLorry(null);
      setReoptDelta(null);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }, 400);
  };

  const filteredLorries = lorries.filter((l) => {
    const matchesSearch =
      l.lorry_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.assigned_driver_name && l.assigned_driver_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const health = fleetMindStore.getFleetHealthSummary();
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [editLorry, setEditLorry] = useState<Lorry | null>(null);

  const [newVehicleForm, setNewVehicleForm] = useState({
    lorry_code: `L-${lorries.length + 10}`,
    registration_number: 'TN-01-XX-9900',
    model: 'Tata 1109 LPT (6 Ton)',
    max_weight_kg: 6000,
    max_volume_m3: 24,
    fuel_efficiency_km_per_l: 7.2,
    status: 'AVAILABLE' as LorryStatus,
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createLorry({
      lorry_code: newVehicleForm.lorry_code,
      registration_number: newVehicleForm.registration_number,
      model: newVehicleForm.model,
      max_weight_kg: Number(newVehicleForm.max_weight_kg),
      max_volume_m3: Number(newVehicleForm.max_volume_m3),
      fuel_efficiency_km_per_l: Number(newVehicleForm.fuel_efficiency_km_per_l),
      status: newVehicleForm.status,
    });
    setIsAddVehicleModalOpen(false);
  };

  const handleUpdateVehicleCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLorry) return;
    const l = fleetMindStore.getLorryById(editLorry.id);
    if (l) {
      l.max_weight_kg = Number(editLorry.max_weight_kg);
      l.max_volume_m3 = Number(editLorry.max_volume_m3);
      l.fuel_efficiency_km_per_l = Number(editLorry.fuel_efficiency_km_per_l);
      l.model = editLorry.model;
      l.updated_at = new Date().toISOString();
    }
    setEditLorry(null);
  };

  return (
    <>
      <PortalHeader
        title="Fleet Vehicles & Capacity Management"
        subtitle="Manage commercial lorries, payload constraints, dynamic re-optimization, and active assignments"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Fleet KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Lorries</span>
            <div className="text-2xl font-black text-slate-900">{health.totalLorries}</div>
            <span className="text-[11px] font-semibold text-slate-500">Commercial carrier fleet</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Available for Dispatch</span>
            <div className="text-2xl font-black text-emerald-700">{health.availableLorries}</div>
            <span className="text-[11px] font-semibold text-emerald-600/80">Eligible for optimizer</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">On Route (In Transit)</span>
            <div className="text-2xl font-black text-blue-700">{health.onTripLorries}</div>
            <span className="text-[11px] font-semibold text-blue-600/80">Active corridor transit</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-600 block tracking-wider">Maintenance / Offline</span>
            <div className="text-2xl font-black text-rose-700">{health.maintenanceLorries}</div>
            <span className="text-[11px] font-semibold text-rose-600/80">Excluded from optimizer</span>
          </div>
        </div>

        {/* Action Header & Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, reg number, model, driver..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-bold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ON_ROUTE">ON ROUTE</option>
              <option value="LOADING">LOADING</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddVehicleModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center gap-2"
            >
              Add New Vehicle
            </button>
          </div>
        </div>

        {/* Fleet Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLorries.map((lorry) => {
            return (
              <div
                key={lorry.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-4 hover:shadow-card-hover transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shadow-sm">
                      {lorry.lorry_code}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{lorry.model}</h4>
                      <p className="text-xs text-slate-500 font-mono">{lorry.registration_number}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      lorry.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lorry.status === 'ON_ROUTE'
                        ? 'bg-blue-100 text-blue-800'
                        : lorry.status === 'LOADING'
                        ? 'bg-amber-100 text-amber-800'
                        : lorry.status === 'MAINTENANCE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {lorry.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payload Cap</span>
                    <p className="font-black text-slate-900">{lorry.max_weight_kg.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume Cap</span>
                    <p className="font-black text-slate-900">{lorry.max_volume_m3} m³</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fuel Efficiency</span>
                    <p className="font-black text-blue-600">{lorry.fuel_efficiency_km_per_l} km/L</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Driver</span>
                    <p className="font-bold text-slate-900 truncate">{lorry.assigned_driver_name || 'Reserve Pool'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTriggerBreakdown(lorry)}
                      className="px-2.5 py-1.5 text-[10px] font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1"
                      title="Simulate breakdown and trigger live re-optimization"
                    >
                      <Wrench className="w-3 h-3 text-rose-600" />
                      Breakdown
                    </button>
                    <button
                      onClick={() => setEditLorry({ ...lorry })}
                      className="px-2.5 py-1.5 text-[10px] font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Edit Cap
                    </button>
                  </div>

                  <select
                    value={lorry.status}
                    onChange={(e) => handleStatusChange(lorry.id, e.target.value as LorryStatus)}
                    className="text-[11px] font-bold px-2 py-1 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ON_ROUTE">ON ROUTE</option>
                    <option value="LOADING">LOADING</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add Vehicle */}
        {isAddVehicleModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Register Commercial Lorry</h3>
                <button onClick={() => setIsAddVehicleModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Lorry ID Code</label>
                    <input
                      type="text"
                      required
                      value={newVehicleForm.lorry_code}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, lorry_code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Registration No.</label>
                    <input
                      type="text"
                      required
                      value={newVehicleForm.registration_number}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, registration_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Model & Configuration</label>
                  <input
                    type="text"
                    required
                    value={newVehicleForm.model}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Payload (kg)</label>
                    <input
                      type="number"
                      required
                      value={newVehicleForm.max_weight_kg}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, max_weight_kg: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Volume (m³)</label>
                    <input
                      type="number"
                      required
                      value={newVehicleForm.max_volume_m3}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, max_volume_m3: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">km/L</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newVehicleForm.fuel_efficiency_km_per_l}
                      onChange={(e) => setNewVehicleForm({ ...newVehicleForm, fuel_efficiency_km_per_l: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-blue-600"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddVehicleModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
                  >
                    Register Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Capacity */}
        {editLorry && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Adjust Capacity: {editLorry.lorry_code}</h3>
                <button onClick={() => setEditLorry(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateVehicleCapacity} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Payload Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    value={editLorry.max_weight_kg}
                    onChange={(e) => setEditLorry({ ...editLorry, max_weight_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-black text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Optimizer will immediately honor this updated payload limit.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Volume Limit (m³)</label>
                  <input
                    type="number"
                    required
                    value={editLorry.max_volume_m3}
                    onChange={(e) => setEditLorry({ ...editLorry, max_volume_m3: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Fuel Efficiency Rating (km/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editLorry.fuel_efficiency_km_per_l}
                    onChange={(e) => setEditLorry({ ...editLorry, fuel_efficiency_km_per_l: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-blue-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditLorry(null)}
                    className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
                  >
                    Save Capacity Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dynamic Disruption Re-optimization Modal */}
        {reoptDelta && selectedBreakdownLorry && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Disruption Triggered: {selectedBreakdownLorry.lorry_code} Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">FleetMind dynamic re-optimization engine executed</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedBreakdownLorry(null); setReoptDelta(null); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* OLD PLAN vs NEW PLAN side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Original Dispatch Plan</span>
                  <div className="space-y-1 text-slate-700">
                    <p><span className="font-bold text-slate-900">Total Cost:</span> ₹{reoptDelta.original_plan.cost_inr.toLocaleString('en-IN')}</p>
                    <p><span className="font-bold text-slate-900">Fuel Consumed:</span> {reoptDelta.original_plan.fuel_liters} L</p>
                    <p><span className="font-bold text-slate-900">Distance:</span> {reoptDelta.original_plan.distance_km} km</p>
                    <p><span className="font-bold text-slate-900">Routes Active:</span> {reoptDelta.original_plan.routes_count} routes</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-700 block tracking-wider">Dynamic Recovery Plan</span>
                  <div className="space-y-1 text-slate-700">
                    <p><span className="font-bold text-emerald-800">New Cost:</span> ₹{reoptDelta.new_plan.cost_inr.toLocaleString('en-IN')}</p>
                    <p><span className="font-bold text-emerald-800">New Fuel:</span> {reoptDelta.new_plan.fuel_liters} L</p>
                    <p><span className="font-bold text-emerald-800">New Distance:</span> {reoptDelta.new_plan.distance_km} km</p>
                    <p><span className="font-bold text-emerald-800">Reassigned Routes:</span> {reoptDelta.new_plan.routes_count} routes</p>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block">Recommended Dispatch Actions:</span>
                <ul className="space-y-1 text-blue-950 font-medium">
                  {reoptDelta.recommended_actions.map((act, aidx) => (
                    <li key={aidx} className="flex items-start gap-1.5">
                      <span className="text-blue-600">●</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => { setSelectedBreakdownLorry(null); setReoptDelta(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyRecoveryPlan}
                  disabled={isApplyingRecovery}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isApplyingRecovery ? 'Applying Recovery Plan...' : 'Apply Recovery Dispatch Plan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
