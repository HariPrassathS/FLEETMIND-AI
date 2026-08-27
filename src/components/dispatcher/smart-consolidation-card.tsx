'use client';

import React, { useState, useEffect } from 'react';
import {
  ConsolidationAnalysisResult,
  ConsolidationOption,
  Shipment,
} from '../../lib/optimization/types';
import type { VehicleRecommendationResult, VehicleRankEntry } from '../../lib/ai/groq';
import {
  Sparkles,
  Truck,
  User,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  IndianRupee,
  Layers,
  Scale,
  Clock,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Bot,
  Zap,
  Trophy,
  Medal,
  Timer,
  Gauge,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { VehicleAvatar } from '../brand/vehicle-avatar';
import { TruckCapacityVisual } from '../brand/truck-capacity-visual';

interface SmartConsolidationCardProps {
  analysis: ConsolidationAnalysisResult;
  onApplyOption: (option: ConsolidationOption) => void;
  onCancel?: () => void;
  isApplying?: boolean;
}

export function SmartConsolidationCard({
  analysis,
  onApplyOption,
  onCancel,
  isApplying = false,
}: SmartConsolidationCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    analysis.recommended_option.option_id
  );
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<VehicleRecommendationResult | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  const selectedOption: ConsolidationOption =
    analysis.all_options.find((o) => o.option_id === selectedOptionId) ||
    analysis.recommended_option;

  const isRecommended = selectedOption.option_id === analysis.recommended_option.option_id;
  const isConsolidation = selectedOption.decision_type === 'ADD_TO_EXISTING_TRIP';

  // Auto-fetch AI vehicle recommendation on mount
  const fetchAiRecommendation = async () => {
    setIsLoadingRec(true);
    setRecError(null);
    try {
      const res = await fetch('/api/ai/recommend-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment: analysis.shipment,
          candidates: analysis.all_options,
        }),
      });
      if (res.ok) {
        const data: VehicleRecommendationResult = await res.json();
        setAiRecommendation(data);
        // Auto-select top AI-recommended vehicle in candidate grid
        if (data.top_lorry_code) {
          const topOpt = analysis.all_options.find(
            (o) => o.lorry.lorry_code === data.top_lorry_code
          );
          if (topOpt) setSelectedOptionId(topOpt.option_id);
        }
      } else {
        setRecError('AI recommendation unavailable');
      }
    } catch {
      setRecError('AI recommendation unavailable');
    } finally {
      setIsLoadingRec(false);
    }
  };

  useEffect(() => {
    fetchAiRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.shipment.id]);

  // Fetch AI explanation on demand
  const handleFetchAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CONSOLIDATION',
          shipmentCode: analysis.shipment.shipment_code,
          pickupCity: analysis.shipment.pickup_city,
          destinationCity: analysis.shipment.destination_city,
          weightKg: analysis.shipment.weight_kg,
          volumeM3: analysis.shipment.volume_m3,
          decisionType: selectedOption.decision_type,
          lorryCode: selectedOption.lorry.lorry_code,
          driverName: selectedOption.driver?.name,
          existingCorridor: selectedOption.existing_corridor,
          additionalDistanceKm: selectedOption.additional_distance_km,
          additionalTimeMinutes: selectedOption.additional_time_minutes,
          additionalFuelLiters: selectedOption.additional_fuel_liters,
          netSavingsInr: selectedOption.net_savings_inr,
          projectedWeightUtilPct: selectedOption.projected_weight_util_pct,
          reasons: selectedOption.reasons,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation);
      }
    } catch {
      setAiExplanation(
        `FleetMind recommends consolidating ${analysis.shipment.shipment_code} onto carrier ${selectedOption.lorry.lorry_code} to save ₹${selectedOption.net_savings_inr.toLocaleString()} with only +${selectedOption.additional_distance_km} km detour.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-3.5 h-3.5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-3.5 h-3.5 text-orange-400" />;
    return <span className="text-[10px] font-black text-slate-400">#{rank}</span>;
  };

  const slackColor = (mins: number) => {
    if (mins >= 480) return 'text-emerald-600';
    if (mins >= 120) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-4">

      {/* AI Vehicle Recommendation Panel */}
      <div className="rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-mono tracking-widest text-indigo-300 uppercase">Groq LPU · llama-3.3-70b</p>
              <h3 className="text-sm font-black text-white leading-tight">AI Vehicle Recommendation</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchAiRecommendation}
            disabled={isLoadingRec}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white disabled:opacity-50"
            title="Refresh AI recommendation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRec ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {isLoadingRec && (
            <div className="space-y-2.5 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl" />
              ))}
              <div className="h-10 bg-white/5 rounded-2xl" />
            </div>
          )}

          {recError && !isLoadingRec && (
            <p className="text-xs text-slate-400 font-medium text-center py-3">{recError}</p>
          )}

          {aiRecommendation && !isLoadingRec && (
            <>
              {/* Ranked Vehicle Cards */}
              <div className="space-y-2">
                {aiRecommendation.ranked.map((entry: VehicleRankEntry) => {
                  const isTopPick = entry.rank === 1;
                  const isConsolidationEntry = entry.decision_type === 'ADD_TO_EXISTING_TRIP';
                  return (
                    <div
                      key={entry.lorry_code}
                      className={`rounded-2xl border p-3.5 transition-all ${
                        isTopPick
                          ? 'border-amber-400/50 bg-gradient-to-r from-amber-950/60 to-indigo-950/60 shadow-lg shadow-amber-500/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {/* Rank Row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-lg ${
                            isTopPick ? 'bg-amber-400/20' : 'bg-white/10'
                          }`}>
                            {rankIcon(entry.rank)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-sm font-black ${ isTopPick ? 'text-amber-300' : 'text-white/90'}`}>
                                {entry.lorry_code}
                              </span>
                              {isTopPick && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> AI Best Pick
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                isConsolidationEntry
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {isConsolidationEntry ? 'Consolidate' : 'Dedicated'}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/60 font-medium mt-0.5 leading-snug">{entry.headline}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-white/50 font-mono shrink-0">{entry.score}/100</span>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2.5">
                        <div className="bg-white/5 rounded-xl px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Fuel className="w-3 h-3 text-blue-400" />
                          </div>
                          <div className="text-[11px] font-black text-white">{entry.fuel_efficiency_km_per_l}</div>
                          <div className="text-[9px] text-white/40">km/L</div>
                        </div>
                        <div className="bg-white/5 rounded-xl px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <IndianRupee className="w-3 h-3 text-emerald-400" />
                          </div>
                          <div className="text-[11px] font-black text-white">{entry.cost_per_km_inr}</div>
                          <div className="text-[9px] text-white/40">/km</div>
                        </div>
                        <div className="bg-white/5 rounded-xl px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <MapPin className="w-3 h-3 text-orange-400" />
                          </div>
                          <div className="text-[11px] font-black text-white">{entry.deadhead_km}</div>
                          <div className="text-[9px] text-white/40">deadhd km</div>
                        </div>
                        <div className="bg-white/5 rounded-xl px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Timer className="w-3 h-3 text-purple-400" />
                          </div>
                          <div className={`text-[11px] font-black ${slackColor(entry.deadline_slack_mins)}`}>
                            {entry.deadline_slack_mins >= 0 ? '+' : ''}{Math.round(entry.deadline_slack_mins / 60)}h
                          </div>
                          <div className="text-[9px] text-white/40">SLA slack</div>
                        </div>
                        <div className="bg-white/5 rounded-xl px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <BarChart3 className="w-3 h-3 text-cyan-400" />
                          </div>
                          <div className="text-[11px] font-black text-white">{entry.load_pct}%</div>
                          <div className="text-[9px] text-white/40">load</div>
                        </div>
                        <div className="bg-white/5 rounded-xl px-2 py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <IndianRupee className="w-3 h-3 text-rose-400" />
                          </div>
                          <div className="text-[11px] font-black text-white">₹{(entry.total_cost_inr / 1000).toFixed(1)}k</div>
                          <div className="text-[9px] text-white/40">trip cost</div>
                        </div>
                      </div>

                      {/* AI Reason */}
                      <p className="text-[11px] text-white/65 font-medium leading-relaxed border-t border-white/10 pt-2">
                        {entry.reason}
                      </p>

                      {/* Net savings pill */}
                      {entry.net_savings_inr > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <TrendingDown className="w-3 h-3" /> Save ₹{entry.net_savings_inr.toLocaleString()} vs fresh dispatch
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Executive Summary */}
              {aiRecommendation.summary && (
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">AI Executive Summary</span>
                  </div>
                  <p className="text-xs text-white/70 font-medium leading-relaxed">{aiRecommendation.summary}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 1. Header Recommendation Banner */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isConsolidation
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-emerald-500/40 text-white shadow-xl'
            : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-blue-500/40 text-white shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                isConsolidation ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
            >
              {isConsolidation ? <Zap className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase">
                  FLEETMIND AI OPTIMIZATION ENGINE
                </span>
                {isRecommended && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Best Choice
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {isConsolidation
                  ? `RECOMMENDED: CONSOLIDATE INTO EXISTING TRIP (${selectedOption.lorry.lorry_code})`
                  : `RECOMMENDED: DISPATCH DEDICATED CARRIER (${selectedOption.lorry.lorry_code})`}
              </h3>
            </div>
          </div>

          {selectedOption.net_savings_inr > 0 && (
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 text-right shrink-0">
              <span className="text-[9px] text-emerald-200 uppercase font-bold block">Estimated Savings</span>
              <strong className="text-sm font-black text-emerald-300">
                ₹{selectedOption.net_savings_inr.toLocaleString()}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* 2. Candidate Selection Tabs */}
      {analysis.all_options.length > 1 && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Evaluated Fleet Options ({analysis.all_options.length} Candidates Analyzed):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {analysis.all_options.map((opt) => {
              const isSelected = opt.option_id === selectedOptionId;
              const isOptConsolidation = opt.decision_type === 'ADD_TO_EXISTING_TRIP';

              return (
                <button
                  key={opt.option_id}
                  type="button"
                  onClick={() => {
                    setSelectedOptionId(opt.option_id);
                    setAiExplanation(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/30 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar: Code, Mileage, Per-KM Rate, Score */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900">{opt.lorry.lorry_code}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {opt.fuel_efficiency_km_per_l} km/L
                      </span>
                      <span className="text-[9px] font-bold text-slate-500">
                        ₹{opt.cost_per_km_inr}/km
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {opt.deterministic_score}/100
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium truncate">
                    {opt.lorry.model}
                  </p>

                  {/* Compact Clean Side-View Truck Visual (No Green Badges) */}
                  <div className="w-full max-w-[200px] mx-auto py-0.5 opacity-95">
                    <TruckCapacityVisual
                      lorry={opt.lorry}
                      newShipment={{
                        weight_kg: analysis.shipment.weight_kg,
                        volume_m3: analysis.shipment.volume_m3,
                      }}
                      showTopBadge={false}
                      showMetrics={false}
                    />
                  </div>

                  {/* Clean Text: Capacity & Corridor */}
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between border-t border-slate-100 pt-1">
                    <span>
                      Load: <strong className="text-slate-800 font-bold">{opt.projected_volume_util_pct}%</strong> ({opt.projected_weight_kg.toLocaleString()} kg)
                    </span>
                    <span className="text-slate-400">
                      Free: {opt.remaining_weight_kg.toLocaleString()} kg
                    </span>
                  </div>

                  {/* Bottom Line: Distance & Calculated Cost */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-bold">
                    <span className="text-slate-600">
                      {isOptConsolidation ? `+${opt.additional_distance_km} km detour` : `${opt.projected_route_distance_km} km total`}
                    </span>
                    <span className={opt.net_savings_inr > 0 ? 'text-emerald-700 font-black' : 'text-slate-900 font-black'}>
                      {opt.net_savings_inr > 0 ? `Save ₹${opt.net_savings_inr.toLocaleString()}` : `₹${opt.incremental_cost_inr.toLocaleString()}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Detailed Selected Option Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-5">
        {/* Carrier & Pilot Profile with Mileage & Per-KM Cost */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <VehicleAvatar
              src={selectedOption.lorry.image_url}
              lorryCode={selectedOption.lorry.lorry_code}
              model={selectedOption.lorry.model}
              isRefrigerated={selectedOption.lorry.is_refrigerated}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black text-slate-900">{selectedOption.lorry.lorry_code}</h4>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {selectedOption.lorry.registration_number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                  Mileage: {selectedOption.fuel_efficiency_km_per_l} km/L
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                  Running Rate: ₹{selectedOption.cost_per_km_inr} / km
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Pilot: <strong className="text-slate-800">{selectedOption.driver?.name || 'Assigned Commercial Driver'}</strong> • Status:{' '}
                <span className="text-emerald-600 font-bold uppercase">{selectedOption.lorry.status}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl text-xs space-y-0.5 border border-slate-100 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Operation Type</span>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>{selectedOption.existing_corridor}</span>
            </div>
          </div>
        </div>

        {/* 4. Realistic Side-View Truck Capacity Visualizer with Projected Consignment Fill */}
        <div className="space-y-2">
          <TruckCapacityVisual
            lorry={selectedOption.lorry}
            newShipment={{
              weight_kg: analysis.shipment.weight_kg,
              volume_m3: analysis.shipment.volume_m3,
            }}
            mode="detailed"
            isSelected={true}
          />
        </div>

        {/* 5. Metrics & Detour Comparison Grid with Mileage, Distance & Calculated Cost */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {selectedOption.is_existing_trip ? 'Extra Detour' : 'Trip Distance'}
            </span>
            <strong className="text-sm font-black text-slate-900">
              {selectedOption.is_existing_trip
                ? `+${selectedOption.additional_distance_km} km`
                : `${selectedOption.projected_route_distance_km} km`}
            </strong>
            <span className="text-[10px] text-slate-500 block">
              {selectedOption.deadhead_distance_km
                ? `${selectedOption.deadhead_distance_km} km deadhead`
                : `+${selectedOption.additional_time_minutes} mins`}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel Consumption</span>
            <strong className="text-sm font-black text-slate-900">
              {selectedOption.additional_fuel_liters} L Diesel
            </strong>
            <span className="text-[10px] text-slate-500 block">@ {selectedOption.fuel_efficiency_km_per_l} km/L (₹{selectedOption.additional_fuel_cost_inr.toLocaleString()})</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Calculated Cost</span>
            <strong className="text-sm font-black text-slate-900">
              ₹{selectedOption.incremental_cost_inr.toLocaleString()}
            </strong>
            <span className="text-[10px] text-slate-500 block">
              @ ₹{selectedOption.cost_per_km_inr}/km {selectedOption.is_existing_trip ? '(Incremental)' : '+ Dispatch'}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 uppercase font-bold block">Net Savings</span>
            <strong className="text-sm font-black text-emerald-700">
              ₹{selectedOption.net_savings_inr.toLocaleString()}
            </strong>
            <span className="text-[10px] text-emerald-600 block font-bold">
              {selectedOption.net_savings_inr > 0 ? 'Consolidation Saved' : 'Direct Dispatch Rate'}
            </span>
          </div>
        </div>

        {/* 6. Why This Choice? (Reasons Checklist) */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
            Why FleetMind Recommends This:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedOption.reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs font-bold text-emerald-950 flex items-center gap-2"
              >
                <span>{reason}</span>
              </div>
            ))}
            {selectedOption.warning_reasons.map((warn, idx) => (
              <div
                key={`warn-${idx}`}
                className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 flex items-center gap-2"
              >
                <span>{warn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. AI Explanation Section */}
        {aiExplanation ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>FleetMind AI Copilot Analysis</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{aiExplanation}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFetchAiExplanation}
            disabled={isLoadingAi}
            className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span>{isLoadingAi ? 'Synthesizing AI Analysis...' : 'Ask FleetMind AI Copilot to Explain'}</span>
          </button>
        )}

        {/* 8. Dispatcher Confirmation Action Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-2xl transition"
            >
              Back to Shipments
            </button>
          )}

          <div className="flex items-center gap-2.5 sm:ml-auto w-full sm:w-auto">
            <button
              type="button"
              disabled={isApplying}
              onClick={() => onApplyOption(selectedOption)}
              className={`w-full sm:w-auto px-6 py-3.5 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl transition flex items-center justify-center gap-2 ${
                isConsolidation
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
              }`}
            >
              {isConsolidation ? <Zap className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
              <span>
                {isApplying
                  ? 'Confirming Allocation...'
                  : isConsolidation
                  ? `CONFIRM: ADD TO ${selectedOption.lorry.lorry_code} ACTIVE TRIP`
                  : `CONFIRM: DISPATCH ${selectedOption.lorry.lorry_code}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
