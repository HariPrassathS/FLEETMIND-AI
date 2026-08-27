'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { fleetMindStore } from '../../../lib/db/store';
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
} from 'lucide-react';

export default function DriverProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(fleetMindStore.getDrivers());
  const [lorries, setLorries] = useState<Lorry[]>(fleetMindStore.getLorries());
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setDrivers(fleetMindStore.getDrivers());
      setLorries(fleetMindStore.getLorries());
    });
    return unsub;
  }, []);

  const currentDriver = drivers.find(
    (d) => d.email === user?.email || d.name === user?.full_name || d.id === user?.id
  ) || drivers[0];

  const assignedLorry = lorries.find(
    (l) => l.assigned_driver_id === currentDriver?.id || l.id === currentDriver?.assigned_lorry_id
  );

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

  const totalDeliveries = currentDriver?.total_deliveries || 0;
  const score = currentDriver?.performance_score || 96;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-lg mx-auto">
      {/* Profile Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md text-white font-black text-3xl flex items-center justify-center mx-auto shadow-lg border border-white/20 mb-3">
            {user?.full_name?.charAt(0) || currentDriver?.name?.charAt(0) || 'D'}
          </div>
          <h2 className="text-xl font-bold">{user?.full_name || currentDriver?.name || 'Driver'}</h2>
          <p className="text-xs text-blue-200 mt-0.5">{user?.email || currentDriver?.email || 'driver@fleetmind.ai'}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/20">
              <ShieldCheck className="w-3 h-3 inline mr-1" /> Commercial Heavy Pilot
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              isAvailable ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' : 'bg-rose-400/20 text-rose-200 border-rose-400/30'
            }`}>
              {isAvailable ? '● ON DUTY' : '○ OFF DUTY'}
            </span>
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
          <span className="text-lg font-black text-slate-900">4.8</span>
          <span className="text-[10px] text-slate-500 font-bold block">Rating</span>
        </div>
      </div>

      {/* Driver Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Driver Information</h3>
        </div>
        <div className="p-5 space-y-0 text-xs divide-y divide-slate-100">
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
            <span className="font-bold text-slate-900">{currentDriver?.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> License #</span>
            <span className="font-bold text-slate-900 font-mono">{currentDriver?.license_number || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Shift Window</span>
            <span className="font-bold text-slate-900">{currentDriver?.shift_start || '06:00'} – {currentDriver?.shift_end || '18:00'} IST</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Availability</span>
            <span className={`font-bold ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
              {currentDriver?.availability_status || 'AVAILABLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned Vehicle */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Vehicle</h3>
        </div>
        {assignedLorry ? (
          <div className="p-5 space-y-0 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Vehicle Code</span>
              <span className="font-bold text-slate-900">{assignedLorry.lorry_code}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold">Registration</span>
              <span className="font-bold text-slate-900 font-mono">{assignedLorry.registration_number}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold">Model</span>
              <span className="font-bold text-slate-900">{assignedLorry.model}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> Fuel Efficiency</span>
              <span className="font-bold text-blue-600">{assignedLorry.fuel_efficiency_km_per_l} km/L</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-500 font-bold">Max Payload</span>
              <span className="font-bold text-slate-900">{assignedLorry.max_weight_kg.toLocaleString()} kg / {assignedLorry.max_volume_m3} m³</span>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">No vehicle currently assigned</p>
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">Live Sync Status</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Events Synced
          </span>
        </div>
      </div>

      {/* Toggle Availability */}
      <button
        onClick={handleToggleAvailability}
        className={`w-full py-3.5 font-bold text-xs rounded-2xl border transition flex items-center justify-center gap-2 ${
          isAvailable
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
        }`}
      >
        <Settings className="w-4 h-4" />
        {isAvailable ? 'Go Off Duty' : 'Go On Duty'}
      </button>

      {/* Sign Out */}
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
    </div>
  );
}
