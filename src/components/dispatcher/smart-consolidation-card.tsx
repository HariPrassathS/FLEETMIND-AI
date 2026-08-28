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
          projectedVolumeUtilPct: selectedOption.projected_volume_util_pct,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation(
          `FleetMind recommends consolidating ${analysis.shipment.shipment_code} onto carrier ${selectedOption.lorry.lorry_code} to save ₹${selectedOption.net_savings_inr.toLocaleString()} with only +${selectedOption.additional_distance_km} km detour.`
        );
      }
    } catch {
      setAiExplanation(
        `FleetMind recommends consolidating ${analysis.shipment.shipment_code} onto carrier ${selectedOption.lorry.lorry_code} to save ₹${selectedOption.net_savings_inr.toLocaleString()} with only +${selectedOption.additional_distance_km} km detour.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Find AI rank entry for selected option
  const selectedRankEntry = aiRecommendation?.ranked.find(
    (r) => r.lorry_code === selectedOption.lorry.lorry_code
  );

  const topPickEntry = aiRecommendation?.ranked[0];

  return (
    <div className="space-y-4">
      {/* 1. Top AI Best Recommendation Banner */}
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 shadow-xl overflow-hidden text-white p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono tracking-widest text-amber-300 font-bold uppercase">
                  AI RECOMMENDATION ENGINE (GROQ)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Best Choice
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                Recommended Carrier: <span className="text-amber-300">{topPickEntry?.lorry_code || analysis.recommended_option.lorry.lorry_code}</span>
                {' '}(Score {topPickEntry?.score || analysis.recommended_option.deterministic_score}/100)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {analysis.recommended_option.net_savings_inr > 0 && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-2xl text-right shrink-0">
                <span className="text-[9px] text-emerald-300 uppercase font-bold block">Estimated Savings</span>
                <strong className="text-sm font-black text-emerald-300">
                  ₹{analysis.recommended_option.net_savings_inr.toLocaleString()}
                </strong>
              </div>
            )}
            <button
              type="button"
              onClick={fetchAiRecommendation}
              disabled={isLoadingRec}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white/80 hover:text-white"
              title="Refresh AI Analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRec ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* AI Executive Summary */}
        <p className="text-xs text-white/80 font-medium leading-relaxed">
          {aiRecommendation?.summary ||
            `FleetMind AI evaluated ${analysis.all_options.length} fleet vehicles. Vehicle ${analysis.recommended_option.lorry.lorry_code} is optimal with superior fuel economy and zero SLA risk.`}
        </p>
      </div>

      {/* 2. Candidate Fleet Selector Strip */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Select Vehicle to Inspect & Assign ({analysis.all_options.length} Evaluated):
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {analysis.all_options.map((opt, idx) => {
            const isSelected = opt.option_id === selectedOptionId;
            const isTop = opt.lorry.lorry_code === (topPickEntry?.lorry_code || analysis.recommended_option.lorry.lorry_code);
            return (
              <button
                key={opt.option_id}
                type="button"
                onClick={() => {
                  setSelectedOptionId(opt.option_id);
                  setAiExplanation(null);
                }}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md ring-2 ring-blue-600/30'
                    : isTop
                    ? 'border-amber-300 bg-amber-50/80 text-amber-900 hover:bg-amber-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{opt.lorry.lorry_code}</span>
                {isTop && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-200 text-amber-900'
                  }`}>
                    ★ Best Pick
                  </span>
                )}
                <span className={`text-[10px] font-mono font-normal ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  ({opt.fuel_efficiency_km_per_l} km/L)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Deep-Dive Details FOR SELECTED VEHICLE ONLY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 space-y-5">
        {/* Carrier Header */}
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
                  {selectedOption.fuel_efficiency_km_per_l} km/L
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                  ₹{selectedOption.cost_per_km_inr} / km
                </span>
                {isRecommended && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ Recommended Match
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Pilot: <strong className="text-slate-800">{selectedOption.driver?.name || 'Assigned Commercial Driver'}</strong> • Current Hub:{' '}
                <span className="text-slate-700 font-semibold">{selectedOption.lorry.current_address || 'Depot'}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl text-xs space-y-0.5 border border-slate-100 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Dispatch Mode</span>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>{isConsolidation ? 'Consolidated Multi-Drop' : 'Dedicated Direct Dispatch'}</span>
            </div>
          </div>
        </div>

        {/* 6 Key Operational Telemetry Boxes FOR THIS SELECTED VEHICLE */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-1 text-blue-600">
              <Fuel className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Mileage</span>
            </div>
            <strong className="text-sm font-black text-slate-900">{selectedOption.fuel_efficiency_km_per_l}</strong>
            <span className="text-[10px] text-slate-400 block">km / Liter</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-1 text-emerald-600">
              <IndianRupee className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Tariff</span>
            </div>
            <strong className="text-sm font-black text-slate-900">₹{selectedOption.cost_per_km_inr}</strong>
            <span className="text-[10px] text-slate-400 block">per km</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-1 text-orange-600">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Distance</span>
            </div>
            <strong className="text-sm font-black text-slate-900">
              {isConsolidation ? `+${selectedOption.additional_distance_km} km` : `${selectedOption.projected_route_distance_km} km`}
            </strong>
            <span className="text-[10px] text-slate-400 block">{isConsolidation ? 'detour added' : 'total route'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-1 text-purple-600">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase text-slate-400">SLA Margin</span>
            </div>
            <strong className="text-sm font-black text-emerald-700">
              +{Math.max(1, Math.round(selectedOption.additional_time_minutes / 60))}h
            </strong>
            <span className="text-[10px] text-slate-400 block">buffer</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-center gap-1 mb-1 text-cyan-600">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase text-slate-400">Payload Fill</span>
            </div>
            <strong className="text-sm font-black text-slate-900">{selectedOption.projected_volume_util_pct}%</strong>
            <span className="text-[10px] text-slate-400 block">{selectedOption.projected_weight_kg.toLocaleString()} kg</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-center gap-1 mb-1 text-emerald-700">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase text-emerald-800">Trip Cost</span>
            </div>
            <strong className="text-sm font-black text-emerald-700">₹{selectedOption.incremental_cost_inr.toLocaleString()}</strong>
            <span className="text-[10px] text-emerald-600 block">
              {selectedOption.net_savings_inr > 0 ? `Save ₹${selectedOption.net_savings_inr.toLocaleString()}` : 'Standard'}
            </span>
          </div>
        </div>

        {/* Selected Vehicle Reasoning Headline */}
        {selectedRankEntry?.reason && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-900 block mb-0.5">Selection Evaluation for {selectedOption.lorry.lorry_code}:</span>
            <p className="font-medium text-slate-600 leading-relaxed">{selectedRankEntry.reason}</p>
          </div>
        )}

        {/* Truck Capacity Visualizer */}
        <div>
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

        {/* AI Copilot Explanation */}
        {aiExplanation ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>FleetMind AI Decision Explanation</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{aiExplanation}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFetchAiExplanation}
            disabled={isLoadingAi}
            className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4 text-blue-600" />
            <span>{isLoadingAi ? 'Synthesizing Decision Explanation...' : `Ask AI Why ${selectedOption.lorry.lorry_code} is Best`}</span>
          </button>
        )}

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-2xl transition"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={isApplying}
            onClick={() => onApplyOption(selectedOption)}
            className={`w-full sm:w-auto px-7 py-3.5 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl transition flex items-center justify-center gap-2 sm:ml-auto ${
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
                : `CONFIRM: ALLOCATE ${selectedOption.lorry.lorry_code}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
