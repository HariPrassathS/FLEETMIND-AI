'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { TrendingUp, DollarSign, Fuel, Truck, Award, CheckCircle2, Inbox, Sparkles } from 'lucide-react';

export default function ManagerSavingsPage() {
  const [runs, setRuns] = useState(fleetMindStore.getOptimizationRuns());

  useEffect(() => {
    const update = () => setRuns(fleetMindStore.getOptimizationRuns());
    update();
    const unsub = fleetMindStore.subscribe(update);
    return unsub;
  }, []);

  const totalCostSaved = runs.reduce((s, r) => s + (r.savings?.cost_inr || 0), 0);
  const totalFuelSaved = runs.reduce((s, r) => s + (r.savings?.fuel_liters || 0), 0);
  const totalDistanceSaved = runs.reduce((s, r) => s + (r.savings?.distance_km || 0), 0);
  const totalVehiclesSaved = runs.reduce((s, r) => s + (r.savings?.lorries_saved || 0), 0);

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
          <div className="text-4xl sm:text-5xl font-black tracking-tight">
            ₹{totalCostSaved.toLocaleString('en-IN')}
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Calculated by benchmarking FleetMind multi-stop consolidated assignments against traditional point-to-point unoptimized operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Diesel Savings</span>
            <div className="text-2xl font-black text-blue-700">{totalFuelSaved.toFixed(1)} Liters</div>
            <p className="text-xs text-slate-500 font-medium">Saved through 2-opt trajectory uncrossing</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mileage Reduction</span>
            <div className="text-2xl font-black text-indigo-700">{totalDistanceSaved.toFixed(1)} km</div>
            <p className="text-xs text-slate-500 font-medium">Eliminated unbillable deadhead miles</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicles Avoided</span>
            <div className="text-2xl font-black text-purple-700">{totalVehiclesSaved} Vehicles</div>
            <p className="text-xs text-slate-500 font-medium">Through 3D volumetric payload consolidation</p>
          </div>
        </div>

        {runs.length === 0 && (
          <div className="py-12 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400 space-y-3 shadow-card">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <p className="font-bold text-slate-700 text-sm">No Optimization Runs Executed Yet</p>
            <p className="max-w-md text-xs text-slate-500">
              When the Dispatcher executes the 15-step heuristics optimizer on pending shipments, all calculated financial and diesel savings will aggregate live on this dashboard.
            </p>
            <Link
              href="/dispatcher/optimize"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              Go to Dispatcher Optimizer
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
