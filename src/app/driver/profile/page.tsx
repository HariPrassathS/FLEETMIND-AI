'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import { Driver, Lorry } from '../../../lib/optimization/types';
import {
  User,
  Truck,
  ShieldCheck,
  Wifi,
  LogOut,
  Phone,
  Mail,
  Award,
  Clock,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Fuel,
  Activity,
  Edit,
  X,
  Camera,
} from 'lucide-react';
import { VehicleAvatar } from '../../../components/brand/vehicle-avatar';

export default function DriverProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [isAvailable, setIsAvailable] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    initSupabaseStoreSync(true);
    const unsub = fleetMindStore.subscribe(() => {
      setDrivers(fleetMindStore.getDrivers());
      setLorries(fleetMindStore.getLorries());
    });
    return unsub;
  }, []);

  const currentDriver = drivers.find(
    (d) => (user?.email && d.email && d.email.toLowerCase() === user.email.toLowerCase()) ||
           (user?.full_name && d.name && d.name.toLowerCase() === user.full_name.toLowerCase()) ||
           (user?.id && (d.id === user.id || d.user_id === user.id)) ||
           (user?.email && d.phone && user.email.includes(d.phone.replace(/\D/g, '')))
  ) || (drivers.length > 0 ? drivers[0] : null);

  const assignedLorry = currentDriver
    ? (lorries.find((l) => l.driver_id === currentDriver.id || l.assigned_driver_id === currentDriver.id || l.id === currentDriver.assigned_lorry_id) || lorries[0] || null)
    : (lorries.find((l) => l.assigned_driver_name === user?.full_name) || lorries[0] || null);

  const [editForm, setEditForm] = useState({
    name: user?.full_name || currentDriver?.name || 'Driver Pilot',
    phone: currentDriver?.phone || '+91 98401 23456',
    license_number: currentDriver?.license_number || 'TN-01-20220009876',
    shift_start: currentDriver?.shift_start || '06:00',
    shift_end: currentDriver?.shift_end || '18:00',
    emergency_contact: '+91 98400 99881 (Family / Base)',
  });

  const handleToggleAvailability = () => {
    if (currentDriver) {
      const newStatus = isAvailable ? 'OFF_DUTY' : 'AVAILABLE';
      fleetMindStore.updateDriverStatus(currentDriver.id, newStatus as any);
      setIsAvailable(!isAvailable);
    }
  };

  useEffect(() => {
    if (currentDriver) {
      setIsAvailable(currentDriver.availability_status === 'AVAILABLE' || currentDriver.availability_status === 'ON_DUTY');
    }
  }, [currentDriver]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDriver) {
      currentDriver.name = editForm.name;
      currentDriver.phone = editForm.phone;
      currentDriver.license_number = editForm.license_number;
      currentDriver.shift_start = editForm.shift_start;
      currentDriver.shift_end = editForm.shift_end;
      currentDriver.updated_at = new Date().toISOString();
      fleetMindStore.saveToLocalStorage();
      fleetMindStore.notify('DRIVER_UPDATED', currentDriver);
    }
    setIsEditModalOpen(false);
    setSuccessToast('Profile details updated successfully!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const totalDeliveries = currentDriver?.total_deliveries || 14;
  const score = currentDriver?.performance_score || 98;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-lg mx-auto w-full">
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative z-10 space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md text-white font-black text-3xl flex items-center justify-center mx-auto shadow-lg border border-white/20">
            {user?.full_name?.charAt(0) || currentDriver?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <h2 className="text-xl font-black">{user?.full_name || currentDriver?.name || 'Driver Pilot'}</h2>
            <p className="text-xs text-blue-200 mt-0.5">{user?.email || currentDriver?.email || 'driver@fleetmind.ai'}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/20">
              <ShieldCheck className="w-3 h-3 inline mr-1" /> Commercial Pilot
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isAvailable ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' : 'bg-rose-400/20 text-rose-200 border-rose-400/30'
            }`}>
              {isAvailable ? '● ON DUTY' : '○ OFF DUTY'}
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (currentDriver) {
                  setEditForm({
                    name: currentDriver.name,
                    phone: currentDriver.phone,
                    license_number: currentDriver.license_number,
                    shift_start: currentDriver.shift_start || '06:00',
                    shift_end: currentDriver.shift_end || '18:00',
                    emergency_contact: '+91 98400 99881 (Base Control)',
                  });
                }
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 shadow-md transition inline-flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Contact & Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 text-center">
          <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <span className="text-lg font-black text-slate-900">{score}%</span>
          <span className="text-[10px] text-slate-500 font-bold block">On-Time Rate</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <span className="text-lg font-black text-slate-900">{totalDeliveries}</span>
          <span className="text-[10px] text-slate-500 font-bold block">Deliveries</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 text-center">
          <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <span className="text-lg font-black text-slate-900">4.9</span>
          <span className="text-[10px] text-slate-500 font-bold block">Rating</span>
        </div>
      </div>

      {/* Driver Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Driver Contact Details</h3>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Edit className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="p-5 space-y-0 text-xs divide-y divide-slate-100">
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Mobile Phone</span>
            <span className="font-bold text-slate-900">{currentDriver?.phone || '+91 98401 23456'}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Commercial License #</span>
            <span className="font-bold text-slate-900 font-mono">{currentDriver?.license_number || 'TN-01-20220009876'}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Shift Window</span>
            <span className="font-bold text-slate-900">{currentDriver?.shift_start || '06:00'} – {currentDriver?.shift_end || '18:00'} IST</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Duty Status</span>
            <span className={`font-bold ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isAvailable ? 'AVAILABLE FOR DISPATCH' : 'OFF DUTY'}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Vehicle */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Commercial Vehicle</h3>
        </div>
        {assignedLorry ? (
          <div className="p-5 space-y-0 text-xs divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Vehicle Unit</span>
              <div className="flex items-center gap-2">
                <VehicleAvatar
                  src={assignedLorry.image_url}
                  lorryCode={assignedLorry.lorry_code}
                  model={assignedLorry.model}
                  size="sm"
                />
                <span className="font-black text-slate-900">{assignedLorry.lorry_code}</span>
              </div>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold">Registration</span>
              <span className="font-bold text-slate-900 font-mono">{assignedLorry.registration_number}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold">Model & Configuration</span>
              <span className="font-bold text-slate-900">{assignedLorry.model}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> Fuel Economy</span>
              <span className="font-bold text-blue-600">{assignedLorry.fuel_efficiency_km_per_l} km / Liter</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold">Gross Capacity</span>
              <span className="font-bold text-slate-900">{(assignedLorry.max_weight_kg || 6000).toLocaleString()} kg / {assignedLorry.max_volume_m3 || 24} m³</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">No vehicle currently assigned</p>
          </div>
        )}
      </div>

      {/* Toggle Availability Button */}
      <button
        onClick={handleToggleAvailability}
        className={`w-full py-3.5 font-bold text-xs rounded-2xl border transition flex items-center justify-center gap-2 shadow-xs ${
          isAvailable
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
        }`}
      >
        <Settings className="w-4 h-4" />
        {isAvailable ? 'Go Off Duty' : 'Go On Duty'}
      </button>

      {/* Sign Out Button */}
      <button
        onClick={async () => {
          await logout();
          router.push('/login');
        }}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out of Driver Cockpit
      </button>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Edit Driver Profile & Contact</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Pilot Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">License No.</label>
                  <input
                    type="text"
                    required
                    value={editForm.license_number}
                    onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Shift Start</label>
                  <input
                    type="time"
                    required
                    value={editForm.shift_start}
                    onChange={(e) => setEditForm({ ...editForm, shift_start: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Shift End</label>
                  <input
                    type="time"
                    required
                    value={editForm.shift_end}
                    onChange={(e) => setEditForm({ ...editForm, shift_end: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
