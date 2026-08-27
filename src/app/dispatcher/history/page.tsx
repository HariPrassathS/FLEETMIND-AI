'use client';

import React, { useState, useEffect } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { OptimizationResult } from '../../../lib/optimization/types';
import { History, TrendingUp, Sparkles, CheckCircle2, Route, Fuel, DollarSign } from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function OptimizationHistoryPage() {
  const [runs, setRuns] = useState<OptimizationResult[]>(fleetMindStore.getOptimizationRuns());

  useEffect(() => {
    const unsub = fleetMindStore.subscribe(() => {
      setRuns(fleetMindStore.getOptimizationRuns());
    });
    return unsub;
  }, []);

  return (
    <>
      <PortalHeader
        title="Optimization Run History"
        subtitle="Auditable record of historical optimization executions, mathematical proofs & cumulative ROI"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {runs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 text-center space-y-3">
            <History className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Optimization Runs Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Execute a run from the Fleet Optimizer to establish your baseline and track historical savings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run, idx) => (
              <div
                key={run.run_id}
                className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Run #{runs.length - idx}</span>
                      <h4 className="text-base font-bold text-slate-900">{run.run_id}</h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        {run.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(run.timestamp).toLocaleString()} • Took {run.execution_time_ms} ms</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Cost Saved</span>
                      <strong className="text-emerald-700 text-sm">₹{run.savings.cost_inr.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel Saved</span>
                      <strong className="text-blue-700 text-sm">{run.savings.fuel_liters} L</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Assignments</span>
                    <p className="font-bold text-slate-900">{run.assignments.length} Routes Generated</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Unassigned</span>
                    <p className="font-bold text-slate-900">{run.unassigned.length} Consignments</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Distance Reduced</span>
                    <p className="font-bold text-indigo-600">{run.savings.distance_km} km ({run.savings.distance_savings_pct}%)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">SLA Compliance</span>
                    <p className="font-bold text-emerald-700">{run.after_metrics.on_time_percentage}% On-Time</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
