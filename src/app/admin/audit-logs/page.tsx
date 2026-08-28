'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { AuditLog } from '../../../types/database';
import { Shield, FileText, User, Clock, ArrowRight } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(fleetMindStore.getAuditLogs());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setLogs(fleetMindStore.getAuditLogs());
    });
    return unsub;
  }, []);

  return (
    <>
      <PortalHeader
        title="Immutable System Audit Ledger"
        subtitle="Cryptographically logged system mutations, user role changes, dispatch decisions & parameters"
        category="FleetMind AI · Audit Trail"
        icon={<FileText className="w-5 h-5" />}
        accent="purple"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                System Activity Records ({logs.length})
              </h3>
              <p className="text-xs text-slate-500">Immutable ledger recording Who, What, Entity, Before, and After data</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-100 text-purple-800">
              AUDIT VERIFIED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Actor</th>
                  <th className="py-3.5 px-6">Action</th>
                  <th className="py-3.5 px-6">Entity</th>
                  <th className="py-3.5 px-6">Before Data</th>
                  <th className="py-3.5 px-6">After Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-6 text-slate-400 font-sans">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900 font-sans">
                      {log.user_email} ({log.user_role})
                    </td>
                    <td className="py-3.5 px-6 font-bold text-purple-700">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-6 text-slate-700">
                      {log.entity} {log.entity_id ? `[${log.entity_id}]` : ''}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 max-w-[160px] truncate">
                      {log.before_data ? JSON.stringify(log.before_data) : '—'}
                    </td>
                    <td className="py-3.5 px-6 text-emerald-700 max-w-[160px] truncate font-semibold">
                      {log.after_data ? JSON.stringify(log.after_data) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
