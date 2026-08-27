'use client';

import React, { useState, useEffect } from 'react';
import {
  ConsolidationAnalysisResult,
  ConsolidationOption,
  Shipment,
} from '../../lib/optimization/types';
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
} from 'lucide-react';
import { VehicleAvatar } from '../brand/vehicle-avatar';

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

  const selectedOption: ConsolidationOption =
    analysis.all_options.find((o) => o.option_id === selectedOptionId) ||
    analysis.recommended_option;

  const isRecommended = selectedOption.option_id === analysis.recommended_option.option_id;
  const isConsolidation = selectedOption.decision_type === 'ADD_TO_EXISTING_TRIP';

  // Fetch AI explanation on demand or initially
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

  return (
    <div className="space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">{opt.lorry.lorry_code}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                          isOptConsolidation ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isOptConsolidation ? 'Consolidate' : 'Dedicated'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {opt.deterministic_score}/100
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium truncate">
                    {opt.existing_corridor}
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 font-bold">
                    <span className="text-slate-500">
                      {isOptConsolidation ? `+${opt.additional_distance_km} km` : `${opt.projected_route_distance_km} km`}
                    </span>
                    <span className={opt.net_savings_inr > 0 ? 'text-emerald-700 font-black' : 'text-slate-700'}>
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
        {/* Carrier & Pilot Profile */}
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
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-slate-900">{selectedOption.lorry.lorry_code}</h4>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {selectedOption.lorry.registration_number}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedOption.lorry.fuel_efficiency_km_per_l} km/L
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Pilot: <strong className="text-slate-800">{selectedOption.driver?.name || 'Assigned Commercial Driver'}</strong> • Status:{' '}
                <span className="text-emerald-600 font-bold uppercase">{selectedOption.lorry.status}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl text-xs space-y-0.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Corridor Flow</span>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>{selectedOption.existing_corridor}</span>
            </div>
          </div>
        </div>

        {/* 4. Segmented Visual Truck Load Gauges (Before vs After) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" /> Projected Vehicle Payload & Volume
            </span>
            <span className="text-xs font-bold text-slate-500">
              Max Payload: {selectedOption.max_weight_kg.toLocaleString()} kg / {selectedOption.max_volume_m3} m³
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">Payload Weight</span>
                <span className="font-mono text-slate-900">
                  <strong>{selectedOption.projected_weight_kg.toLocaleString()}</strong> / {selectedOption.max_weight_kg.toLocaleString()} kg (
                  <strong className={selectedOption.projected_weight_util_pct > 90 ? 'text-amber-600' : 'text-emerald-700'}>
                    {selectedOption.projected_weight_util_pct}%
                  </strong>)
                </span>
              </div>

              {/* Multi-segmented Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex p-0.5">
                {selectedOption.current_weight_util_pct > 0 && (
                  <div
                    className="h-full bg-blue-600 rounded-l-full"
                    style={{ width: `${selectedOption.current_weight_util_pct}%` }}
                    title={`Current Load: ${selectedOption.current_weight_kg} kg`}
                  />
                )}
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{
                    width: `${Math.max(
                      4,
                      selectedOption.projected_weight_util_pct - selectedOption.current_weight_util_pct
                    )}%`,
                  }}
                  title={`New Shipment: ${selectedOption.new_shipment_weight_kg} kg`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Current Cargo ({selectedOption.current_weight_kg} kg)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Proposed (+{selectedOption.new_shipment_weight_kg} kg)
                </span>
                <span className="text-slate-400">Free: {selectedOption.remaining_weight_kg} kg</span>
              </div>
            </div>

            {/* Volume Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">Cargo Hold Volume</span>
                <span className="font-mono text-slate-900">
                  <strong>{selectedOption.projected_volume_m3}</strong> / {selectedOption.max_volume_m3} m³ (
                  <strong className={selectedOption.projected_volume_util_pct > 90 ? 'text-purple-600' : 'text-teal-700'}>
                    {selectedOption.projected_volume_util_pct}%
                  </strong>)
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex p-0.5">
                {selectedOption.current_volume_util_pct > 0 && (
                  <div
                    className="h-full bg-purple-600 rounded-l-full"
                    style={{ width: `${selectedOption.current_volume_util_pct}%` }}
                    title={`Current Volume: ${selectedOption.current_volume_m3} m³`}
                  />
                )}
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                  style={{
                    width: `${Math.max(
                      4,
                      selectedOption.projected_volume_util_pct - selectedOption.current_volume_util_pct
                    )}%`,
                  }}
                  title={`New Volume: ${selectedOption.new_shipment_volume_m3} m³`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" /> Current ({selectedOption.current_volume_m3} m³)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Proposed (+{selectedOption.new_shipment_volume_m3} m³)
                </span>
                <span className="text-slate-400">Free: {selectedOption.remaining_volume_m3} m³</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Metrics & Detour Comparison Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Extra Detour</span>
            <strong className="text-sm font-black text-slate-900">
              +{selectedOption.additional_distance_km} km
            </strong>
            <span className="text-[10px] text-slate-500 block">+{selectedOption.additional_time_minutes} mins</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Extra Diesel</span>
            <strong className="text-sm font-black text-slate-900">
              +{selectedOption.additional_fuel_liters} L
            </strong>
            <span className="text-[10px] text-slate-500 block">₹{selectedOption.additional_fuel_cost_inr.toLocaleString()}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Incremental Cost</span>
            <strong className="text-sm font-black text-slate-900">
              ₹{selectedOption.incremental_cost_inr.toLocaleString()}
            </strong>
            <span className="text-[10px] text-slate-500 block">vs ₹{selectedOption.standalone_new_vehicle_cost_inr.toLocaleString()} (New Lorry)</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 uppercase font-bold block">Net Savings</span>
            <strong className="text-sm font-black text-emerald-700">
              ₹{selectedOption.net_savings_inr.toLocaleString()}
            </strong>
            <span className="text-[10px] text-emerald-600 block font-bold">
              {selectedOption.net_savings_inr > 0 ? 'High Economic Value' : 'Standard Rate'}
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
