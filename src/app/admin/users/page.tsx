'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { UserProfile } from '../../../types/database';
import { UserRole } from '../../../lib/optimization/types';
import {
  Users,
  Plus,
  ShieldCheck,
  UserX,
  UserCheck,
  X,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>(fleetMindStore.getUsers());
  const [activeTab, setActiveTab] = useState<'all' | 'pending_dispatchers'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    email: '',
    role: 'CUSTOMER' as UserRole,
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setUsers(fleetMindStore.getUsers());
    });
    return unsub;
  }, []);

  const pendingDispatchers = users.filter(
    (u) => u.role === 'DISPATCHER' && u.verification_status === 'PENDING_ADMIN_VERIFICATION'
  );

  const handleToggleStatus = (user: UserProfile) => {
    fleetMindStore.updateUserStatus(user.id, !user.is_active);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    fleetMindStore.updateUserRole(userId, newRole);
  };

  const handleApproveDispatcher = (userId: string) => {
    fleetMindStore.verifyDispatcherAccount(userId);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createUser({
      full_name: inviteForm.full_name,
      email: inviteForm.email,
      role: inviteForm.role,
      is_active: true,
      is_verified: true,
    });
    setIsInviteModalOpen(false);
    setInviteForm({ full_name: '', email: '', role: 'CUSTOMER' });
  };

  return (
    <>
      <PortalHeader
        title="User & Access Management"
        subtitle="Manage administrator, dispatcher, driver, customer, and manager accounts and verify applications"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Tab switcher & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-white text-purple-700 shadow-card font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('pending_dispatchers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pending_dispatchers'
                  ? 'bg-white text-purple-700 shadow-card font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Pending Dispatcher Approvals ({pendingDispatchers.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Invite Platform User
          </button>
        </div>

        {/* PENDING DISPATCHERS DESK */}
        {activeTab === 'pending_dispatchers' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Dispatcher Desk Applications Queue ({pendingDispatchers.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Review applicant corridor, fleet size, and authorize live Dispatcher portal access
                </p>
              </div>
            </div>

            {pendingDispatchers.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">All Applications Processed</h4>
                <p className="text-xs text-slate-500">No pending dispatcher desk registrations in queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingDispatchers.map((disp) => (
                  <div
                    key={disp.id}
                    className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{disp.full_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                          PENDING VERIFICATION
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{disp.email} • Phone: {disp.phone || disp.verification_details?.phone || 'N/A'}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span>Corridor: <strong className="text-slate-800">{disp.verification_details?.freight_zone || 'South India NH44'}</strong></span>
                        <span>•</span>
                        <span>Fleet Capacity: <strong className="text-slate-800">{disp.verification_details?.fleet_size || '25-100 Lorries'}</strong></span>
                        <span>•</span>
                        <span>Experience: <strong className="text-slate-800">{disp.verification_details?.experience_years || 4} Years</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApproveDispatcher(disp.id)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-1.5 shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Unlock Dispatcher Desk</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALL USERS DIRECTORY */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3.5 px-6">User / Contact</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Assigned Role</th>
                    <th className="py-3.5 px-6">Verification</th>
                    <th className="py-3.5 px-6">Account Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <span>{u.full_name}</span>
                          {u.phone && <span className="block text-[10px] text-slate-400 font-medium">{u.phone}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-semibold">{u.email}</td>
                      <td className="py-3.5 px-6">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        >
                          <option value="CUSTOMER">CUSTOMER / SHIPPER</option>
                          <option value="DISPATCHER">DISPATCHER</option>
                          <option value="DRIVER">DRIVER</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            u.is_verified !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {u.is_verified !== false ? 'Verified' : 'Pending Admin'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                            u.is_active
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invite User Modal */}
        {isInviteModalOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsInviteModalOpen(false);
            }}
          >
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
              <div className="bg-purple-600 p-5 text-white flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Invite / Create Platform User
                </h3>
                <button onClick={() => setIsInviteModalOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.full_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="rajesh@clientcorp.in"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="CUSTOMER">CUSTOMER / SHIPPER</option>
                    <option value="DISPATCHER">DISPATCHER (Command Center)</option>
                    <option value="DRIVER">DRIVER (Pilot Mobile PWA)</option>
                    <option value="MANAGER">MANAGER (Executive BI)</option>
                    <option value="ADMIN">ADMIN (System Controller)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm"
                  >
                    Create User Account
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
