'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { VehicleDocument, DriverDocument, VehicleDocType, DriverDocType, DocumentStatus } from '../../../lib/optimization/types';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Plus,
  Truck,
  User,
  Calendar,
  X,
  Search,
  Filter,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export default function DispatcherDocumentsPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [vDocs, setVDocs] = useState<VehicleDocument[]>(fleetMindStore.getVehicleDocuments());
  const [dDocs, setDDocs] = useState<DriverDocument[]>(fleetMindStore.getDriverDocuments());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [vForm, setVForm] = useState({
    lorry_id: 'lorry-01',
    document_type: 'INSURANCE' as VehicleDocType,
    document_number: 'NEWIND-CV-998822',
    issue_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  });

  const [dForm, setDForm] = useState({
    driver_id: 'driver-01',
    document_type: 'DRIVING_LICENSE' as DriverDocType,
    document_number: 'TN01-2010004921',
    issue_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 365 * 86400000 * 3).toISOString().slice(0, 10),
  });

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setVDocs(fleetMindStore.getVehicleDocuments());
      setDDocs(fleetMindStore.getDriverDocuments());
    });
    return unsub;
  }, []);

  const lorries = fleetMindStore.getLorries();
  const drivers = fleetMindStore.getDrivers();

  const handleCreateVDoc = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createVehicleDocument({
      lorry_id: vForm.lorry_id,
      document_type: vForm.document_type,
      document_number: vForm.document_number,
      issue_date: vForm.issue_date,
      expiry_date: vForm.expiry_date,
    });
    setIsAddModalOpen(false);
  };

  const handleCreateDDoc = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.createDriverDocument({
      driver_id: dForm.driver_id,
      document_type: dForm.document_type,
      document_number: dForm.document_number,
      issue_date: dForm.issue_date,
      expiry_date: dForm.expiry_date,
    });
    setIsAddModalOpen(false);
  };

  const expiredCount = vDocs.filter((d) => d.status === 'EXPIRED').length + dDocs.filter((d) => d.status === 'EXPIRED').length;
  const expiringSoonCount = vDocs.filter((d) => d.status === 'EXPIRING_SOON').length + dDocs.filter((d) => d.status === 'EXPIRING_SOON').length;
  const validCount = vDocs.filter((d) => d.status === 'VALID').length + dDocs.filter((d) => d.status === 'VALID').length;

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            VALID
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            EXPIRING SOON
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3" />
            EXPIRED
          </span>
        );
    }
  };

  return (
    <>
      <PortalHeader
        title="Vehicle & Driver Compliance Documents"
        subtitle="Manage statutory RC certificates, commercial insurance policies, fitness certificates, and driver licenses"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Compliance Alerts */}
        {expiredCount > 0 && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-black text-rose-950">
                ⚠ {expiredCount} Statutory Document(s) Expired
              </h4>
              <p className="text-xs text-rose-800">
                Vehicles or drivers with expired statutory papers may be barred from inter-state corridor transit until renewed.
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Total Documents</span>
            <div className="text-2xl font-black text-slate-900">{vDocs.length + dDocs.length}</div>
            <span className="text-[11px] font-semibold text-slate-500">Fleet compliance registry</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">Valid & Active</span>
            <div className="text-2xl font-black text-emerald-700">{validCount}</div>
            <span className="text-[11px] font-semibold text-emerald-600/80">Clear for transit</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-600 block tracking-wider">Expiring (30 Days)</span>
            <div className="text-2xl font-black text-amber-700">{expiringSoonCount}</div>
            <span className="text-[11px] font-semibold text-amber-600/80">Renewal notices sent</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-600 block tracking-wider">Expired Critical</span>
            <div className="text-2xl font-black text-rose-700">{expiredCount}</div>
            <span className="text-[11px] font-semibold text-rose-600/80">Requires immediate renewal</span>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
                activeTab === 'vehicles' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Vehicle Documents ({vDocs.length})
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
                activeTab === 'drivers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Driver Documents ({dDocs.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-card transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">{activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Document Number</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'vehicles' ? (
                  vDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4">
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          {doc.lorry_code}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        {doc.document_type}
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-slate-900">
                        {doc.document_number}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {new Date(doc.issue_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900">
                        {new Date(doc.expiry_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(doc.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  dDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4">
                        <span className="font-black text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {doc.driver_name}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        {doc.document_type.replace(/_/g, ' ')}
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-slate-900">
                        {doc.document_number}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {new Date(doc.issue_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900">
                        {new Date(doc.expiry_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(doc.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Upload Document */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Register {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'} Document
                  </h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeTab === 'vehicles' ? (
                <form onSubmit={handleCreateVDoc} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle</label>
                      <select
                        value={vForm.lorry_id}
                        onChange={(e) => setVForm({ ...vForm, lorry_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                      >
                        {lorries.map((l) => (
                          <option key={l.id} value={l.id}>{l.lorry_code} ({l.registration_number})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Document Type</label>
                      <select
                        value={vForm.document_type}
                        onChange={(e) => setVForm({ ...vForm, document_type: e.target.value as VehicleDocType })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                      >
                        <option value="RC">RC (REGISTRATION CERTIFICATE)</option>
                        <option value="INSURANCE">COMMERCIAL INSURANCE</option>
                        <option value="FITNESS">FITNESS CERTIFICATE (FC)</option>
                        <option value="POLLUTION">POLLUTION CERTIFICATE (PUCC)</option>
                        <option value="PERMIT">NATIONAL / STATE PERMIT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Document Number</label>
                    <input
                      type="text"
                      required
                      value={vForm.document_number}
                      onChange={(e) => setVForm({ ...vForm, document_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={vForm.issue_date}
                        onChange={(e) => setVForm({ ...vForm, issue_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={vForm.expiry_date}
                        onChange={(e) => setVForm({ ...vForm, expiry_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
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
                      Register Document
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateDDoc} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Driver</label>
                      <select
                        value={dForm.driver_id}
                        onChange={(e) => setDForm({ ...dForm, driver_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                      >
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Document Type</label>
                      <select
                        value={dForm.document_type}
                        onChange={(e) => setDForm({ ...dForm, document_type: e.target.value as DriverDocType })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900"
                      >
                        <option value="DRIVING_LICENSE">COMMERCIAL DRIVING LICENSE</option>
                        <option value="ID_PROOF">GOVERNMENT ID / AADHAAR</option>
                        <option value="MEDICAL_FITNESS">MEDICAL FITNESS CERTIFICATE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Document Number</label>
                    <input
                      type="text"
                      required
                      value={dForm.document_number}
                      onChange={(e) => setDForm({ ...dForm, document_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={dForm.issue_date}
                        onChange={(e) => setDForm({ ...dForm, issue_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={dForm.expiry_date}
                        onChange={(e) => setDForm({ ...dForm, expiry_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
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
                      Register Document
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
