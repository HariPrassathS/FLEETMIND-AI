'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '../../../lib/optimization/types';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Truck,
  IndianRupee,
  Calendar,
  X,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export default function DispatcherMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>(fleetMindStore.getMaintenanceRecords());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [form, setForm] = useState({
    lorry_id: 'lorry-01',
    service_type: 'REGULAR_SERVICE' as MaintenanceType,
    last_service_date: new Date().toISOString().slice(0, 10),
    next_service_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    odometer_km: 70000,
    maintenance_cost_inr: 8500,
    vendor_workshop: 'Tata Commercial Service Hub, Ambattur',
    status: 'SCHEDULED' as MaintenanceStatus,
    notes: 'Quarterly mechanical inspection & pneumatic brake check.',
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setRecords(fleetMindStore.getMaintenanceRecords());
    });
    return unsub;
  }, []);

  const lorries = fleetMindStore.getLorries();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createMaintenanceRecord({
      lorry_id: form.lorry_id,
      service_type: form.service_type,
      last_service_date: new Date(form.last_service_date).toISOString(),
      next_service_date: new Date(form.next_service_date).toISOString(),
      odometer_km: Number(form.odometer_km),
      maintenance_cost_inr: Number(form.maintenance_cost_inr),
      vendor_workshop: form.vendor_workshop,
      status: form.status,
      notes: form.notes,
    });
    setIsAddModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: MaintenanceStatus) => {
    fleetMindStore.updateMaintenanceStatus(id, newStatus);
  };

  const overdueCount = records.filter((r) => r.status === 'OVERDUE').length;
  const inProgressCount = records.filter((r) => r.status === 'IN_PROGRESS').length;
  const scheduledCount = records.filter((r) => r.status === 'SCHEDULED').length;
  const totalCost = records.reduce((sum, r) => sum + r.maintenance_cost_inr, 0);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.lorry_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendor_workshop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.service_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PortalHeader
        title="Fleet Maintenance & Service Operations"
        subtitle="Manage scheduled preventive maintenance, workshop repairs, service overdue flags, and cost logs"
        category="FleetMind AI · Maintenance Desk"
        icon={<Wrench className="w-5 h-5" />}
        accent="blue"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Alerts Banner if Overdue */}
        {overdueCount > 0 && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-black text-rose-950">
                ⚠ {overdueCount} Vehicle(s) Overdue for Critical Service
              </h4>
              <p className="text-xs text-rose-800">
                Overdue commercial vehicles are flagged to prevent safety breaches. Vehicles marked under active maintenance are automatically excluded from the optimization dispatch pool.
              </p>
            </div>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Scheduled Services</span>
            <div className="text-2xl font-black text-slate-900">{scheduledCount}</div>
            <span className="text-[11px] font-semibold text-slate-500">Upcoming preventative checks</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-600 block tracking-wider">In Workshop</span>
            <div className="text-2xl font-black text-amber-700">{inProgressCount}</div>
            <span className="text-[11px] font-semibold text-amber-600/80">Excluded from dispatch</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-600 block tracking-wider">Overdue Alerts</span>
            <div className="text-2xl font-black text-rose-700">{overdueCount}</div>
            <span className="text-[11px] font-semibold text-rose-600/80">Requires immediate booking</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 block tracking-wider">Total Service Expense</span>
            <div className="text-2xl font-black text-slate-900">₹{totalCost.toLocaleString()}</div>
            <span className="text-[11px] font-semibold text-slate-500">YTD maintenance spend</span>
          </div>
        </div>

        {/* Action Header & Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search lorry, workshop, service type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book Service / Add Record
          </button>
        </div>

        {/* Maintenance Records Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Service Type</th>
                  <th className="py-3.5 px-4">Authorized Workshop</th>
                  <th className="py-3.5 px-4">Next Due Date</th>
                  <th className="py-3.5 px-4">Odometer</th>
                  <th className="py-3.5 px-4">Cost (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 font-black text-slate-900">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          {r.lorry_code}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        {r.service_type.replace(/_/g, ' ')}
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {r.vendor_workshop}
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">
                            {new Date(r.next_service_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Last: {new Date(r.last_service_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                        {r.odometer_km.toLocaleString()} km
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900">
                        ₹{r.maintenance_cost_inr.toLocaleString()}
                      </td>

                      <td className="py-4 px-4">
                        {r.status === 'OVERDUE' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                            ⚠ OVERDUE
                          </span>
                        )}
                        {r.status === 'IN_PROGRESS' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                            IN WORKSHOP
                          </span>
                        )}
                        {r.status === 'SCHEDULED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                            SCHEDULED
                          </span>
                        )}
                        {r.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            COMPLETED
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {r.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'IN_PROGRESS')}
                            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg transition"
                          >
                            Mark in Workshop
                          </button>
                        )}
                        {r.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition"
                          >
                            Mark Completed
                          </button>
                        )}
                        {r.status === 'OVERDUE' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'IN_PROGRESS')}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition"
                          >
                            Send to Workshop
                          </button>
                        )}
                        {r.status === 'COMPLETED' && (
                          <span className="text-[11px] text-slate-400 font-semibold">Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-16 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">No Maintenance Records Found</p>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                            Preventive servicing, workshop repair bookings, and tire rotations will appear here.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          + Schedule Maintenance Service
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Maintenance Record */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Book Vehicle Maintenance</h3>
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
                    <label className="block font-bold text-slate-700 uppercase mb-1">Service Type</label>
                    <select
                      value={form.service_type}
                      onChange={(e) => setForm({ ...form, service_type: e.target.value as MaintenanceType })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                    >
                      <option value="REGULAR_SERVICE">REGULAR SERVICE</option>
                      <option value="OIL_CHANGE">OIL CHANGE</option>
                      <option value="TIRE_ROTATION">TIRE ROTATION</option>
                      <option value="BRAKE_OVERHAUL">BRAKE OVERHAUL</option>
                      <option value="ENGINE_TUNING">ENGINE TUNING</option>
                      <option value="INSPECTION">INSPECTION</option>
                      <option value="EMERGENCY_REPAIR">EMERGENCY REPAIR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Last Service Date</label>
                    <input
                      type="date"
                      value={form.last_service_date}
                      onChange={(e) => setForm({ ...form, last_service_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Next Due Date</label>
                    <input
                      type="date"
                      value={form.next_service_date}
                      onChange={(e) => setForm({ ...form, next_service_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Current Odometer (km)</label>
                    <input
                      type="number"
                      value={form.odometer_km}
                      onChange={(e) => setForm({ ...form, odometer_km: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Est. Cost (₹ INR)</label>
                    <input
                      type="number"
                      value={form.maintenance_cost_inr}
                      onChange={(e) => setForm({ ...form, maintenance_cost_inr: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Authorized Workshop & Hub</label>
                  <input
                    type="text"
                    required
                    value={form.vendor_workshop}
                    onChange={(e) => setForm({ ...form, vendor_workshop: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Initial Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as MaintenanceStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="SCHEDULED">SCHEDULED (Remains available until service date)</option>
                    <option value="IN_PROGRESS">IN PROGRESS (Immediately mark vehicle unavailable)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
                    Confirm Booking
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
