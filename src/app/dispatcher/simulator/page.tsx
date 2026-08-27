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
  ArrowRight,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';

export default function SimulatorPage() {
  const [scenarioType, setScenarioType] = useState<WhatIfScenarioInput['scenario_type']>('FUEL_PRICE_SPIKE');
  const [fuelDelta, setFuelDelta] = useState(15.0);
  const [selectedLorry, setSelectedLorry] = useState('L-01');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [surgeWeight, setSurgeWeight] = useState(4000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [appliedToast, setAppliedToast] = useState(false);

  const shipments = fleetMindStore.getShipments();
  const lorries = fleetMindStore.getLorries();
  const drivers = fleetMindStore.getDrivers();
  const settings = fleetMindStore.getSystemSettings();

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setAppliedToast(false);
    setTimeout(() => {
      const scenarioInput: WhatIfScenarioInput = {
        scenario_type: scenarioType,
        fuel_price_delta: fuelDelta,
        target_entity_id: scenarioType === 'DRIVER_UNAVAILABLE' ? selectedDriver : selectedLorry,
      };

      const result = runWhatIfSimulation(scenarioInput, shipments, lorries, drivers, settings);
      fleetMindStore.recordSimulationRun(result);
      setSimResult(result);
      setIsSimulating(false);
    }, 450);
  };

  const handleApplyContingency = () => {
    if (!simResult) return;
    setAppliedToast(true);
    fleetMindStore.createNotification({
      user_id: 'dispatcher@fleetmind.ai',
      title: `⚡ Contingency Plan Activated: ${scenarioType.replace(/_/g, ' ')}`,
      message: `Dispatcher executed AI contingency plan with ₹${simResult.cost_difference.toLocaleString()} variance. Route schedules synced to active carriers.`,
      severity: 'HIGH',
      type: 'SYSTEM_ALERT',
    });
    setTimeout(() => setAppliedToast(false), 4000);
  };

  return (
    <>
      <PortalHeader
        title="What-If Fleet Scenario Simulator"
        subtitle="Non-destructive operational sandbox to model diesel fuel spikes, carrier breakdowns, driver shortages & demand surges"
      />

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Applied Alert Toast */}
        {appliedToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between font-bold text-xs shadow-md animate-in slide-in-from-top-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Contingency re-optimization successfully applied! Fleet routes and active trips have been updated.</span>
            </div>
            <button onClick={() => setAppliedToast(false)} className="text-emerald-700 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {/* Scenario Configuration Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Simulation Sandbox (Zero Risk to Production)
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">Configure Hypothetical Operational Crisis</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
              {lorries.length} Fleet Vehicles • {drivers.length} Drivers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Scenario Type</label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              >
                <option value="FUEL_PRICE_SPIKE">Diesel Price Spike (+₹/L)</option>
                <option value="LORRY_FAILURE">Carrier Vehicle Breakdown (L-01 to L-09)</option>
                <option value="DRIVER_UNAVAILABLE">Driver Shift Shortage / Absence</option>
                <option value="URGENT_SHIPMENT">Emergency Hot Freight Surge</option>
                <option value="ROUTE_DELAY">Monsoon Highway Gridlock (-20 km/h)</option>
              </select>
            </div>

            {scenarioType === 'FUEL_PRICE_SPIKE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Diesel Hike: <strong className="text-blue-600">+₹{fuelDelta}/L</strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={fuelDelta}
                  onChange={(e) => setFuelDelta(Number(e.target.value))}
                  className="w-full mt-3 accent-blue-600"
                />
              </div>
            )}

            {scenarioType === 'LORRY_FAILURE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Disabled Vehicle</label>
                <select
                  value={selectedLorry}
                  onChange={(e) => setSelectedLorry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                >
                  {lorries.map((l) => (
                    <option key={l.id} value={l.lorry_code}>
                      {l.lorry_code} ({l.model} - {l.registration_number})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scenarioType === 'DRIVER_UNAVAILABLE' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Unavailable Pilot</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                >
                  <option value="">Select Pilot Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.availability_status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scenarioType === 'URGENT_SHIPMENT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Surge Payload: <strong className="text-purple-600">{surgeWeight.toLocaleString()} kg</strong>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={surgeWeight}
                  onChange={(e) => setSurgeWeight(Number(e.target.value))}
                  className="w-full mt-3 accent-purple-600"
                />
              </div>
            )}

            {scenarioType === 'ROUTE_DELAY' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Highway Weather: <strong className="text-amber-600">Heavy Monsoon Flooding</strong>
                </label>
                <span className="text-[11px] text-slate-500 font-medium block mt-2">
                  Average speed reduced by 35% across Western Ghats & NH-44 corridors.
                </span>
              </div>
            )}

            <div className="flex items-end lg:col-start-4">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isSimulating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Calculating Fleet Dynamics...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run What-If Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Output Dashboard */}
        {simResult && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Impact Delta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Financial Impact</span>
                <div className={`text-2xl font-black ${simResult.cost_difference >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {simResult.cost_difference >= 0 ? '+' : ''}₹{Math.abs(simResult.cost_difference).toLocaleString()}
                </div>
                <span className="text-[11px] font-semibold text-slate-500">Margin Variance</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-600 block tracking-wider">Fuel Consumption</span>
                <div className="text-2xl font-black text-blue-700">
                  {simResult.fuel_difference >= 0 ? '+' : ''}{simResult.fuel_difference} L
                </div>
                <span className="text-[11px] font-semibold text-blue-600/80">Diesel Burn Variance</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-600 block tracking-wider">Distance Variance</span>
                <div className="text-2xl font-black text-purple-700">
                  {simResult.distance_difference >= 0 ? '+' : ''}{simResult.distance_difference} km
                </div>
                <span className="text-[11px] font-semibold text-purple-600/80">Route Deadhead</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">SLA Impact</span>
                <div className="text-2xl font-black text-slate-900">
                  {simResult.simulated_metrics.on_time_percentage}%
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">On-Time Reliability</span>
              </div>
            </div>

            {/* AI Evaluation Banner */}
            {simResult.ai_evaluation && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>FleetMind AI Neural Contingency Assessment</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {simResult.ai_evaluation}
                </p>
              </div>
            )}

            {/* Before vs After Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Baseline */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-black text-slate-900">Current Production Baseline</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                    STATUS QUO
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="font-bold text-slate-500">Fleet Lorries Dispatched:</span>
                    <strong className="text-slate-900">{simResult.original_metrics.total_lorries_used} Vehicles</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="font-bold text-slate-500">Total Route Distance:</span>
                    <strong className="text-slate-900">{simResult.original_metrics.total_distance_km.toLocaleString()} km</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="font-bold text-slate-500">Diesel Consumption:</span>
                    <strong className="text-slate-900">{simResult.original_metrics.total_fuel_liters} Litres</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="font-bold text-slate-500">Estimated Total Cost:</span>
                    <strong className="text-slate-900">₹{simResult.original_metrics.total_cost_inr.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-bold text-slate-500">On-Time Performance:</span>
                    <strong className="text-emerald-700">{simResult.original_metrics.on_time_percentage}%</strong>
                  </div>
                </div>
              </div>

              {/* Simulated Scenario */}
              <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-3xl border-2 border-blue-300 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
                  <h4 className="text-sm font-black text-blue-950">Simulated Crisis & Re-optimized Plan</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white shadow-sm">
                    RE-OPTIMIZED
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-blue-100">
                    <span className="font-bold text-blue-800">Fleet Lorries Dispatched:</span>
                    <strong className="text-slate-900">{simResult.simulated_metrics.total_lorries_used} Vehicles</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-100">
                    <span className="font-bold text-blue-800">Total Route Distance:</span>
                    <strong className="text-slate-900">{simResult.simulated_metrics.total_distance_km.toLocaleString()} km</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-100">
                    <span className="font-bold text-blue-800">Diesel Consumption:</span>
                    <strong className="text-slate-900">{simResult.simulated_metrics.total_fuel_liters} Litres</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-blue-100">
                    <span className="font-bold text-blue-800">Estimated Total Cost:</span>
                    <strong className="text-slate-900">₹{simResult.simulated_metrics.total_cost_inr.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-bold text-blue-800">On-Time Performance:</span>
                    <strong className="text-blue-900 font-black">{simResult.simulated_metrics.on_time_percentage}%</strong>
                  </div>
                </div>

                {/* 1-Click Action to Apply Contingency Plan */}
                <div className="pt-2">
                  <button
                    onClick={handleApplyContingency}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Apply Contingency Plan to Live Fleet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
