'use client';

import React from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { LineChart as LineChartIcon, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export default function ManagerTrendsPage() {
  return (
    <>
      <PortalHeader
        title="Freight Trends & Predictive Forecasting"
        subtitle="Corridor demand forecasting, seasonal agricultural freight spikes & predictive fleet capacity needs"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Sparkles className="w-4 h-4" />
            <span>AI Predictive Demand Insights (Next 30 Days)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 text-sm">Karur → Chennai Corridor</span>
              <p className="text-slate-600">Forecasted demand increase: <strong className="text-emerald-700">+24%</strong> due to export textile shipping cycle.</p>
              <div className="text-[11px] text-blue-700 font-semibold pt-1">Action: Pre-stage 4 additional 10.5T lorries at Karur freight terminal.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 text-sm">Bengaluru Auto Ancillary</span>
              <p className="text-slate-600">Stable demand: <strong className="text-slate-900">±3%</strong> variance expected across Hosur automotive parks.</p>
              <div className="text-[11px] text-blue-700 font-semibold pt-1">Action: Maintain standard 6-ton fleet allocation.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-900 text-sm">Coimbatore Engineering Hub</span>
              <p className="text-slate-600">Forecasted pump set consignment surge: <strong className="text-emerald-700">+16%</strong>.</p>
              <div className="text-[11px] text-blue-700 font-semibold pt-1">Action: Coordinate with standby driver pool for night shifts.</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
