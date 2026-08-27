'use client';

import React, { useState } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { runWhatIfSimulation } from '../../../lib/optimization/reoptimizer';
import { SimulationResult, WhatIfScenarioInput } from '../../../lib/optimization/types';
import {
  Sliders,
  Play,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Fuel,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function SimulatorPage() {
  const [scenarioType, setScenarioType] = useState<WhatIfScenarioInput['scenario_type']>('FUEL_PRICE_SPIKE');
  const [fuelDelta, setFuelDelta] = useState(15.0);
  const [selectedLorry, setSelectedLorry] = useState('L-11');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const shipments = fleetMindStore.getShipments();
  const lorries = fleetMindStore.getLorries();
  const drivers = fleetMindStore.getDrivers();
  const settings = fleetMindStore.getSystemSettings();

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const scenarioInput: WhatIfScenarioInput = {
        scenario_type: scenarioType,
        fuel_price_delta: fuelDelta,
        target_entity_id: selectedLorry,
      };

      const result = runWhatIfSimulation(scenarioInput, shipments, lorries, drivers, settings);
      fleetMindStore.recordSimulationRun(result);
      setSimResult(result);
      setIsSimulating(false);
    }, 400);
  };

  return (
    <>
      <PortalHeader
        title="What-If Fleet Scenario Simulator"
        subtitle="Non-destructive operational sandbox to model fuel spikes, vehicle failures & demand surges"
      />

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Scenario Configuration Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Simulation Sandbox (Never Mutates Production Data)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Configure Hypothetical Scenario</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Scenario Type</label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="FUEL_PRICE_SPIKE">Diesel Price Spike (+₹/L)</option>
                <option value="LORRY_FAILURE">Lorry Mechanical Failure</option>
                <option value="DRIVER_UNAVAILABLE">Driver Shift Shortfall</option>
                <option value="URGENT_SHIPMENT">Emergency Hot Freight Surge</option>
                <option value="ROUTE_DELAY">Highway Gridlock Delay (-15 km/h)</option>
              </select>
            </div>

            {scenarioType === 'FUEL_PRICE_SPIKE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Fuel Increase (₹/L): +₹{fuelDelta}
                </label>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={fuelDelta}
                  onChange={(e) => setFuelDelta(Number(e.target.value))}
                  className="w-full mt-2 accent-blue-600"
                />
              </div>
            )}

            {scenarioType === 'LORRY_FAILURE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Target Vehicle</label>
                <select
                  value={selectedLorry}
                  onChange={(e) => setSelectedLorry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {lorries.map((l) => (
                    <option key={l.id} value={l.lorry_code}>
                      {l.lorry_code} ({l.model})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end lg:col-start-4">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                {isSimulating ? 'Simulating Scenario...' : 'Execute What-If Model'}
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Output Card */}
        {simResult && (
          <div className="space-y-6 animate-in fade-in">
            {/* Diff Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cost Delta</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {simResult.cost_difference >= 0
                    ? `+₹${simResult.cost_difference.toLocaleString('en-IN')}`
                    : `-₹${Math.abs(simResult.cost_difference).toLocaleString('en-IN')}`}
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Base: ₹{simResult.original_metrics.total_cost_inr.toLocaleString('en-IN')} → Sim: ₹{simResult.simulated_metrics.total_cost_inr.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fuel Burn Variance</span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {simResult.fuel_difference > 0 ? `+${simResult.fuel_difference}` : simResult.fuel_difference} Liters
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Base: {simResult.original_metrics.total_fuel_liters} L → Sim: {simResult.simulated_metrics.total_fuel_liters} L
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">SLA & Deadline Impact</span>
                <div className="text-base font-bold text-emerald-700 mt-1">{simResult.deadline_impact}</div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  On-Time Rate: {simResult.simulated_metrics.on_time_percentage}%
                </p>
              </div>
            </div>

            {/* AI Evaluation Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>FleetMind AI Scenario Evaluation:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono">
                {simResult.ai_evaluation}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
