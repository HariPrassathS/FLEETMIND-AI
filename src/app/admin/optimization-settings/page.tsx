'use client';

import React, { useState } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { Sliders, CheckCircle2, Sparkles } from 'lucide-react';

export default function AdminOptimizationSettingsPage() {
  const currentSettings = fleetMindStore.getSystemSettings();
  const [weights, setWeights] = useState({
    weight_fuel_cost: currentSettings.weight_fuel_cost,
    weight_distance: currentSettings.weight_distance,
    weight_deadline_risk: currentSettings.weight_deadline_risk,
    weight_capacity_utilization: currentSettings.weight_capacity_utilization,
    weight_vehicle_reduction: currentSettings.weight_vehicle_reduction,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    fleetMindStore.updateSystemSettings({
      weight_fuel_cost: Number(weights.weight_fuel_cost),
      weight_distance: Number(weights.weight_distance),
      weight_deadline_risk: Number(weights.weight_deadline_risk),
      weight_capacity_utilization: Number(weights.weight_capacity_utilization),
      weight_vehicle_reduction: Number(weights.weight_vehicle_reduction),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <PortalHeader
        title="Optimization Objective Weights"
        subtitle="Calibrate multi-objective heuristic trade-offs between direct fuel burn, deadline risk & payload density"
        category="FleetMind AI · Heuristic Weights"
        icon={<Sliders className="w-5 h-5" />}
        accent="purple"
      />

      <main className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {saved && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Optimization weights updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Objective Fitness Calibration
            </h3>
            <p className="text-xs text-slate-500">
              Adjust relative weights (0.0 to 1.0) utilized in scoring candidate lorry assignments
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Fuel Cost Weight:</span>
                <span className="text-blue-700">{weights.weight_fuel_cost}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.weight_fuel_cost}
                onChange={(e) => setWeights({ ...weights, weight_fuel_cost: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Prioritizes high km/L vehicles and minimal fuel burn.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Route Distance Weight:</span>
                <span className="text-blue-700">{weights.weight_distance}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.weight_distance}
                onChange={(e) => setWeights({ ...weights, weight_distance: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Minimizes total circuit distance and deadhead kilometers.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Deadline SLA Risk Penalty:</span>
                <span className="text-blue-700">{weights.weight_deadline_risk}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.weight_deadline_risk}
                onChange={(e) => setWeights({ ...weights, weight_deadline_risk: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Heavily penalizes solutions that risk customer delivery deadlines.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span>Capacity Utilization Bonus:</span>
                <span className="text-blue-700">{weights.weight_capacity_utilization}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={weights.weight_capacity_utilization}
                onChange={(e) => setWeights({ ...weights, weight_capacity_utilization: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <p className="text-[10px] text-slate-400">Rewards dense cargo grouping and multi-stop consolidation.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Update Optimizer Weights
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
