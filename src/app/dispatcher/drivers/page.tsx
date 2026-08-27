'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Driver, DriverStatus } from '../../../lib/optimization/types';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Truck,
  Phone,
  Calendar,
  Clock,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Award,
  Radio,
  Trash2,
} from 'lucide-react';

export default function DispatcherDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedLorryId, setSelectedLorryId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+91 98400 ',
    license_number: 'TN01-201500',
    shift_start: '06:00',
    shift_end: '18:00',
    availability_status: 'AVAILABLE' as DriverStatus,
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setDrivers(fleetMindStore.getDrivers());
    });
    return unsub;
  }, []);

  const lorries = fleetMindStore.getLorries();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const driverEmail = form.email.trim() || `driver.${form.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@fleetmind.ai`;
    fleetMindStore.createDriver({
      name: form.name,
      email: driverEmail,
      password: form.password || 'Driver@123',
      phone: form.phone,
      license_number: form.license_number,
      shift_start: form.shift_start,
      shift_end: form.shift_end,
      availability_status: form.availability_status,
    });
    setIsAddModalOpen(false);
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '+91 98400 ',
      license_number: 'TN01-201500',
      shift_start: '06:00',
      shift_end: '18:00',
      availability_status: 'AVAILABLE' as DriverStatus,
    });
  };

  const handleStatusChange = (driverId: string, newStatus: DriverStatus) => {
    fleetMindStore.updateDriverStatus(driverId, newStatus);
  };

  const handleAssignLorry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    // Update driver in store
    const d = fleetMindStore.getDriverById(selectedDriver.id);
    if (d) {
      d.assigned_lorry_id = selectedLorryId || null;
      d.updated_at = new Date().toISOString();
    }

    // Update lorry in store
    if (selectedLorryId) {
      const l = fleetMindStore.getLorryById(selectedLorryId);
      if (l) {
        l.driver_id = selectedDriver.id;
        l.assigned_driver_name = selectedDriver.name;
        l.updated_at = new Date().toISOString();
      }
    }

    setIsAssignModalOpen(false);
    setSelectedDriver(null);
  };

  const availableCount = drivers.filter((d) => d.availability_status === 'AVAILABLE').length;
  const onDutyCount = drivers.filter((d) => d.availability_status === 'ON_DUTY').length;
  const unavailableCount = drivers.filter((d) => d.availability_status !== 'AVAILABLE' && d.availability_status !== 'ON_DUTY').length;

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.license_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.availability_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PortalHeader
        title="Driver Roster & Availability Roster"
        subtitle="Manage commercial drivers, shift rosters, live duty status, and optimizer vehicle assignments"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Drivers</span>
            <div className="text-2xl font-black text-slate-900">{drivers.length}</div>
            <span className="text-[11px] font-semibold text-slate-500">Commercial licensed</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Available for Dispatch</span>
            <div className="text-2xl font-black text-emerald-700">{availableCount}</div>
            <span className="text-[11px] font-semibold text-emerald-600/80">Ready for assignment</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">On Route (In Transit)</span>
            <div className="text-2xl font-black text-blue-700">{onDutyCount}</div>
            <span className="text-[11px] font-semibold text-blue-600/80">Active trip execution</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-600 block tracking-wider">Off-Duty / Leave</span>
            <div className="text-2xl font-black text-amber-700">{unavailableCount}</div>
            <span className="text-[11px] font-semibold text-amber-600/80">Excluded from optimizer</span>
          </div>
        </div>

        {/* Action Header & Filters */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search driver name, phone, or license..."
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
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ON_DUTY">ON DUTY</option>
              <option value="OFF_DUTY">OFF DUTY</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Driver
          </button>
        </div>

        {/* Drivers Grid / Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Driver Profile</th>
                  <th className="py-3.5 px-4">License & Contact</th>
                  <th className="py-3.5 px-4">Assigned Vehicle</th>
                  <th className="py-3.5 px-4">Shift Hours</th>
                  <th className="py-3.5 px-4">Performance</th>
                  <th className="py-3.5 px-4">Duty Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map((d) => {
                  const assignedLorry = lorries.find((l) => l.id === d.assigned_lorry_id || l.driver_id === d.id);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {d.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 block leading-tight">{d.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {d.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {d.phone}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            DL: {d.license_number}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {assignedLorry ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              {assignedLorry.lorry_code}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {assignedLorry.registration_number}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-700 font-semibold">
                        {d.shift_start} – {d.shift_end}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{d.performance_score || 96}% On-Time</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={d.availability_status}
                          onChange={(e) => handleStatusChange(d.id, e.target.value as DriverStatus)}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg border focus:outline-none uppercase ${
                            d.availability_status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : d.availability_status === 'ON_DUTY'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="ON_DUTY">ON DUTY</option>
                          <option value="OFF_DUTY">OFF DUTY</option>
                          <option value="UNAVAILABLE">UNAVAILABLE</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedDriver(d);
                              setSelectedLorryId(d.assigned_lorry_id || '');
                              setIsAssignModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition text-[11px]"
                          >
                            Assign Vehicle
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete driver ${d.name}?`)) {
                                fleetMindStore.deleteDriver(d.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Driver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Driver */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Add Commercial Driver</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    placeholder="e.g. S. Kumaravel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Driver Login Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      placeholder="e.g. driver.kumar@fleetmind.ai"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Account Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                      placeholder="Min. 6 chars (e.g. Driver@123)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Driving License No.</label>
                    <input
                      type="text"
                      required
                      value={form.license_number}
                      onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Shift Start</label>
                    <input
                      type="time"
                      value={form.shift_start}
                      onChange={(e) => setForm({ ...form, shift_start: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Shift End</label>
                    <input
                      type="time"
                      value={form.shift_end}
                      onChange={(e) => setForm({ ...form, shift_end: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
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
                    Register Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Assign Vehicle */}
        {isAssignModalOpen && selectedDriver && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Assign Lorry to Driver</h3>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignLorry} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Driver</span>
                  <span className="text-sm font-black text-slate-900">{selectedDriver.name}</span>
                  <span className="text-[11px] text-slate-500 block font-mono">{selectedDriver.phone}</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Select Commercial Lorry</label>
                  <select
                    value={selectedLorryId}
                    onChange={(e) => setSelectedLorryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                  >
                    <option value="">-- No Vehicle Assigned (Reserve Pool) --</option>
                    {lorries.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.lorry_code} ({l.registration_number}) — {l.model} ({l.max_weight_kg.toLocaleString()} kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
                  >
                    Update Assignment
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
