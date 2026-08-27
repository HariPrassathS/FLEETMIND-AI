'use client';

import React from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { TrendingUp, DollarSign, Fuel, Truck, Award, CheckCircle2 } from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function ManagerSavingsPage() {
  return (
    <>
      <PortalHeader
        title="Optimization ROI & Cost Savings"
        subtitle="Cumulative savings realized through load consolidation, 2-opt route efficiency & fuel price heuristics"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Total Realized Fleet ROI
          </span>
          <div className="text-4xl sm:text-5xl font-black tracking-tight">₹5,20,000</div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Calculated by benchmarking FleetMind multi-stop consolidated assignments against traditional point-to-point unoptimized operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Diesel Savings</span>
            <div className="text-2xl font-black text-blue-700 mt-1">5,388 Liters</div>
            <p className="text-xs text-slate-500 mt-0.5">₹5,19,942 saved @ ₹96.50/L</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mileage Reduction</span>
            <div className="text-2xl font-black text-indigo-700 mt-1">42,800 km</div>
            <p className="text-xs text-slate-500 mt-0.5">Eliminated empty deadhead miles</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Truck Dispatches Avoided</span>
            <div className="text-2xl font-black text-purple-700 mt-1">38 Vehicles</div>
            <p className="text-xs text-slate-500 mt-0.5">Through smart load grouping</p>
          </div>
        </div>
      </main>
    </>
  );
}
