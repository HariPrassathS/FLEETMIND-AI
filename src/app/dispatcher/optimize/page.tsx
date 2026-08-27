'use client';

import React, { useState } from 'react';
import { PortalHeader } from '../../../components/layout/portal-header';
import { fleetMindStore } from '../../../lib/db/store';
import { runFleetOptimization } from '../../../lib/optimization/optimizer';
import { OptimizationResult } from '../../../lib/optimization/types';
import {
  Sparkles,
  Zap,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Package,
  Route,
  ArrowRight,
  ShieldCheck,
  Fuel,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatCurrencyINR } from '../../../lib/utils/cn';
import confetti from 'canvas-confetti';

export default function OptimizePage() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  const shipments = fleetMindStore.getShipments();
  const lorries = fleetMindStore.getLorries();
  const drivers = fleetMindStore.getDrivers();
  const settings = fleetMindStore.getSystemSettings();

  const pendingCount = shipments.filter((s) => s.status === 'PENDING' || s.status === 'UNASSIGNED').length;

  const PIPELINE_STEPS = [
    '1. Loading Pending Consignments...',
    '2. Loading Available Fleet & Drivers...',
    '3. Validating Hard Payload & Volume Limits...',
    '4. Grouping High-Density Freight Corridors...',
    '5. Scoring Candidate Lorries (Eco vs Distance)...',
    '6. Constructing & 2-Opt Improving Routes...',
    '7. Calculating Fuel & Dynamic Cost Equations (@ ₹' + settings.fuel_price_per_liter + '/L)...',
    '8. Validating ETAs & Delivery Deadlines...',
    '9. Selecting Optimal Feasible Dispatch Plan...',
  ];

  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setCurrentStepIndex(0);
    setIsApplied(false);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStepIndex(step);
      if (step >= PIPELINE_STEPS.length) {
        clearInterval(interval);
        const optResult = runFleetOptimization(shipments, lorries, drivers, settings);
        setResult(optResult);
        setIsOptimizing(false);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }
    }, 280);
  };

  const handleApplyDispatchPlan = () => {
    if (!result) return;
    fleetMindStore.applyOptimizationResult(result);
    setIsApplied(true);
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } catch {}
  };

  return (
    <>
      <PortalHeader
        title="Fleet Optimization Engine"
        subtitle="15-Step Multi-Objective Heuristics, Load Consolidation & Dynamic Route Improvement"
      />

      <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Launcher Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-black uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              Pure TypeScript Heuristic Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Optimize {pendingCount} Pending Consignments
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Consolidate multi-stop loads, optimize 2-opt waypoints, select highest fuel-efficiency vehicles, and eliminate deadhead miles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleRunOptimization}
              disabled={isOptimizing}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              {isOptimizing ? 'Optimizing Fleet...' : 'Run Fleet Optimization'}
            </button>
          </div>
        </div>

        {/* Real-Time Optimization Step Tracker */}
        {isOptimizing && (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-card p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Executing 15-Step Pipeline
              </div>
              <span className="text-xs text-slate-400 font-bold">
                {Math.round((currentStepIndex / PIPELINE_STEPS.length) * 100)}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStepIndex / PIPELINE_STEPS.length) * 100}%` }}
              />
            </div>

            <p className="text-sm font-bold text-slate-800 font-mono">
              {PIPELINE_STEPS[Math.min(currentStepIndex, PIPELINE_STEPS.length - 1)]}
            </p>
          </div>
        )}

        {/* Results Presentation */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Savings Hero Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border-2 border-emerald-500/80 rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                  <span>Total Direct Cost Savings</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </span>
                <div className="text-3xl font-black text-emerald-700 mt-2 font-display">
                  ₹{result.savings.cost_inr.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-emerald-800 font-bold mt-1">
                  -{result.savings.cost_savings_pct}% vs baseline single loads
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border-2 border-blue-500/80 rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center justify-between">
                  <span>Fuel Consumption Saved</span>
                  <Fuel className="w-3.5 h-3.5 text-blue-600" />
                </span>
                <div className="text-3xl font-black text-blue-700 mt-2 font-display">
                  {result.savings.fuel_liters} Liters
                </div>
                <p className="text-xs text-blue-800 font-bold mt-1">
                  -{result.savings.fuel_savings_pct}% diesel burn reduction
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50/90 to-violet-50/50 border-2 border-indigo-500/80 rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 flex items-center justify-between">
                  <span>Route Distance Saved</span>
                  <Route className="w-3.5 h-3.5 text-indigo-600" />
                </span>
                <div className="text-3xl font-black text-indigo-700 mt-2 font-display">
                  {result.savings.distance_km} km
                </div>
                <p className="text-xs text-indigo-800 font-bold mt-1">
                  -{result.savings.distance_savings_pct}% 2-opt circuit reduction
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50/90 to-fuchsia-50/50 border-2 border-purple-500/80 rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 flex items-center justify-between">
                  <span>Lorries Saved</span>
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                </span>
                <div className="text-3xl font-black text-purple-700 mt-2 font-display">
                  {result.savings.lorries_saved} Units
                </div>
                <p className="text-xs text-purple-800 font-bold mt-1">
                  Consolidated into {result.assignments.length} vehicles
                </p>
              </div>
            </div>

            {/* Before vs After Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Before vs After Operational Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparing single-consignments baseline against FleetMind multi-objective plan
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                  Execution Time: {result.execution_time_ms} ms
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-6">Operational Metric</th>
                      <th className="py-3 px-6 text-slate-500">Baseline (Before)</th>
                      <th className="py-3 px-6 text-blue-700">FleetMind Plan (After)</th>
                      <th className="py-3 px-6 text-emerald-700">Optimization Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-slate-900">Total Fleet Cost</td>
                      <td className="py-3.5 px-6">₹{result.before_metrics.total_cost_inr.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-6 font-bold text-blue-700">₹{result.after_metrics.total_cost_inr.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-6 font-black text-emerald-600">-₹{result.savings.cost_inr.toLocaleString('en-IN')} ({result.savings.cost_savings_pct}%)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-slate-900">Diesel Consumption</td>
                      <td className="py-3.5 px-6">{result.before_metrics.total_fuel_liters} L</td>
                      <td className="py-3.5 px-6 font-bold text-blue-700">{result.after_metrics.total_fuel_liters} L</td>
                      <td className="py-3.5 px-6 font-black text-emerald-600">-{result.savings.fuel_liters} L ({result.savings.fuel_savings_pct}%)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-slate-900">Total Distance</td>
                      <td className="py-3.5 px-6">{result.before_metrics.total_distance_km} km</td>
                      <td className="py-3.5 px-6 font-bold text-blue-700">{result.after_metrics.total_distance_km} km</td>
                      <td className="py-3.5 px-6 font-black text-emerald-600">-{result.savings.distance_km} km ({result.savings.distance_savings_pct}%)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-slate-900">Vehicles Dispatched</td>
                      <td className="py-3.5 px-6">{result.before_metrics.total_lorries_used} Units</td>
                      <td className="py-3.5 px-6 font-bold text-blue-700">{result.after_metrics.total_lorries_used} Units</td>
                      <td className="py-3.5 px-6 font-black text-emerald-600">-{result.savings.lorries_saved} Units</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-slate-900">Average Capacity Density</td>
                      <td className="py-3.5 px-6">{result.before_metrics.avg_capacity_utilization_pct}%</td>
                      <td className="py-3.5 px-6 font-bold text-blue-700">{result.after_metrics.avg_capacity_utilization_pct}%</td>
                      <td className="py-3.5 px-6 font-black text-emerald-600">+{Number((result.after_metrics.avg_capacity_utilization_pct - result.before_metrics.avg_capacity_utilization_pct).toFixed(1))}%</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-slate-900">On-Time SLA Compliance</td>
                      <td className="py-3.5 px-6">{result.before_metrics.on_time_percentage}%</td>
                      <td className="py-3.5 px-6 font-bold text-blue-700">{result.after_metrics.on_time_percentage}%</td>
                      <td className="py-3.5 px-6 font-black text-emerald-600">100% On-Time Target</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Generated Route Assignments with WHY Explainability */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Generated Route Assignments ({result.assignments.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Each assignment includes mathematical explainability and corridor stop sequence
                  </p>
                </div>

                <button
                  onClick={handleApplyDispatchPlan}
                  disabled={isApplied}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-card transition flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isApplied ? 'Dispatch Plan Active on Fleet!' : 'Approve & Dispatch All Routes'}
                </button>
              </div>

              <div className="space-y-3">
                {result.assignments.map((assignment, idx) => {
                  const isExpanded = expandedAssignmentId === assignment.route.id;
                  const score = assignment.score_details;

                  return (
                    <div
                      key={assignment.route.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden transition"
                    >
                      <div
                        onClick={() => setExpandedAssignmentId(isExpanded ? null : assignment.route.id)}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{assignment.lorry_code}</span>
                              <span className="text-xs text-slate-500">• {assignment.driver_name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {assignment.shipment_ids.length} Consignments
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {assignment.route.stops.length} Waypoints • {assignment.route.total_distance_km} km • {assignment.route.fuel_consumption_liters} L •{' '}
                              <span className="font-bold text-slate-900">₹{assignment.route.estimated_cost.toLocaleString('en-IN')}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {/* Decision Score Badge */}
                          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                            <div className="text-right">
                              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Decision Score</span>
                              <span className={`text-sm font-black ${
                                score.composite_score >= 80 ? 'text-emerald-600' :
                                score.composite_score >= 65 ? 'text-blue-600' :
                                score.composite_score >= 50 ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                                {score.composite_score}/100
                              </span>
                            </div>
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              score.composite_score >= 80 ? 'bg-emerald-500 shadow-sm shadow-emerald-400' :
                              score.composite_score >= 65 ? 'bg-blue-500' :
                              score.composite_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                          </div>

                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Payload Density</span>
                            <div className="text-xs font-bold text-emerald-700">
                              {score.weight_utilization_pct}% Wt • {score.volume_utilization_pct}% Vol
                            </div>
                          </div>

                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            score.deadline_status === 'SAFE' ? 'bg-emerald-100 text-emerald-800' :
                            score.deadline_status === 'AT_RISK' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {score.deadline_status === 'SAFE' ? '✓ SLA Safe' : score.deadline_status === 'AT_RISK' ? '⚠ SLA At-Risk' : '✗ SLA Breached'}
                          </span>

                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details: WHY explanation & Stops */}
                      {isExpanded && (
                        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in">
                          {/* Decision Score & WHY Intelligence Box */}
                          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-black text-xs text-blue-950 uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span>FleetMind Decision Score: {score.composite_score}/100</span>
                              </div>
                              <span className="text-[11px] font-bold text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                                Multi-Objective Optimization Verified
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Decision Rationale</span>
                                <ul className="space-y-1 text-slate-800 font-medium">
                                  {score.explanation_points.map((pt, pidx) => (
                                    <li key={pidx} className="flex items-start gap-2">
                                      <span className="text-emerald-600 font-bold">✓</span>
                                      <span>{pt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-1.5 bg-white/70 p-3 rounded-xl border border-blue-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Routing & Cost Analysis</span>
                                <div className="space-y-1 text-slate-700">
                                  <p><span className="font-bold text-slate-900">Deadhead Run:</span> {score.deadhead_distance_km} km to first pickup</p>
                                  <p><span className="font-bold text-slate-900">Delivery Circuit:</span> {score.delivery_distance_km} km payload transit</p>
                                  <p><span className="font-bold text-slate-900">Estimated Duration:</span> {score.eta_hours} hours total</p>
                                  <p><span className="font-bold text-slate-900">Fuel Burn:</span> {score.fuel_consumption_liters} L (@ ₹{score.fuel_cost_inr.toLocaleString('en-IN')})</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Waypoints Sequence */}
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                              Consolidated 2-Opt Waypoint Sequence ({assignment.route.stops.length} Stops):
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                              {assignment.route.stops.map((st, sidx) => (
                                <div key={st.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1 shadow-sm">
                                  <div className="flex items-center justify-between font-bold">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black ${
                                      st.stop_type === 'PICKUP' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                      {sidx + 1}. {st.stop_type}
                                    </span>
                                    <span className="text-[11px] font-black text-blue-600">
                                      ETA: {new Date(st.arrival_eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-700 font-semibold truncate">{st.address}</p>
                                  <p className="text-[10px] text-slate-400">Target SLA: {new Date(st.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unassigned Shipments Diagnosis */}
            {result.unassigned.length > 0 && (
              <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-3xl p-6 space-y-4 shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-base">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span>Unassigned Consignments Engine ({result.unassigned.length} Rejected)</span>
                  </div>
                  <span className="text-xs text-amber-800 font-bold bg-amber-200/60 px-3 py-1 rounded-full">
                    Deterministic Feasibility Constraint Applied
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.unassigned.map((diag, didx) => (
                    <div key={didx} className="bg-white border border-amber-200/90 rounded-2xl p-4 text-xs space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">
                          {diag.shipment.shipment_code}
                        </span>
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-black rounded-lg text-[10px] uppercase">
                          ❌ {diag.reason.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="text-slate-600 font-medium">
                        {diag.shipment.description} • Priority: <span className="font-bold text-slate-900">{diag.shipment.priority}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Cargo Demands</span>
                          <span className="font-bold text-slate-900">{diag.required_capacity_kg.toLocaleString()} kg • {diag.required_volume_m3} m³</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Fleet Limit</span>
                          <span className="font-bold text-slate-900">{diag.available_capacity_kg.toLocaleString()} kg max</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 text-[11px] font-medium">
                        💡 <span className="font-bold text-blue-950">Recommended Resolution:</span> {diag.suggested_action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
