'use client';

import React, { useState } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

export default function AdminReportsPage() {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleDownload = (name: string) => {
    setDownloaded(name);
    setTimeout(() => setDownloaded(null), 3000);
  };

  return (
    <>
      <PortalHeader
        title="Administrative Platform Audits"
        subtitle="Download compliance records, user access logs, vehicle registrations & optimization run ledgers"
        category="FleetMind AI · Compliance Reports"
        icon={<FileText className="w-5 h-5" />}
        accent="purple"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {downloaded && (
          <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Generated and exported: {downloaded}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Global Platform User Access & Roles Audit', desc: 'Listing of all system users, granted privileges, status updates and login activity.' },
            { title: 'Fleet Commercial Vehicle Compliance Ledger', desc: 'Registration numbers, tare weights, payload limits, and maintenance history.' },
            { title: 'Comprehensive 15-Step Optimization Savings Log', desc: 'Mathematical before vs after delta proofs across all historical optimization runs.' },
            { title: 'System Security & Role Authorization Events', desc: 'Cryptographically logged access requests, token validations, and role changes.' },
            { title: 'Fuel Tariff & Global Rate Change History', desc: 'Timeline of dynamic diesel pricing modifications and operational constants.' },
          ].map((rep, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{rep.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.desc}</p>
              </div>

              <button
                onClick={() => handleDownload(rep.title)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit CSV
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
