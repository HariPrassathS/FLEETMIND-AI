'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Driver, DriverStatus } from '../../../lib/optimization/types';
import { UserCheck, Plus, X, Phone, User, CheckCircle2, Trash2 } from 'lucide-react';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());
  const [lorries, setLorries] = useState(fleetMindStore.getLorries());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+91 ',
    license_number: '',
    shift_start: '06:00',
    shift_end: '18:00',
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setDrivers(fleetMindStore.getDrivers());
      setLorries(fleetMindStore.getLorries());
    });
    return unsub;
  }, []);

  const handleCreateDriver = (e: React.FormEvent) => {
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
    });
    setIsAddModalOpen(false);
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '+91 ',
      license_number: '',
      shift_start: '06:00',
      shift_end: '18:00',
    });
  };

  const handleStatusChange = (driverId: string, status: DriverStatus) => {
    fleetMindStore.updateDriverStatus(driverId, status);
  };

  const handleAssignLorry = (driverId: string, lorryId: string) => {
    fleetMindStore.assignDriverToLorry(driverId, lorryId || null);
  };

  const handleDeleteDriver = (driver: Driver) => {
    if (confirm(`Are you sure you want to permanently delete pilot ${driver.name}?`)) {
      fleetMindStore.deleteDriver(driver.id);
    }
  };

  return (
    <>
      <PortalHeader
        title="Driver Pilot Registry"
        subtitle="Commercial driver licensing, assigned vehicle pairings, shift windows & availability status"
        category="FleetMind AI · Driver Pool"
        icon={<UserCheck className="w-5 h-5" />}
        accent="purple"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Commercial Fleet Pilots ({drivers.length})
            </h3>
            <p className="text-xs text-slate-500">Authorized heavy vehicle drivers in system pool</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Register Driver
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-6">Driver Name</th>
                  <th className="py-3.5 px-6">Contact Phone</th>
                  <th className="py-3.5 px-6">Commercial License #</th>
                  <th className="py-3.5 px-6">Assigned Vehicle</th>
                  <th className="py-3.5 px-6">Shift Window</th>
                  <th className="py-3.5 px-6">Availability</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                      <User className="w-4 h-4 text-purple-600" />
                      {d.name}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{d.phone}</td>
                    <td className="py-3.5 px-6 text-slate-700 font-mono">{d.license_number}</td>
                    <td className="py-3.5 px-6">
                      <select
                        value={d.assigned_lorry_id || ''}
                        onChange={(e) => handleAssignLorry(d.id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 max-w-[150px]"
                      >
                        <option value="">Reserve Pool (None)</option>
                        {lorries.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.lorry_code} ({l.registration_number})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">{d.shift_start} - {d.shift_end} IST</td>
                    <td className="py-3.5 px-6">
                      <select
                        value={d.availability_status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value as DriverStatus)}
                        className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="ON_DUTY">ON_DUTY</option>
                        <option value="OFF_DUTY">OFF_DUTY</option>
                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDeleteDriver(d)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Driver Record"
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

        {/* Add Driver Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-purple-600 p-5 text-white flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5" /> Register Pilot
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDriver} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. S. Ramanathan"
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
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
                      placeholder="e.g. driver.raman@fleetmind.ai"
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Account Password</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 6 chars"
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
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
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Commercial License #</label>
                    <input
                      type="text"
                      required
                      value={form.license_number}
                      onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                      placeholder="TN-01-2021-00999"
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Shift Start</label>
                    <input
                      type="time"
                      required
                      value={form.shift_start}
                      onChange={(e) => setForm({ ...form, shift_start: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Shift End</label>
                    <input
                      type="time"
                      required
                      value={form.shift_end}
                      onChange={(e) => setForm({ ...form, shift_end: e.target.value })}
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
                    Register Driver
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
