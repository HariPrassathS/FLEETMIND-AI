'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth/auth-context';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { initSupabaseStoreSync } from '../../../lib/db/supabase-sync';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  Radio,
  Clock,
  Award,
  Sparkles,
  Edit,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Camera,
  Activity,
  LogOut,
} from 'lucide-react';
import { UserAvatar } from '../../../components/brand/user-avatar';

export default function DispatcherProfilePage() {
  const { user, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: user?.full_name || 'Chief Freight Dispatcher',
    email: user?.email || 'dispatcher@fleetmind.ai',
    phone: '+91 98401 55678',
    employee_id: 'DSP-7742',
    terminal: 'Chennai Central Logistics Hub (Depot #1)',
    radio_channel: 'VHF Ch. 16 / 156.800 MHz (Fleet Operations)',
    shift_hours: '08:00 AM – 06:00 PM IST',
    emergency_contact: '+91 94440 99881 (Hub Control)',
    avatar_url: user?.avatar_url || '',
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  useEffect(() => {
    initSupabaseStoreSync(true);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({ ...editForm });
    setIsEditModalOpen(false);
    setSuccessToast('Dispatcher profile details updated successfully!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const runs = fleetMindStore.getOptimizationRuns();
  const shipments = fleetMindStore.getShipments();
  const lorries = fleetMindStore.getLorries();

  return (
    <>
      <PortalHeader
        title="Dispatcher Profile & Console Credentials"
        subtitle="Manage dispatcher workstation identity, terminal assignment, radio telemetry, and shift schedule"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Profile Card Hero */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 z-10">
              <UserAvatar
                src={profileData.avatar_url}
                name={profileData.name}
                email={profileData.email}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 font-mono text-[10px] font-black border border-blue-300/30 uppercase">
                    {profileData.employee_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase border border-emerald-400/30">
                    Active on Duty
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{profileData.name}</h2>
                <p className="text-xs text-blue-200 font-medium">{profileData.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditForm({ ...profileData });
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/20 shadow-md transition flex items-center justify-center gap-2 shrink-0 z-10"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile & Contact</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50 p-4 border-b border-slate-100 text-xs">
            <div className="p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Managed Consignments</span>
              <strong className="text-lg font-black text-slate-900">{shipments.length}</strong>
            </div>
            <div className="p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Fleet Lorries</span>
              <strong className="text-lg font-black text-blue-600">{lorries.length}</strong>
            </div>
            <div className="p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">AI Optimizer Executions</span>
              <strong className="text-lg font-black text-indigo-600">{runs.length}</strong>
            </div>
            <div className="p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Console SLA Score</span>
              <strong className="text-lg font-black text-emerald-700">99.2%</strong>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Operational Identity</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Designated Terminal Station</span>
                    <strong className="text-slate-900 font-bold block">{profileData.terminal}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Radio className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Radio Frequency Channel</span>
                    <strong className="text-slate-900 font-bold block">{profileData.radio_channel}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Duty Shift Window</span>
                    <strong className="text-slate-900 font-bold block">{profileData.shift_hours}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Contact & Safety Escalations</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Workstation Direct Line</span>
                    <strong className="text-slate-900 font-bold block">{profileData.phone}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Dispatch Mail</span>
                    <strong className="text-slate-900 font-bold block">{profileData.email}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Hub Escalation Line</span>
                    <strong className="text-slate-900 font-bold block">{profileData.emergency_contact}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Edit Dispatcher Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
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
                    <label className="block font-bold text-slate-700 uppercase mb-1">Workstation Direct Phone</label>
                    <input
                      type="text"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Employee Badge Code</label>
                    <input
                      type="text"
                      required
                      value={editForm.employee_id}
                      onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Terminal Depot</label>
                  <input
                    type="text"
                    required
                    value={editForm.terminal}
                    onChange={(e) => setEditForm({ ...editForm, terminal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Radio Frequency Channel</label>
                  <input
                    type="text"
                    required
                    value={editForm.radio_channel}
                    onChange={(e) => setEditForm({ ...editForm, radio_channel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Shift Hours</label>
                    <input
                      type="text"
                      required
                      value={editForm.shift_hours}
                      onChange={(e) => setEditForm({ ...editForm, shift_hours: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Emergency Escalation</label>
                    <input
                      type="text"
                      required
                      value={editForm.emergency_contact}
                      onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Profile Photo / Avatar URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
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
                    Save Changes
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
