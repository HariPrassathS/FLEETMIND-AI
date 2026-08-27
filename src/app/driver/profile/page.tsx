'use client';

import React from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { User, Truck, ShieldCheck, Wifi, LogOut } from 'lucide-react';

export default function DriverProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="text-center py-4 space-y-2">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
          {user?.full_name?.charAt(0) || 'D'}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{user?.full_name || 'Murugan Selvam'}</h2>
        <p className="text-xs text-slate-500">{user?.email || 'driver@fleetmind.ai'}</p>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
          COMMERCIAL HEAVY PILOT (CLASS HMV)
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3 text-xs text-slate-700">
        <div className="flex justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-400 font-bold uppercase text-[10px]">License Number</span>
          <span className="font-bold text-slate-900">TN-01-2015-00124</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned Lorry</span>
          <span className="font-bold text-slate-900">L-11 (Tata 1109 6 Ton)</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Duty Shift</span>
          <span className="font-bold text-slate-900">06:00 - 18:00 IST</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-slate-400 font-bold uppercase text-[10px]">PWA Sync Queue</span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5" /> All Events Synced
          </span>
        </div>
      </div>

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
