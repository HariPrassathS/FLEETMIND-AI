'use client';

import React, { useState } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { FileSpreadsheet, Download, CheckCircle2, Calendar } from 'lucide-react';

export default function ManagerReportsPage() {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleDownload = (name: string) => {
    setDownloaded(name);
    setTimeout(() => setDownloaded(null), 3000);
  };

  return (
    <>
      <PortalHeader
        title="Executive Reports & Export Center"
        subtitle="Automated PDF/CSV audits for transportation spend, fuel consumption, driver hours & SLA compliance"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {downloaded && (
          <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Generated and downloaded: {downloaded}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Monthly Executive Transportation Spend', desc: 'Detailed cost breakdown by highway corridor, fuel rate, and driver expense.' },
            { title: 'Fleet Diesel Consumption & Carbon Audit', desc: 'Liters burned per ton-km, vehicle rankings, and emissions offset.' },
            { title: 'Quarterly SLA & Delivery Performance', desc: 'On-time delivery percentages, delay root causes, and receiver sign-offs.' },
            { title: '15-Step Heuristics ROI Proof Ledger', desc: 'Mathematical before vs after delta log across all optimization runs.' },
            { title: 'Driver Hours of Service & Safety Audit', desc: 'Shift compliance, driving duration, and driver safety scores.' },
            { title: 'Vehicle Maintenance & Downtime Log', desc: 'Scheduled maintenance, breakdown incidents, and fleet availability metrics.' },
          ].map((rep, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{rep.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.desc}</p>
              </div>

              <button
                onClick={() => handleDownload(rep.title)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV / PDF
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
